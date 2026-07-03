---
description: Review and auto-revise multiple chapters by looping review-chapter and auto-revise-chapter
argument-hint: "[chapter-files... | all]"
---
# Batch Review and Revise (Mass Quality Upgrade)

**Targets:** $ARGUMENTS

**No-argument behavior:** If no argument is given: default to all chapters in `02-Manuscript/` after confirming with the user.

---

## Purpose

Thin composition loop over the single-chapter `review-chapter` and `auto-revise-chapter` commands (D11). Gating, tiers, and the confidence ladder are defined once, in `.claude/docs/review-engine.md` and `auto-revise-chapter.md`; this command only sequences them across chapters.

## Procedure

1. **Resolve targets.** Expand `$ARGUMENTS` against `02-Manuscript/`; list the resolved chapters once before starting.
2. **Branch.** Create a git branch for the batch (`batch-revise/<date>`) so the whole upgrade is one reviewable diff.
3. **Loop.** For each chapter, in order:
   - Invoke `review-chapter <chapter>`.
   - If the decision is REVISE: invoke `auto-revise-chapter <chapter>`, which loops revise-and-re-review internally until the gates pass or its iteration cap is reached. Batch context suppresses interactive checkpoints explicitly (the iteration-3 prompt does not fire; see auto-revise-chapter.md, Automated Pipeline Mode).
   - If the chapter still fails after the cap: record it, flag for manual review, CONTINUE with the next chapter.
4. **Report.** Write one batch report to `.claude/state/batch-reports/batch-review-and-revise-<date>.md`: per chapter, the final decision, tier summary, fixes applied, and flags. Individual review reports live at `.claude/state/reviews/`.

## Focused batch variants

Pass a focus to constrain what auto-revise applies (the review still runs the full panel):

- `--focus=em-dash`: apply only em-dash eliminations (always confidence 1.0)
- `--focus=dialogue`: apply only dialogue fixes
- `--focus=pacing`: apply only pacing fixes

## What this command does NOT do

- No own confidence ladder (auto-revise-chapter's four-band ladder is the only one)
- No continuous monitoring or file-watching mode (run it when you want a sweep)
- No resource dashboards or throughput projections

## Integration

Complete pipeline: `batch-generate-wrp` (plan) then `batch-execute-wrp` (write) then `batch-review-and-revise` (upgrade older chapters) then `book-cleanup` (archive drafts, organize files).
