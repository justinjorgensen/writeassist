/*
 * WriteAssist COMPARE-DRAFTS workflow. Given two or more draft versions of the same chapter, run a
 * round-robin tournament of pairwise-comparison agents and return a ranking of the drafts from
 * strongest to weakest, with the per-pair verdicts that produced it.
 *
 * Why a tournament and not a single ranker: asking one agent to rank N drafts in one shot blends
 * incomparable axes and buries the reasoning. Pairwise judgments are each a small, well-scoped call
 * ("which of THESE TWO is stronger, and why"), and the round-robin aggregates them into a stable
 * order. Every unordered pair {i<j} is judged once, in parallel (BARRIER). Each pair is evaluated
 * in BOTH directions inside the same agent call to neutralize first-mention/position bias, and the
 * agent must agree with itself or declare a tie.
 *
 * Ranking aggregation is plain JS: a draft scores 1 per pairwise win and 0.5 per tie (Copeland-style
 * score). Ties in total score are broken deterministically by the lower draft index, so the result is
 * fully reproducible. No wall-clock or randomness is used; pair ordering is derived from indices.
 *
 * Usage: run this saved workflow with args set to an object
 *   { chapter?: "Chapter-05", drafts: ["…/Chapter-05-v1.0.md", "…/Chapter-05-v1.1.md", …], rubric?: "…", fast?: true }
 * or a string of space-separated draft paths. At least two drafts are required.
 *
 * Returns { chapter, ranking:[{ rank, draft, score, wins, ties, losses }], pairs:[…], winner }.
 */

export const meta = {
  name: 'compare-drafts',
  description: 'Round-robin pairwise-comparison tournament over draft versions of a chapter, aggregated into a deterministic Copeland-style ranking.',
  phases: [
    { title: 'Collect Drafts' },
    { title: 'Pairwise Tournament' },
    { title: 'Aggregate Ranking' },
  ],
};

// ---- Static configuration ------------------------------------------------

// Default comparison rubric. The author can override via args.rubric. Kept axis-explicit so the
// pairwise agents weigh the same dimensions every pass.
const DEFAULT_RUBRIC =
  'Judge overall chapter quality on: prose voice and rhythm, scene/pacing control, dialogue ' +
  'naturalness and character distinction, clarity, hook and momentum, and WRP/canon fidelity. ' +
  'Em-dash usage (U+2014) is a defect: a draft that uses em dashes is weaker on the clarity axis, ' +
  'all else equal.';

// Result of one pairwise comparison. The agent compares A vs B in BOTH directions internally and
// reports a single self-consistent verdict, or 'tie' if the two directions disagree or are even.
const PAIR_SCHEMA = {
  type: 'object',
  required: ['winner', 'rationale', 'consistent'],
  additionalProperties: false,
  properties: {
    // 'A' = the lower-indexed draft of the pair wins; 'B' = the higher-indexed draft wins; 'tie'.
    winner: { type: 'string', enum: ['A', 'B', 'tie'] },
    // true when the two evaluation directions agreed; false collapses the verdict to a tie.
    consistent: { type: 'boolean' },
    rationale: { type: 'string' },
    axisNotes: { type: 'string' },
  },
};

// ---- Helpers -------------------------------------------------------------

function parseArgs(input) {
  if (input && typeof input === 'object' && !Array.isArray(input)) {
    return {
      chapter: input.chapter || null,
      drafts: Array.isArray(input.drafts) ? input.drafts.filter(Boolean) : [],
      rubric: input.rubric || DEFAULT_RUBRIC,
      fast: Boolean(input.fast),
    };
  }
  const tokens = (Array.isArray(input) ? input : String(input || '').trim().split(/\s+/)).filter(Boolean);
  return { chapter: null, drafts: tokens, rubric: DEFAULT_RUBRIC, fast: false };
}

// Enumerate every unordered pair {i<j} once. Pair order is derived purely from indices: no
// randomness, fully reproducible.
function enumeratePairs(n) {
  const pairs = [];
  for (let i = 0; i < n; i += 1) {
    for (let j = i + 1; j < n; j += 1) {
      pairs.push({ i, j });
    }
  }
  return pairs;
}

// Short, stable label for a draft from its path, for reporting.
function draftLabel(draft) {
  return String(draft).split('/').pop() || String(draft);
}

