# WriteAssist Dynamic Workflows

This directory is the home for WriteAssist's **runnable dynamic workflows**: saved
JavaScript orchestrations that the Claude Code runtime executes directly. They are the
strict, deterministic counterparts to the light `.claude/commands/` slash commands. Where a
slash command is a prose prompt the model interprets, a workflow is real control flow (fan-out,
pipelines, gates, JS aggregation) with no wall-clock and no randomness, so the same inputs
produce the same orchestration every run.

**Requirements:** dynamic workflows need Claude Code **2.1.154+** (tested on **2.1.168**),
research-preview. If your harness predates that, use the light slash-command paths in
`.claude/commands/` instead; they remain as a hedge and cover the same tasks at lower fidelity.

## How to invoke

Run a saved workflow by its file in this directory and pass `args` as described in each
workflow's header comment. Args accept either a plain path string or a structured object,
depending on the workflow. Each `.js` file's top-of-file comment is the authoritative usage spec.

## Index

| Workflow | Purpose | How to invoke |
|---|---|---|
| `review-chapter.js` | Four-tier dual-gate chapter review: collects skill-script evidence once, fans out the 7 gating critics (Read/Grep/Glob only), runs advisory critics unless `--fast`, adversarially verifies critical-fail findings, and computes the panel plus weighted dual gate in plain JS. | args = a chapter path string (`"chapters/04.md"`) or `{ chapter, wrp, fast }`. WRP path optional; `fast: true` prunes advisory critics. Returns `{ decision, panel, weighted, criticalFail, critics, reason }`. |
| `auto-revise-chapter.js` | Iterative review-and-revise loop: runs `review-chapter`, and while the panel returns REVISE (up to a max-pass cap) spawns a reviser that applies findings by a fixed confidence ladder, commits each pass on its own git worktree/branch, and re-reviews. Stops on first PASS or at the cap. | args = a chapter path string or `{ chapter, wrp, fast, maxPasses }`. WRP forwarded verbatim to review. Returns `{ finalDecision, passes:[{ n, branch, commit, decision }], maxedOut }`. |
| `batch-execute-wrp.js` | Capped, pipelined mass chapter production: for each WRP target, write the chapter then review it via `review-chapter`, wired as a no-barrier pipeline so chapters overlap. Refuses to run without an explicit positive `--limit` and clamps to a hard ceiling. | args = `{ wrps: [...], limit: 2, fast?: true }` or a string of space-separated targets plus a `--limit N` token. Returns `{ ran, limit, total, results:[...], queued }`. |
| `compare-drafts.js` | Round-robin pairwise-comparison tournament over two or more drafts of the same chapter: every pair judged once in both directions to cancel position bias, aggregated into a deterministic Copeland-style ranking in plain JS. | args = `{ chapter?, drafts: [...], rubric?, fast? }` or a string of space-separated draft paths. At least two drafts required. Returns `{ chapter, ranking:[...], pairs:[...], winner }`. |

## Notes

- `review-chapter.js` is the shared engine: both `auto-revise-chapter.js` and
  `batch-execute-wrp.js` call it one level deep, so the dual-gate logic lives in exactly one place.
- The agent type names referenced inside these workflows must match `.claude/agents/<name>.md`
  exactly. The 7 gating critics stay locked to `Read, Grep, Glob`; only creator/reviser agents hold
  write tools.
- `COMMANDS-ASSESSMENT.md` (also in this directory) records why `batch-execute-wrp` and
  `compare-drafts` were converted from slash commands while `curate-chapters` and
  `validate-transitions` were left as commands. Read it before proposing new conversions.
