# WriteAssist Advanced Usage

Everything here is **optional**. The core surface (`/outline-book`, `/setup-story`, `/generate-wrp`, `/execute-wrp`, `/write-chapter`, `/review-chapter`, `/auto-revise-chapter`, `/update-rules`) is enough to write, review, and revise a whole book. The commands and agents below are for when you want focused tools, scale, or finer control. Come back to them once the core loop feels natural.

Agents and commands all live flat in `.claude/agents/` and `.claude/commands/`; the "advanced" label is documentation only and does not change how Claude Code resolves them.

---

## The 5 optional advanced agents

These are the five agents beyond the 11 core (4 creators plus the 7 gating critics). Three are advisory critics that inform a review but never gate it; two are creative helpers.

| Agent | Tools | Role | How it runs |
|-------|-------|------|-------------|
| sensitivity-reviewer | Read, Grep, Glob | Representation accuracy and harmful-trope check | advisory critic; pruned on `--fast` or when `author-rules.md` declares no sensitivity constraint |
| thematic-guide | Read, Grep, Glob | Theme and motif reinforcement | advisory critic; informs, never gates |
| grammar-clarity | Read, Grep, Glob | Grammar correctness and readability | advisory critic; informs, never gates |
| timeline-keeper | Read, Grep, Glob | Chronology, character ages, event sequencing | helper; backs `/update-timeline` |
| twist-engineer | Read, Write, Edit, Grep, Glob | Reveal and misdirection design | creative helper; can write, used during planning |

**Advisory critics never change the gate.** The seven gating critics always run and the gate denominator is always 7. The three advisory critics only add polish feedback. They are skipped entirely on `/review-chapter <file> --fast`, and `sensitivity-reviewer` is skipped when `author-rules.md` has no sensitivity constraint. This is the only cost-aware pruning in the engine.

---

## Advanced commands

All nine are real, resolvable slash commands; they are kept off the newcomer surface so the first run stays simple.

| Command | What it does |
|---------|--------------|
| `/write-scene` | Write a single scene in isolation, outside the chapter-level WRP loop. |
| `/curate-chapters [range]` | Deep cross-chapter consistency analysis over a range or the whole manuscript. |
| `/validate-transitions [chapters]` | Check chapter-to-chapter continuity and handoffs (folds in transition validation). |
| `/compare-drafts [files]` | Diff two chapter versions on structure and prose, not just text. |
| `/dialogue-specialist [chapter]` | Focused dialogue pass: voice distinction, subtext, tag variety. |
| `/update-timeline` | Maintain the story timeline; backed by `timeline-keeper`. |
| `/workshop-ingestion` | Import a workshop transcript or feedback session into the project's resources. |
| `/book-cleanup` | Archive drafts, organize files, tidy the working tree. |
| `/batch-execute-wrp` | Mass chapter production. Requires `--limit N`; carries a token-cost banner (see below). |

---

## Batch usage and token-cost guidance

`/batch-execute-wrp` is the one batch command in the framework. It is the at-scale wrapper around `/execute-wrp`, not a different engine: each chapter is written from its WRP and then run through the same four-tier critic panel.

**Why there is a hard guard.** Cost scales linearly with chapter count. Each chapter spends a writing pass plus a parallel panel of seven critics, so a 10-chapter batch can spend on the order of ten times the tokens of a single `/execute-wrp`. Parallel review trades tokens for latency and isolation; batching multiplies that trade.

**The rules the command enforces:**

- **`--limit N` is mandatory.** There is no "run everything" mode. With no limit, the command refuses, prints the count of matching WRPs, and waits.
- **Hard ceiling of 10 per invocation.** Even if you ask for more, a single run caps at `--limit 10`. Larger jobs run as repeated capped batches so spend stays visible and interruptible.
- **Sequential chapters, parallel critics.** Chapters run one at a time so a failure on one does not corrupt the others and you can interrupt between chapters. The critic panel within each chapter still fans out in parallel.
- **Canon folds forward.** After each chapter, new facts are written back into `story-compendium.md` so later chapters in the batch stay consistent.

**Recommended practice:** start at `--limit 1` or `--limit 2`, confirm the output and the actual token spend, then raise the limit deliberately. For a single chapter, prefer `/execute-wrp` directly.

```
/batch-execute-wrp 05-wrp/ --limit 2          # write and review the first 2 WRPs
/batch-execute-wrp chapter_03 chapter_04 --limit 2
/batch-execute-wrp 05-wrp/                     # REFUSED: no --limit
```

---

## The improv-story-form skill (optional)

The `improv-story-form` skill lives under `.claude/skills/improv-story-form/`. It is a structured premise-builder for short stories, RPG one-shots, and writing-prompt warm-ups: it walks you through a handful of inputs (arc, genres, setting, characters, spark, wildcards, output preference) and produces a logline, premise, or opening scene. It is not wired into `/setup-story` and is not part of the core flow; use it when you want a premise from prompted constraints rather than a blank page. If you are already deep in a manuscript, use the `writeassist-workflow` skill instead.

---

## A note on heuristics

As in the core framework, every score the advanced tools produce is a qualitative model judgment used as a stopping rule, not ground truth. The one deterministic guarantee anywhere in the system is the em-dash gate, enforced by the PostToolUse hook. Treat the rest as a forcing function for revision, not as measurement.
