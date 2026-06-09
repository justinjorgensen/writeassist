/*
 * WriteAssist AUTO-REVISE workflow. Drives a chapter through the four-tier dual-gate REVIEW
 * workflow, and while the panel returns REVISE (up to a max-iteration cap) it spawns a reviser
 * agent that applies the review findings by a fixed confidence ladder, commits each pass on its
 * own git worktree+branch (revise/chapter-XX-pass-N, baseRef HEAD so an in-progress chapter is
 * not lost), and re-reviews the result. Stops on the first PASS or when the cap is hit.
 *
 * Usage: run this saved workflow with args set to either a chapter path string
 * ("chapters/04.md") or an object { chapter, wrp, fast, maxPasses }. The WRP (Writing
 * Requirements Profile) is optional and is forwarded verbatim to the review workflow.
 *
 * Confidence ladder applied by the reviser, per finding (a finding's confidence is the parent
 * critic's confidence; an em-dash removal finding is forced to 1.0):
 *   conf >= 0.95          -> auto-apply the fix in place
 *   0.90 <= conf < 0.95   -> apply inline, tagged with an [AR-NNN] marker
 *   0.85 <= conf < 0.90   -> leave a suggest-only comment, do not change prose
 *   conf <  0.85          -> skip entirely
 *   em-dash removal        -> forced to confidence 1.0 (always auto-apply)
 *
 * No wall-clock or randomness is used; pass numbers and finding indices supply all variation.
 * Stamp real timestamps after the run if you need them.
 *
 * Returns { finalDecision, passes:[{ n, branch, commit, decision }], maxedOut }.
 */

export const meta = {
  name: 'auto-revise-chapter',
  description: 'Iteratively review-and-revise a chapter on per-pass git worktrees until the dual-gate panel passes or a max-iteration cap is reached.',
  phases: [
    { title: 'Initial Review' },
    { title: 'Revision Loop' },
    { title: 'Final Report' },
  ],
};

// ---- Static configuration ------------------------------------------------

const DEFAULT_MAX_PASSES = 5;

const REVIEW_REF = 'review-chapter'; // saved workflow name; resolves the sibling review-chapter workflow portably

// Confidence ladder thresholds (see header).
const LADDER = {
  autoApply: 0.95,
  inlineMarker: 0.90,
  suggestOnly: 0.85,
};

// Schema the reviser agent must return after applying fixes and committing.
const REVISER_SCHEMA = {
  type: 'object',
  required: ['branch', 'commit', 'worktree', 'applied'],
  additionalProperties: false,
  properties: {
    branch: { type: 'string' },
    commit: { type: 'string' },
    worktree: { type: 'string' },
    applied: {
      type: 'array',
      items: {
        type: 'object',
        required: ['ref', 'action'],
        additionalProperties: false,
        properties: {
          ref: { type: 'string' },
          action: { type: 'string', enum: ['auto-apply', 'inline-marker', 'suggest-only', 'skip', 'em-dash'] },
          note: { type: 'string' },
        },
      },
    },
    summary: { type: 'string' },
  },
};

// ---- Helpers -------------------------------------------------------------

function parseArgs(input) {
  if (typeof input === 'string') return { chapter: input, wrp: null, fast: false, maxPasses: DEFAULT_MAX_PASSES };
  const obj = input || {};
  const cap = Number(obj.maxPasses);
  return {
    chapter: obj.chapter || obj.path || null,
    wrp: obj.wrp || null,
    fast: Boolean(obj.fast),
    maxPasses: Number.isFinite(cap) && cap > 0 ? Math.floor(cap) : DEFAULT_MAX_PASSES,
  };
}

// Zero-pad a chapter id pulled from the chapter path, for the branch name. Falls back to a
// sanitized slug of the whole path when no number is present. No randomness; derived purely
// from the path string.
function chapterSlug(chapter) {
  const base = String(chapter).split('/').pop() || String(chapter);
  const numMatch = base.match(/(\d+)/);
  if (numMatch) return numMatch[1].padStart(2, '0');
  return base.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'chapter';
}

