/*
 * WriteAssist REVIEW workflow (four-tier, dual-gate). Usage: run this saved workflow with
 * args set to either a chapter path string ("chapters/04.md") or an object
 * { chapter, wrp, fast }. A WRP (Writing Requirements Profile) path is optional; pass
 * `fast: true` to prune the advisory critics. The workflow first spawns ONE full-tool agent
 * to run the repo skill scripts (prose-metrics, wrp-conformance, canon-lookup) and collects
 * their JSON as shared evidence, then fans out the 7 gating critics (each restricted to
 * Read/Grep/Glob, so they cite the injected evidence rather than running scripts), runs the
 * advisory critics unless --fast, adversarially verifies only critical-fail findings, computes
 * the panel + weighted dual gate in plain JS, and returns
 * { decision, panel, weighted, criticalFail, critics, reason }. No wall-clock or randomness is
 * used; variation comes from the item index. Stamp timestamps after the run if needed.
 */

export const meta = {
  name: 'review-chapter',
  description: 'Four-tier dual-gate chapter review with skill-injected evidence and selective adversarial verification.',
  phases: [
    { title: 'Metrics & Evidence' },
    { title: 'Critic Panel' },
    { title: 'Advisory Review' },
    { title: 'Adversarial Verification' },
    { title: 'Gate Decision' },
  ],
};

// ---- Static configuration ------------------------------------------------

const TIER_VALUE = {
  'Strong Pass': 10,
  'Pass': 8,
  'Needs Work': 6,
  'Fail': 4,
};

const PASSING_TIERS = new Set(['Pass', 'Strong Pass']);

// Gating critics in weight order. agentType names must match .claude/agents/<name>.md exactly.
const GATING_CRITICS = [
  { agentType: 'continuity-checker', weight: 0.20, criticalOnFail: 'any' },
  { agentType: 'rule-enforcer', weight: 0.15, criticalOnFail: 'conf90' },
  { agentType: 'voice-consistency', weight: 0.15, criticalOnFail: 'conf90' },
  { agentType: 'character-critic', weight: 0.15, criticalOnFail: null },
  { agentType: 'pacing-master', weight: 0.125, criticalOnFail: null },
  { agentType: 'dialogue-coach', weight: 0.125, criticalOnFail: null },
  { agentType: 'engagement-critic', weight: 0.10, criticalOnFail: null },
];

const ADVISORY_CRITICS = ['sensitivity-reviewer', 'thematic-guide', 'grammar-clarity'];

const CRITIC_SCHEMA = {
  type: 'object',
  required: ['tier', 'confidence', 'findings'],
  additionalProperties: false,
  properties: {
    tier: { type: 'string', enum: ['Strong Pass', 'Pass', 'Needs Work', 'Fail'] },
    confidence: { type: 'number', minimum: 0, maximum: 1 },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        required: ['title', 'severity', 'evidence', 'location'],
        additionalProperties: false,
        properties: {
          title: { type: 'string' },
          severity: { type: 'string', enum: ['hard', 'soft'] },
          evidence: { type: 'string' },
          location: { type: 'string' },
        },
      },
    },
  },
};

const REFUTE_SCHEMA = {
  type: 'object',
  required: ['overturned', 'rationale'],
  additionalProperties: false,
  properties: {
    overturned: { type: 'boolean' },
    rationale: { type: 'string' },
  },
};

// ---- Helpers -------------------------------------------------------------

function parseArgs(input) {
  if (typeof input === 'string') return { chapter: input, wrp: null, fast: false };
  const obj = input || {};
  return {
    chapter: obj.chapter || obj.path || null,
    wrp: obj.wrp || null,
    fast: Boolean(obj.fast),
  };
}

// A critic's Fail forces REVISE regardless of the gates when:
//   continuity -> Fail at any confidence
//   rules/voice -> Fail with confidence >= 0.90
function isCriticalFail(critic, result) {
  if (result.tier !== 'Fail') return false;
  if (critic.criticalOnFail === 'any') return true;
  if (critic.criticalOnFail === 'conf90') return result.confidence >= 0.90;
  return false;
}