// ---- Workflow body -------------------------------------------------------

  const { chapter, drafts, rubric, fast } = parseArgs(args);

  // --- Phase 1: collect and validate the draft set.
  phase('Collect Drafts');

  if (drafts.length < 2) {
    return {
      chapter,
      ranking: [],
      pairs: [],
      winner: null,
      reason: `Need at least two draft versions to compare; got ${drafts.length}.`,
    };
  }

  const labels = drafts.map(draftLabel);
  log(`Comparing ${drafts.length} draft(s)${chapter ? ` of ${chapter}` : ''}: ${labels.join(', ')}.`);

  const pairList = enumeratePairs(drafts.length);

  // --- Phase 2: run every pair in parallel (BARRIER). Each agent reads BOTH drafts and judges
  // them in both directions internally to cancel position bias.
  phase('Pairwise Tournament');
  log(`Dispatching ${pairList.length} pairwise comparison(s).`);

  const verdicts = (
    await parallel(
      pairList.map(({ i, j }, index) => async () => {
        const draftA = drafts[i];
        const draftB = drafts[j];
        const verdict = await agent(
          `You are a pairwise draft judge for WriteAssist. Two drafts of the same chapter are\n` +
            `given. Decide which is the STRONGER draft, or call a tie. You may ONLY Read/Grep/Glob.\n\n` +
            `Draft A: ${draftA}\n` +
            `Draft B: ${draftB}\n` +
            (chapter ? `Chapter: ${chapter}\n` : '') +
            `\nRubric:\n${rubric}\n\n` +
            (fast
              ? `Fast mode: weigh prose, pacing, and clarity; you may skim canon fidelity.\n\n`
              : `Weigh every axis in the rubric, including WRP/canon fidelity.\n\n`) +
            `BIAS CONTROL (required): evaluate the pair TWICE internally:\n` +
            `   pass 1 - treat A as first, B as second; pick a winner.\n` +
            `   pass 2 - mentally swap them (B first, A second); pick a winner again.\n` +
            `If both passes name the SAME draft, set consistent=true and report that draft as the\n` +
            `winner ('A' for ${draftA}, 'B' for ${draftB}). If the two passes DISAGREE, the result\n` +
            `is not robust: set consistent=false and winner='tie'. If the drafts are genuinely\n` +
            `even, winner='tie', consistent=true.\n\n` +
            `Return winner ('A' | 'B' | 'tie'), consistent, a rationale citing concrete passages,\n` +
            `and axisNotes summarizing per-axis strengths. Pair index: ${index}.`,
          { label: `compare-${i}-vs-${j}`, phase: 'Pairwise Tournament', schema: PAIR_SCHEMA },
        );
        return { i, j, verdict };
      }),
    )
  ).filter(Boolean);

  // --- Phase 3: aggregate the pairwise verdicts into a Copeland-style ranking in plain JS.
  phase('Aggregate Ranking');

  const stats = drafts.map((draft, idx) => ({
    idx,
    draft,
    label: labels[idx],
    wins: 0,
    ties: 0,
    losses: 0,
    score: 0,
  }));

  const pairs = [];
  for (const { i, j, verdict } of verdicts) {
    // An inconsistent verdict is demoted to a tie regardless of the named winner.
    const effective = verdict.consistent === false ? 'tie' : verdict.winner;
    if (effective === 'A') {
      stats[i].wins += 1;
      stats[j].losses += 1;
    } else if (effective === 'B') {
      stats[j].wins += 1;
      stats[i].losses += 1;
    } else {
      stats[i].ties += 1;
      stats[j].ties += 1;
    }
    pairs.push({
      a: labels[i],
      b: labels[j],
      winner: effective === 'A' ? labels[i] : effective === 'B' ? labels[j] : 'tie',
      consistent: verdict.consistent !== false,
      rationale: verdict.rationale,
      axisNotes: verdict.axisNotes || null,
    });
  }

  // Copeland score: 1 per win, 0.5 per tie.
  for (const s of stats) {
    s.score = s.wins + 0.5 * s.ties;
  }

  // Sort by score desc; deterministic tie-break by lower original draft index (no randomness).
  const ordered = stats.slice().sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.idx - b.idx;
  });

  const ranking = ordered.map((s, rankIdx) => ({
    rank: rankIdx + 1,
    draft: s.draft,
    label: s.label,
    score: s.score,
    wins: s.wins,
    ties: s.ties,
    losses: s.losses,
  }));

  const winner = ranking.length ? ranking[0].draft : null;
  log(`Tournament complete. Winner: ${ranking.length ? ranking[0].label : 'none'}.`);

  return { chapter, ranking, pairs, winner };