// Decide a finding's ladder bucket from its effective confidence. Em-dash removals are forced
// to 1.0 upstream, so they always land in auto-apply.
function ladderBucket(confidence) {
  if (confidence >= LADDER.autoApply) return 'auto-apply';
  if (confidence >= LADDER.inlineMarker) return 'inline-marker';
  if (confidence >= LADDER.suggestOnly) return 'suggest-only';
  return 'skip';
}

// Pull every actionable finding out of a review result and stamp it with the ladder bucket and
// a stable ref. The parent critic's confidence is the finding's confidence; a finding whose
// title/evidence mentions an em dash is forced to confidence 1.0 (em-dash bucket).
function collectFindings(review) {
  const out = [];
  const critics = Array.isArray(review.critics) ? review.critics : [];
  const advisory = Array.isArray(review.advisory) ? review.advisory : [];
  const sources = critics
    .map((c) => ({ agentType: c.agentType, confidence: c.confidence, findings: c.findings, gating: true }))
    .concat(advisory.map((a) => ({ agentType: a.agentType, confidence: a.confidence, findings: a.findings, gating: false })));

  let counter = 0;
  for (const src of sources) {
    const findings = Array.isArray(src.findings) ? src.findings : [];
    for (let i = 0; i < findings.length; i += 1) {
      const f = findings[i];
      const blob = `${f.title || ''} ${f.evidence || ''}`.toLowerCase();
      const EM_DASH = String.fromCharCode(0x2014);
      const isEmDash = blob.includes('em dash') || blob.includes('em-dash') || blob.includes(EM_DASH);
      const confidence = isEmDash ? 1.0 : (typeof src.confidence === 'number' ? src.confidence : 0);
      const bucket = isEmDash ? 'em-dash' : ladderBucket(confidence);
      counter += 1;
      const ref = `AR-${String(counter).padStart(3, '0')}`;
      out.push({
        ref,
        critic: src.agentType,
        gating: src.gating,
        confidence,
        bucket,
        title: f.title || '',
        severity: f.severity || 'soft',
        evidence: f.evidence || '',
        location: f.location || '',
      });
    }
  }
  return out;
}

