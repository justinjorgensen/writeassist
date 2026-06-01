# Batch Execute WRP (Mass Chapter Production)

**Target WRPs:** $ARGUMENTS

---

> ## TOKEN-COST WARNING (read before running)
>
> Batch execution writes AND reviews multiple chapters in one invocation. Each
> chapter runs the full pipeline: a writing pass plus a parallel critic panel.
> Cost scales linearly with chapter count, so a 10-chapter batch can spend on the
> order of ten times the tokens of a single `/execute-wrp`.
>
> This command WILL NOT run without an explicit `--limit N`. There is no
> "run everything" mode. Start small (`--limit 1` or `--limit 2`), confirm the
> output and the spend, then raise the limit deliberately. If you want one
> chapter, prefer `/execute-wrp` directly.

---

## Purpose

Execute several WRPs in sequence to produce drafted, reviewed chapters at scale.
Each chapter goes through the same four-tier pipeline as `/execute-wrp`: write
from the WRP, then fan out the critic panel. This command is the at-scale wrapper,
not a different engine.

---

## MANDATORY: The `--limit N` Guard

`--limit N` is **required**. The command refuses to run without it.

- **No `--limit` given:** stop and ask the author for one. Do not guess, do not
  default to "all". Print the count of matching WRPs and a suggested small limit,
  then wait.
- **`--limit N` given:** process at most `N` WRPs in this run, in WRP-number order.
  Any beyond `N` are listed as "queued, not run" so the author can start the next
  batch explicitly.
- **Hard ceiling:** even when the author asks for more, cap a single invocation at
  `--limit 10`. For larger jobs, run repeated capped batches so cost stays visible
  and interruptible.

```
Examples
  /batch-execute-wrp 05-wrp/ --limit 2          # write+review the first 2 WRPs
  /batch-execute-wrp chapter_03 chapter_04 --limit 2
  /batch-execute-wrp 05-wrp/                     # REFUSED: no --limit
```

If the parsed limit is missing, zero, negative, or non-numeric, refuse and explain.

---

## Pre-Execution Validation

Before writing anything, confirm:

- All targeted WRP files exist and parse.
- `story-compendium.md` and `author-rules.md` are present (the em-dash rule applies).
- Previous chapters are available for continuity context.
- A `--limit N` was supplied and is a positive integer within the ceiling.

If any check fails, stop and report. Do not partially write.

---

## Execution Flow

Process WRPs one at a time, in order, up to the limit:

```
For each WRP (up to --limit N):
  1. Write the chapter from the WRP into 02-Manuscript/.
  2. Run the four-tier critic panel (same as /execute-wrp).
  3. Report the panel result for that chapter.
  4. Update story-compendium.md with any new canon from the chapter.
  5. Continue to the next WRP.

After the limit is reached:
  - List remaining WRPs as "queued, not run".
  - Print a per-chapter summary table.
```

Run chapters sequentially so a failure on one does not corrupt the others and so
the author can interrupt between chapters. The critic panel within a single chapter
still fans out in parallel; it is only the chapter-to-chapter loop that is serial.

---

## Per-Chapter Reporting

For each chapter, report which critics ran and the panel outcome (pass or revise),
without inventing precise numeric scores or fix counts. Keep the language honest:
the panel is a qualitative stopping heuristic, not a guaranteed gate.

```
Chapter 01
  Written: 02-Manuscript/Chapter-01.md
  Panel:   continuity, rule-enforcer, voice, pacing, dialogue,
           character, engagement  ->  result reported by the panel
```

---

## Batch Summary

Close with a compact table and the queue state:

```
Batch run: 2 of 7 WRPs (limited by --limit 2)

| Chapter | File                          | Panel result |
|---------|-------------------------------|--------------|
| 01      | Chapter-01.md                 | reported     |
| 02      | Chapter-02.md                 | reported     |

Queued, not run: chapters 03, 04, 05, 06, 07
Next batch: /batch-execute-wrp 05-wrp/ --limit 2
```

---

## Continuity Between Chapters

After each chapter completes, fold new facts back into `story-compendium.md`
(characters, timeline, world details) so later chapters in the same batch stay
consistent with earlier ones.

---

## Notes

- The em-dash guard runs on every write. A chapter that would contain an em dash
  cannot be saved in the first place; the batch simply moves on after the author
  resolves it.
- Prefer `/execute-wrp` for a single chapter. This command exists for the at-scale
  case, and the `--limit` guard plus the cost banner are what make running it at
  scale defensible.

---

*Batch execution: capped, sequential, and cost-aware by design.*
