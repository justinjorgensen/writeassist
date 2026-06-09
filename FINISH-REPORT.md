# WriteAssist Build Report

Build train summary for the dynamic-workflow conversion and agent-wiring work on `writeassist-public`. All checks below were re-run fresh for this report.

## 1. Generated workflows

Two primary workflows were generated and verified:

- `.claude/workflows/review-chapter.js`
  - `node --check` produced no output and exited 0. SYNTAX OK.
  - Shared review engine: four-tier dual-gate review. Collects skill-script evidence once, fans out the 7 gating critics (Read/Grep/Glob only), runs advisory critics unless `--fast`, adversarially verifies critical-fail findings, and computes the panel plus weighted dual gate in plain JS.
- `.claude/workflows/auto-revise-chapter.js`
  - `node --check` passed (exit 0, "CHECK_OK"). PASSES.
  - Iterative review-and-revise loop. Calls `review-chapter` one level deep (via `REVIEW_REF.scriptPath`), applies findings by a fixed confidence ladder, commits each pass on its own git worktree/branch, and re-reviews until first PASS or the max-pass cap.

Literal em dash (U+2014) verification on the workflow files: `grep -o` count = 0 for every `.js`. Confirmed.

## 2. Agent wiring

Seven agents were wired with a "Skills available to you" block instructing each read-only critic to cite orchestrator-injected evidence (for example prose-metrics JSON fields, wrp-conformance beat-delivery) rather than estimating by eye. All seven now carry the block:

| Agent | Wired |
|---|---|
| pacing-master | YES |
| engagement-critic | YES |
| voice-consistency | YES |
| dialogue-coach | YES |
| continuity-checker | YES |
| story-architect | YES |
| character-developer | YES |

The 7 gating critics stay locked to Read, Grep, Glob; only creator/reviser agents hold write tools. Agent type names referenced inside the workflows match `.claude/agents/<name>.md` exactly.

## 3. Command conversions

Two slash commands were converted to dynamic workflows; two were assessed and deliberately left as commands. Recorded in `.claude/workflows/COMMANDS-ASSESSMENT.md`.

| Command | Verdict |
|---|---|
| `batch-execute-wrp` | CONVERTED to `batch-execute-wrp.js` (capped, pipelined write-then-review with a mandatory `--limit` guard and ceiling clamp; calls `review-chapter` one level deep) |
| `compare-drafts` | CONVERTED to `compare-drafts.js` (round-robin pairwise tournament, each pair judged both directions to cancel position bias, deterministic Copeland ranking) |
| `curate-chapters` | ASSESS ONLY, not converted (overlaps existing review fan-out; recommendation is to extend `review-chapter.js` with a multi-chapter mode instead of duplicating critics) |
| `validate-transitions` | ASSESS ONLY, not converted (thin single-agent wrapper; recommendation is to fold transition checks into batch/review rather than ship a one-agent workflow) |

## 4. Distribution changes

- `README.md`: added a Requirements section. Core pipeline runs on any current Claude Code with only `jq` and `python3` as host deps; the four dynamic workflows need Claude Code 2.1.154+ (tested 2.1.168), research-preview, with the light `.claude/commands/` paths kept as a hedge.
- `CLAUDE.md`: added a Requirements section and a Dynamic Workflows subsection describing the four workflows as strict deterministic counterparts to the light commands, with the same runtime-version guidance.
- `.claude/skills/writeassist-workflow/SKILL.md`: updated (+20 lines) to reference the workflow surface.
- `.claude/workflows/README.md` and `.claude/workflows/COMMANDS-ASSESSMENT.md`: index and conversion rationale for the workflow directory.

## 5. Repo-wide checks (run for this report)

### (a) Literal U+2014 (em dash) across `.claude/` and `docs/`

`grep -rIo` across both trees: **TOTAL count = 0**. No files contain a literal em dash.

### (b) Every `.js` under `.claude/workflows/` with its `node --check` result

| File | `node --check` |
|---|---|
| `.claude/workflows/auto-revise-chapter.js` | PASS (exit 0) |
| `.claude/workflows/batch-execute-wrp.js` | PASS (exit 0) |
| `.claude/workflows/compare-drafts.js` | PASS (exit 0) |
| `.claude/workflows/review-chapter.js` | PASS (exit 0) |

All four workflow scripts pass syntax checking. Per-file em dash count was also 0 for every `.js`.
