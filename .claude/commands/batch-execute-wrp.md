---
description: Execute multiple WRPs into reviewed chapters by looping the execute-wrp command
argument-hint: "[wrp-files... | all]"
---
# Batch Execute WRP (Mass Chapter Production)

**Targets:** $ARGUMENTS

**No-argument behavior:** If no argument is given: list the WRPs in `05-wrp/` and stop.

---

## Purpose

Thin composition loop over the single-chapter `execute-wrp` command (D11). Everything about writing, reviewing, and revising a chapter (the quality pipeline, gating, iteration cap) lives in `execute-wrp.md` and `.claude/docs/review-engine.md`. This command only sequences it.

## Procedure

1. **Resolve targets.** Expand `$ARGUMENTS` (`all` or an explicit list) against `05-wrp/`. Order by chapter number; earlier chapters must exist before later ones are written (continuity context).
2. **Pre-flight once.** Confirm `story-compendium.md` and `author-rules.md` load, and previous chapters are available for continuity.
3. **Loop.** For each WRP, in order:
   - Invoke `execute-wrp <wrp-file>`. Batch context suppresses interactive checkpoints explicitly: the auto-revise iteration-3 user prompt does not fire (see auto-revise-chapter.md, Automated Pipeline Mode).
   - On failure or a chapter that still fails the review gates after the iteration cap: record it in the batch report, flag for manual review, and CONTINUE with the next WRP.
4. **Report.** Write one batch report to `.claude/state/batch-reports/batch-execute-wrp-<date>.md` listing per chapter: word count, final review decision (PASS/REVISE per review-engine.md), iterations used, and any flags. Review results themselves live at `.claude/state/reviews/` (written by review-chapter); this command creates no sidecar score files.

## Execution modes

- **Default:** full pipeline per chapter (write, review, revise until the gates pass or the cap is hit).
- **`--draft`:** write only, skip the review pipeline; review later with batch-review-and-revise.
- **`--progressive`:** pause after each chapter and show the result before proceeding (the one interactive mode; incompatible with unattended runs).

## What this command does NOT do

- No parallel chapter writing (sequential preserves continuity context)
- No own review loop, thresholds, or fix logic (execute-wrp owns the pipeline)
- No sidecar `-scores.md` files and no resource dashboards
