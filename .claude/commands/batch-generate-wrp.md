---
description: Generate WRPs for multiple chapters by looping the generate-wrp command
argument-hint: "[chapter-range | all]"
---
# Batch Generate WRP (Bulk Chapter Planning)

**Targets:** $ARGUMENTS

**No-argument behavior:** If no argument is given: list outline chapters without WRPs and stop.

---

## Purpose

Thin composition loop over the single-chapter `generate-wrp` command (D11). This command adds NO planning logic of its own; everything about how a WRP is built, structured, and named lives in `generate-wrp.md`.

## Procedure

1. **Resolve targets.** Expand `$ARGUMENTS` (`all`, `4-9`, or an explicit list) against `01-Planning/outline.md`. Skip chapters that already have a WRP in `05-wrp/` unless `--force` is passed; report the skips.
2. **Confirm the batch.** Show the resolved chapter list once before starting.
3. **Loop.** For each target chapter, in order:
   - Invoke `generate-wrp <chapter-number> --no-plan`.
     Batch context passes `--no-plan` explicitly: the outline was already approved, and interactive plan-mode checkpoints are suppressed in batch runs.
   - On failure: record the chapter and the error in the batch report, then CONTINUE with the next chapter. Never abort the whole batch for one failure.
4. **Report.** Write one batch report to `.claude/state/batch-reports/batch-generate-wrp-<date>.md` listing: chapters processed, WRPs created (with paths per the artifact contract, `05-wrp/chapter-NN-wrp.md`), skips, and failures needing attention.

## Consistency across the batch

Because WRPs are generated sequentially from the same outline and compendium, verify at the end of the loop that chapter-to-chapter transitions line up (each WRP's opening context matches the previous WRP's ending state). Report mismatches; fixing them is a `generate-wrp` re-run for the affected chapter.

## What this command does NOT do

- No parallel WRP generation (sequential keeps transition context correct)
- No custom WRP template, naming scheme, or quality bar (that is generate-wrp's job)
- No writing of chapters (that is batch-execute-wrp)