// ---- Workflow body -------------------------------------------------------

  const { chapter, wrp, fast } = parseArgs(args);
  if (!chapter) {
    return {
      decision: 'REVISE',
      panel: { passing: 0, total: GATING_CRITICS.length, ok: false },
      weighted: { sum: 0, ok: false },
      criticalFail: null,
      critics: [],
      reason: 'No chapter path supplied in args.',
    };
  }

  // --- Phase 1: run the skill scripts via ONE full-tool agent and collect JSON evidence.
  phase('Metrics & Evidence');
  log(`Running skill scripts on ${chapter}` + (wrp ? ` against WRP ${wrp}` : ''));

  const wrpStep = wrp
    ? `   - python3 .claude/skills/wrp-conformance/conformance.py ${chapter} ${wrp}\n`
    : '   - (no WRP supplied; skip wrp-conformance)\n';

  const evidenceSchema = {
    type: 'object',
    required: ['metrics', 'conformance', 'canon'],
    additionalProperties: false,
    properties: {
      metrics: { type: 'object', additionalProperties: true },
      conformance: { type: ['object', 'null'], additionalProperties: true },
      canon: { type: 'array', items: { type: 'object', additionalProperties: true } },
      summary: { type: 'string' },
    },
  };

  const evidence = await agent(
    `You have full tools. Run the WriteAssist skill scripts on the chapter and return their RAW JSON.\n` +
      `Chapter: ${chapter}\n` +
      `Steps:\n` +
      `   - python3 .claude/skills/prose-metrics/metrics.py ${chapter}\n` +
      wrpStep +
      `   - For each proper noun / named entity in the chapter, run\n` +
      `     python3 .claude/skills/canon-lookup/canon.py query "<entity>"\n` +
      `Collect each script's stdout as parsed JSON. Put prose metrics under "metrics",\n` +
      `wrp-conformance output under "conformance" (null if no WRP), and the array of\n` +
      `canon-lookup results under "canon". Add a short human "summary". Do not editorialize\n` +
      `beyond what the scripts report.`,
    { label: 'skill-metrics', phase: 'Metrics & Evidence', schema: evidenceSchema },
  );

  const injected = JSON.stringify(
    { metrics: evidence.metrics, conformance: evidence.conformance, canon: evidence.canon },
    null,
    2,
  );

  // --- Phase 2: fan out the 7 gating critics in parallel (BARRIER).
  phase('Critic Panel');
  log('Dispatching 7 gating critics with injected skill evidence.');

  const criticResults = await parallel(
    GATING_CRITICS.map((critic, index) => async () => {
      const result = await agent(
        `Review chapter ${chapter}${wrp ? ` against WRP ${wrp}` : ''} for your specialty.\n` +
          `You may ONLY Read/Grep/Glob; you cannot run scripts. The following machine-generated\n` +
          `skill evidence has already been computed for this chapter. You MUST cite the relevant\n` +
          `numbers from it in your findings rather than estimating:\n\n` +
          `<skill-evidence>\n${injected}\n</skill-evidence>\n\n` +
          `Return your tier, confidence (0..1), and findings. Mark each finding severity "hard"\n` +
          `(objective/gating defect) or "soft" (taste/preference). Critic index: ${index}.`,
        {
          label: critic.agentType,
          phase: 'Critic Panel',
          agentType: critic.agentType,
          schema: CRITIC_SCHEMA,
        },
      );
      return { critic, result };
    }),
  );

  // parallel turns a failed thunk into null; drop those.
  const panel = criticResults.filter(Boolean);

  // --- Phase 3: advisory critics (informational, never gate). Pruned on --fast or when
  // author-rules.md declares no sensitivity constraint (signalled via args.fast or evidence).
  phase('Advisory Review');
  let advisory = [];
  if (fast) {
    log('Fast mode: advisory critics pruned.');
  } else {
    log('Running advisory critics (non-gating).');
    advisory = (
      await parallel(
        ADVISORY_CRITICS.map((name) => async () => {
          const result = await agent(
            `Advisory review of chapter ${chapter}. You are INFORMATIONAL and do NOT gate the\n` +
              `decision. You may ONLY Read/Grep/Glob. Cite the injected evidence where relevant:\n\n` +
              `<skill-evidence>\n${injected}\n</skill-evidence>\n\n` +
              `Return tier, confidence, and findings.`,
            { label: name, phase: 'Advisory Review', agentType: name, schema: CRITIC_SCHEMA },
          );
          return { agentType: name, advisory: true, result };
        }),
      )
    ).filter(Boolean);
  }

  // --- Phase 4: selective adversarial verification. ONLY verify findings that would trigger a
  // critical-fail. A refuter agent tries to overturn the verdict; if it succeeds, the
  // critical-fail no longer forces REVISE. We never verify soft taste findings.
  phase('Adversarial Verification');

  const criticalCandidates = panel.filter(({ critic, result }) => isCriticalFail(critic, result));

  let criticalFail = null;
  if (criticalCandidates.length === 0) {
    log('No critical-fail candidates to verify.');
  } else {
    log(`Verifying ${criticalCandidates.length} critical-fail candidate(s).`);
    const verified = await parallel(
      criticalCandidates.map(({ critic, result }, index) => async () => {
        const hardFindings = result.findings.filter((f) => f.severity === 'hard');
        const refutation = await agent(
          `A gating critic (${critic.agentType}) returned a FAIL verdict (confidence ` +
            `${result.confidence}) on chapter ${chapter} that would force a REVISE decision.\n` +
            `Your job is to REFUTE it: read the chapter and the injected evidence and determine\n` +
            `whether the Fail-level findings actually hold. Only consider the HARD findings:\n` +
            `${JSON.stringify(hardFindings, null, 2)}\n\n` +
            `<skill-evidence>\n${injected}\n</skill-evidence>\n\n` +
            `Set overturned=true ONLY if the chapter + evidence clearly disproves the critic.\n` +
            `Candidate index: ${index}.`,
          { label: `refute-${critic.agentType}`, phase: 'Adversarial Verification', schema: REFUTE_SCHEMA },
        );
        return { critic, result, refutation };
      }),
    );

    // The decisive critical-fail is the first verified candidate the refuter did NOT overturn.
    for (const v of verified.filter(Boolean)) {
      if (!v.refutation.overturned) {
        criticalFail = {
          agentType: v.critic.agentType,
          confidence: v.result.confidence,
          refuterRationale: v.refutation.rationale,
        };
        break;
      }
    }
  }

  // --- Phase 5: dual-gate decision in plain JS.
  phase('Gate Decision');

  const passingCount = panel.filter(({ result }) => PASSING_TIERS.has(result.tier)).length;
  const panelOk = passingCount >= 5;

  const weightedSum = panel.reduce(
    (acc, { critic, result }) => acc + critic.weight * (TIER_VALUE[result.tier] || 0),
    0,
  );
  const weightedOk = weightedSum >= 7.0;

  const decision = panelOk && weightedOk && !criticalFail ? 'PASS' : 'REVISE';

  const reasons = [];
  if (!panelOk) reasons.push(`panel gate failed (${passingCount}/${panel.length} passing, need 5)`);
  if (!weightedOk) reasons.push(`weighted gate failed (${weightedSum.toFixed(3)} < 7.0)`);
  if (criticalFail) reasons.push(`critical-fail override by ${criticalFail.agentType}`);
  const reason = decision === 'PASS' ? 'Both gates passed and no critical-fail.' : reasons.join('; ');

  return {
    decision,
    panel: { passing: passingCount, total: panel.length, ok: panelOk },
    weighted: { sum: Number(weightedSum.toFixed(3)), ok: weightedOk },
    criticalFail,
    critics: panel.map(({ critic, result }) => ({
      agentType: critic.agentType,
      weight: critic.weight,
      tier: result.tier,
      tierValue: TIER_VALUE[result.tier] || 0,
      confidence: result.confidence,
      passing: PASSING_TIERS.has(result.tier),
      findings: result.findings,
    })),
    advisory: advisory.map(({ agentType, result }) => ({
      agentType,
      tier: result.tier,
      confidence: result.confidence,
      findings: result.findings,
    })),
    evidenceSummary: evidence.summary || null,
    reason,
  };
