/*
 * WriteAssist BATCH-EXECUTE-WRP workflow. Mass chapter production: take a list of WRP (Writing
 * Requirements Profile) targets and run each one through the full per-chapter pipeline,
 * write the chapter from its WRP, then REVIEW it by calling the saved review-chapter workflow.
 *
 * The two stages are wired as a pipeline (write -> review) so a chapter starts its review as
 * soon as it is written, rather than waiting for every chapter to finish writing first. pipeline
 * has NO barrier, so chapters overlap and the run stays concurrency friendly while each chapter's
 * own two stages stay ordered (a chapter is never reviewed before it is written).
 *
 * MANDATORY --limit N guard: this workflow REFUSES to run without an explicit positive limit, and
 * caps any single run at HARD_CEILING. Cost scales linearly with chapter count, so the limit (and
 * the refusal-without-limit) is what keeps a batch interruptible and the spend visible. WRPs beyond
 * the limit are returned as "queued, not run" so the author starts the next batch deliberately.
 *
 * Usage: run this saved workflow with args set to either an object
 *   { wrps: ["05-wrp/ch-01.md", ...], limit: 2, fast?: true }
 * or a string of space-separated targets plus a --limit token, e.g.
 *   "05-wrp/ch-01.md 05-wrp/ch-02.md --limit 2".
 *
 * No wall-clock or randomness is used; per-chapter variation comes from the WRP index. Stamp real
 * timestamps after the run if you need them, and fold new canon into story-compendium.md via the
 * writer agent (which has full tools), never from this workflow (it has no filesystem access).
 *
 * Returns { ran, limit, total, results:[{ wrp, chapter, written, decision, reason }], queued }.
 */

export const meta = {
  name: 'batch-execute-wrp',
  description: 'Capped, pipelined mass chapter production: write each WRP then review it via the review-chapter workflow, guarded by a mandatory --limit.',
  phases: [
    { title: 'Validate & Plan' },
    { title: 'Write & Review Pipeline' },
    { title: 'Batch Summary' },
  ],
};

// ---- Static configuration ------------------------------------------------

// Hard ceiling on a single invocation, even when the author asks for more. Larger jobs run as
// repeated capped batches so cost stays visible and the run stays interruptible.
const HARD_CEILING = 10;

const REVIEW_REF = 'review-chapter'; // saved workflow name; resolves the sibling review-chapter workflow portably

// Schema the writer agent must return after drafting the chapter from its WRP and updating canon.
const WRITER_SCHEMA = {
  type: 'object',
  required: ['chapter', 'written'],
  additionalProperties: false,
  properties: {
    chapter: { type: 'string' },
    written: { type: 'boolean' },
    wordCount: { type: 'number' },
    canonUpdated: { type: 'boolean' },
    summary: { type: 'string' },
  },
};

// ---- Helpers -------------------------------------------------------------

// Parse args into { wrps, limit, fast }. Accepts an object form or a raw command-style string with
// space-separated WRP targets and a "--limit N" token. The limit is intentionally NOT defaulted:
// a missing/invalid limit must surface as null so the workflow can refuse.
function parseArgs(input) {
  if (input && typeof input === 'object' && !Array.isArray(input)) {
    const rawLimit = Number(input.limit);
    return {
      wrps: Array.isArray(input.wrps) ? input.wrps.filter(Boolean) : [],
      limit: Number.isFinite(rawLimit) ? rawLimit : null,
      fast: Boolean(input.fast),
    };
  }

  // String / array fallback: tokenize and pull a --limit N (or --limit=N) token out.
  const tokens = (Array.isArray(input) ? input.join(' ') : String(input || '')).trim().split(/\s+/).filter(Boolean);
  let limit = null;
  const wrps = [];
  for (let i = 0; i < tokens.length; i += 1) {
    const tok = tokens[i];
    if (tok === '--limit') {
      const next = tokens[i + 1];
      limit = next === undefined ? null : Number(next);
      i += 1;
    } else if (tok.startsWith('--limit=')) {
      limit = Number(tok.slice('--limit='.length));
    } else if (tok === '--fast') {
      // handled below via flag scan; keep it out of the wrps list
    } else {
      wrps.push(tok);
    }
  }
  const fast = tokens.includes('--fast');
  return { wrps, limit, fast };
}

// The limit is valid only when it is a positive integer within the hard ceiling. Missing, zero,
// negative, non-numeric, or above-ceiling all fail validation (the last is clamped, not rejected,
// per the spec: "even when the author asks for more, cap a single invocation at the ceiling").
function resolveLimit(limit) {
  if (limit === null || !Number.isFinite(limit)) return { ok: false, reason: 'no --limit supplied' };
  if (limit <= 0) return { ok: false, reason: '--limit must be a positive integer' };
  if (!Number.isInteger(limit)) return { ok: false, reason: '--limit must be a whole number' };
  const capped = Math.min(limit, HARD_CEILING);
  return { ok: true, value: capped, clamped: capped < limit };
}

// Derive a stable, human chapter id from a WRP path, with no randomness. Falls back to a slug.
function chapterIdFromWrp(wrp) {
  const base = String(wrp).split('/').pop() || String(wrp);
  const numMatch = base.match(/(\d+)/);
  if (numMatch) return numMatch[1].padStart(2, '0');
  return base.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'chapter';
}