// ---- Workflow body -------------------------------------------------------

  const { chapter, wrp, fast, maxPasses } = parseArgs(args);

  if (!chapter) {
    return {
      finalDecision: 'REVISE',
      passes: [],
      maxedOut: false,
      reason: 'No chapter path supplied in args.',
    };
  }

  const reviewArgs = { chapter, wrp, fast };
  const slug = chapterSlug(chapter);
  const passes = [];

  // --- Phase 1: initial review of the chapter as it stands on HEAD.
  phase('Initial Review');
  log(`Reviewing ${chapter}${wrp ? ` against WRP ${wrp}` : ''} (max ${maxPasses} passes).`);

  let review = await workflow(REVIEW_REF, reviewArgs);
  let decision = review && review.decision === 'PASS' ? 'PASS' : 'REVISE';

  // Record the baseline review as pass 0 (no branch/commit; it only judges HEAD).
  passes.push({ n: 0, branch: null, commit: null, decision });

  if (decision === 'PASS') {
    phase('Final Report');
    log('Chapter passed on the first review; no revision needed.');
    return { finalDecision: 'PASS', passes, maxedOut: false };
  }

  // --- Phase 2: revise-then-re-review loop, capped at maxPasses revision passes.
  phase('Revision Loop');

  let maxedOut = false;
  for (let n = 1; n <= maxPasses; n += 1) {
    log(`Revision pass ${n}/${maxPasses}.`);

    const branch = `revise/chapter-${slug}-pass-${n}`;
    const findings = collectFindings(review);
    const actionable = findings.filter((f) => f.bucket !== 'skip');

    // The reviser runs in its OWN git worktree+branch off HEAD, so an in-progress chapter on
    // the working tree is never clobbered. It applies the ladder, commits with pass metadata,
    // and returns the branch + commit id.
    const reviserPrompt =
      `You are the WriteAssist reviser. Apply review findings to a chapter, on an ISOLATED git\n` +
      `worktree+branch, then commit. You have full tools (Read, Edit, Write, Bash).\n\n` +
      `Chapter file: ${chapter}\n` +
      `Pass number: ${n}\n` +
      `Target branch: ${branch}\n` +
      `Gate result that triggered this pass: ${JSON.stringify({ decision: review.decision, reason: review.reason || null })}\n\n` +
      `STEP 1 - Isolate. Use a NEW git worktree based on HEAD so the current working tree is not\n` +
      `disturbed (baseRef = HEAD):\n` +
      `    git worktree add -b ${branch} ../.ar-worktrees/${branch.replace(/\\//g, '_')} HEAD\n` +
      `Do ALL edits inside that worktree's checkout of ${chapter}. If the branch already exists,\n` +
      `reuse it (omit -b) or suffix the worktree path; never touch the main working tree.\n\n` +
      `STEP 2 - Apply the confidence ladder to each finding below. The "bucket" field is already\n` +
      `computed for you; honor it exactly:\n` +
      `    auto-apply    -> make the fix directly in the prose.\n` +
      `    inline-marker -> make the fix AND tag the changed span with the finding's ref in\n` +
      `                     square brackets, e.g. [${'$'}{ref}], so the author can audit it.\n` +
      `    suggest-only  -> do NOT change prose; leave a brief comment/annotation describing the\n` +
      `                     suggested change near the location.\n` +
      `    em-dash       -> remove every em dash (U+2014) involved and rewrite with commas,\n` +
      `                     periods, or parentheses. Em-dash removal is forced and always applied.\n` +
      `    skip          -> already filtered out; do nothing.\n` +
      `As a global rule, the finished chapter MUST contain ZERO em dashes (U+2014) regardless of\n` +
      `whether a finding flagged them; sweep the file and remove any that remain.\n\n` +
      `Findings to action (already filtered to actionable buckets):\n` +
      `${JSON.stringify(actionable, null, 2)}\n\n` +
      `STEP 3 - Commit on ${branch} with metadata in the message body. Use exactly this shape:\n` +
      `    chapter: ${chapter}\n` +
      `    pass: ${n}\n` +
      `    gate: ${review.decision}\n` +
      `    findings_applied: <count of auto-apply + inline-marker + em-dash + suggest-only you acted on>\n` +
      `Commit only the chapter (and any sidecar suggestion file you created).\n\n` +
      `STEP 4 - Return JSON: the branch name, the ABSOLUTE path of the worktree you created (as\n` +
      `"worktree"), the FULL commit sha you just created, and an\n` +
      `"applied" array (one entry per finding with its ref and the action you took:\n` +
      `auto-apply | inline-marker | suggest-only | skip | em-dash). Add a short "summary".`;

    const revision = await agent(reviserPrompt, {
      label: `reviser-pass-${n}`,
      phase: 'Revision Loop',
      schema: REVISER_SCHEMA,
      isolation: 'worktree',
    });

    // Re-review the REVISED chapter inside its worktree, not the untouched HEAD copy.
    const revisedChapter = revision.worktree ? `${revision.worktree}/${chapter}` : chapter;
    const revisedWrp = revision.worktree && wrp ? `${revision.worktree}/${wrp}` : wrp;
    review = await workflow(REVIEW_REF, { chapter: revisedChapter, wrp: revisedWrp, fast });
    decision = review && review.decision === 'PASS' ? 'PASS' : 'REVISE';

    passes.push({ n, branch: revision.branch || branch, commit: revision.commit || null, decision });

    if (decision === 'PASS') {
      log(`Pass ${n} achieved PASS.`);
      maxedOut = false;
      break;
    }

    if (n === maxPasses) {
      log(`Hit the ${maxPasses}-pass cap without a PASS.`);
      maxedOut = true;
    }
  }

  // --- Phase 3: report.
  phase('Final Report');
  const finalDecision = decision === 'PASS' ? 'PASS' : 'REVISE';
  log(`Auto-revise finished: ${finalDecision} after ${passes.length - 1} revision pass(es).`);

  return { finalDecision, passes, maxedOut };
