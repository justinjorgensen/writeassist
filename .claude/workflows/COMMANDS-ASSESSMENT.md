# Slash Command to Dynamic Workflow Assessment

Assessment of four WriteAssist slash commands for conversion to dynamic workflows.

| Command | Shape | Verdict | Why |
|---|---|---|---|
| `batch-execute-wrp` | Pipeline (write then review, per chapter) | CONVERTED | Mechanical fan-out over a WRP list with a hard cost guard. The `--limit` refusal, the ceiling clamp, and the queue accounting are exactly the kind of deterministic control flow the runtime does better than a prose prompt. Wiring write and review as a `pipeline` lets chapters overlap (review starts as soon as a chapter is written) while keeping each chapter's own stages ordered. Calls the saved `review-chapter` workflow one level deep. |
| `compare-drafts` | Tournament (round-robin pairwise) | CONVERTED | Comparing N drafts is a classic LLM-judge problem where a single N-way ranker blends axes and hides reasoning. A round-robin of scoped pairwise calls, each judged in both directions to cancel position bias, plus a plain-JS Copeland aggregation, gives a reproducible ranking. Determinism (no randomness, index-derived tie-breaks) is a strict win over the freeform original. |
| `curate-chapters` | Fan-out cross-chapter reads | ASSESS ONLY (not converted) | See note below. |
| `validate-transitions` | Fan-out cross-chapter reads | ASSESS ONLY (not converted) | See note below. |

## curate-chapters: recommendation

A workflow conversion is *plausible but low value right now*, so it was left as a command.

The eight curate agents (continuity, timeline, style, grammar, dialogue, sensitivity, theme, reader) overlap heavily with the seven gating critics plus three advisory critics already orchestrated by the existing `review-chapter.js` workflow. Converting curate-chapters would largely re-implement that fan-out with a different label set. The genuinely distinct part is the *cross-chapter* consistency pass (facts aligning across many chapters at once), which is a fan-out-read problem the runtime could express as `parallel` per-chapter reads feeding a single aggregator agent.

Recommendation: do NOT build a standalone curate workflow. Instead, when there is appetite, extend `review-chapter.js` with an optional multi-chapter mode (accept an array of chapters, fan out per-chapter evidence collection, then run ONE cross-chapter continuity aggregator). That reuses the dual-gate machinery instead of duplicating ten critic prompts. The conditional/triggered agents in the command (timeline only on date issues, sensitivity only on flags) map cleanly to plain-JS gating on the first pass's findings.

## validate-transitions: recommendation

A small, clean fan-out, but the payoff over the command is modest, so it was left as a command.

The core is: enumerate consecutive chapter pairs, extract the tail of chapter K and the head of chapter K+1, run the `continuity-checker` agent on each pair, aggregate by severity. That is genuinely a `parallel` fan-out over `N-1` pairs with a JS aggregation, and it is reproducible (pair order is index-derived). It would convert cleanly.

The reason to hold: it is a thin wrapper around a single agent type, the per-pair extraction (last/first ~250 words) is exactly the kind of file work only an agent can do in this runtime, and the existing `review-chapter` already touches continuity per chapter. The highest-leverage move is to fold transition validation INTO the batch and review flows (the command already proposes this integration) rather than ship a separate one-agent workflow. If a standalone is wanted later, it is a ~40-line `parallel`-over-pairs workflow returning `{ pairsChecked, valid, issues:[{ pair, severity, finding }] }`, mirroring the `compare-drafts` pair-enumeration pattern.

## Files created

- `.claude/workflows/batch-execute-wrp.js` (passes `node --check`)
- `.claude/workflows/compare-drafts.js` (passes `node --check`)