// ---- Workflow body -------------------------------------------------------

  const { wrps, limit, fast } = parseArgs(args);

  // --- Phase 1: validate the --limit guard and plan the batch.
  phase('Validate & Plan');

  if (!wrps.length) {
    return {
      ran: 0,
      limit: null,
      total: 0,
      results: [],
      queued: [],
      reason: 'No WRP targets supplied in args.',
    };
  }

  const limitCheck = resolveLimit(limit);
  if (!limitCheck.ok) {
    // REFUSE: do not guess, do not default to "all". Report the count and a suggested small limit.
    const suggested = Math.min(2, wrps.length);
    log(`Refusing: ${limitCheck.reason}. ${wrps.length} WRP(s) matched.`);
    return {
      ran: 0,
      limit: null,
      total: wrps.length,
      results: [],
      queued: wrps.slice(),
      reason:
        `Refused: ${limitCheck.reason}. ${wrps.length} WRP(s) matched. ` +
        `Re-run with an explicit small limit, e.g. --limit ${suggested} (hard ceiling ${HARD_CEILING}).`,
    };
  }

  const effectiveLimit = limitCheck.value;
  const toRun = wrps.slice(0, effectiveLimit);
  const queued = wrps.slice(effectiveLimit);

  log(
    `Planned batch: ${toRun.length} of ${wrps.length} WRP(s)` +
      (limitCheck.clamped ? ` (requested ${limit}, clamped to ceiling ${HARD_CEILING})` : ` (limit ${effectiveLimit})`) +
      (fast ? ', review in fast mode' : '') +
      '.',
  );

  // --- Phase 2: pipeline each in-limit WRP through write -> review.
  phase('Write & Review Pipeline');
  log(`Pipelining ${toRun.length} chapter(s): write then review, overlapping across chapters.`);

  // Stage 1 (write): a full-tool writer agent drafts the chapter from its WRP into 02-Manuscript/,
  // runs the em-dash guard, and folds new canon into story-compendium.md. Returns where it wrote.
  const writeStage = async (wrp, index) => {
    const chapterId = chapterIdFromWrp(wrp);
    const written = await agent(
      `You are the WriteAssist chapter writer. You have full tools (Read, Edit, Write, Bash).\n` +
        `Write ONE chapter from its WRP, the same engine as /execute-wrp, then update canon.\n\n` +
        `WRP file: ${wrp}\n` +
        `Chapter index in this batch: ${index}\n\n` +
        `STEP 1 - Pre-flight. Confirm the WRP parses and that story-compendium.md and\n` +
        `author-rules.md exist. Read the previous chapter(s) in 02-Manuscript/ for continuity\n` +
        `context. If a required input is missing, return written=false with a summary saying why\n` +
        `and do NOT write a partial chapter.\n\n` +
        `STEP 2 - Write the chapter from the WRP into 02-Manuscript/ (derive the filename from the\n` +
        `WRP, e.g. Chapter-${chapterId}-<Title>.md). Honor author-rules.md.\n\n` +
        `STEP 3 - Em-dash guard (HARD). The finished chapter MUST contain ZERO em dashes\n` +
        `(U+2014). Sweep the file and rewrite any with commas, periods, or parentheses. A chapter\n` +
        `that would contain an em dash cannot be saved.\n\n` +
        `STEP 4 - Fold any new canon from this chapter (characters, timeline, world details) back\n` +
        `into story-compendium.md so later chapters in the batch stay consistent.\n\n` +
        `Return JSON: the chapter path you wrote, written=true on success, the wordCount, whether\n` +
        `you updated canon, and a short summary. Do not invent precise critic scores.`,
      { label: `write-${chapterId}`, phase: 'Write & Review Pipeline', schema: WRITER_SCHEMA },
    );
    return { wrp, chapterId, written };
  };

  // Stage 2 (review): hand the freshly written chapter to the saved review-chapter workflow. If the
  // write failed, skip the review and carry the failure forward so the summary stays honest.
  const reviewStage = async (prev) => {
    const { wrp, chapterId, written } = prev;
    if (!written || !written.written || !written.chapter) {
      return {
        wrp,
        chapter: written && written.chapter ? written.chapter : null,
        written: false,
        decision: 'SKIPPED',
        reason: (written && written.summary) || 'write stage failed; review skipped',
      };
    }

    const review = await workflow(REVIEW_REF, { chapter: written.chapter, wrp, fast });
    const decision = review && review.decision === 'PASS' ? 'PASS' : 'REVISE';
    return {
      wrp,
      chapter: written.chapter,
      written: true,
      decision,
      reason: (review && review.reason) || null,
    };
  };

  // pipeline: per-item staged, no barrier. Stage callbacks receive (prev, originalItem, index).
  const results = await pipeline(
    toRun,
    (wrp, index) => writeStage(wrp, index),
    (prev) => reviewStage(prev),
  );

  // --- Phase 3: batch summary + queue state.
  phase('Batch Summary');

  const ranCount = results.filter((r) => r && r.written).length;
  log(`Batch run: ${ranCount} written of ${toRun.length} attempted; ${queued.length} queued, not run.`);

  return {
    ran: ranCount,
    limit: effectiveLimit,
    total: wrps.length,
    results: results.map((r) =>
      r || { wrp: null, chapter: null, written: false, decision: 'SKIPPED', reason: 'stage returned null' },
    ),
    queued,
  };
