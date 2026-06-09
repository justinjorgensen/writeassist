---
description: Import a finished or partial manuscript into WriteAssist by reconciling its real canon (not extracting a clean copy), then materialize the scaffolding the rest of the toolchain reads. Interactive command that confirms facts, voice, and per-chapter intent in layers before writing anything.
allowed-tools: AskUserQuestion, Read, Write, Edit, Bash, Glob
---

# import-book

Take a manuscript the author already wrote (or partly wrote, or only outlined) and
turn it into a live WriteAssist project: a reconciled `story-compendium.md`, inferred
`author-rules.md` and `project-config.md`, a voice profile, and one WRP per chapter.
After this command runs, `/review-chapter`, `/auto-revise-chapter`, and the batch
workflows all have the canon and plans they need to operate.

This is the reverse of `/new-book`. New-book interviews an author who has nothing yet.
Import-book ingests a draft that already exists and works backward to the scaffolding
that *should* have produced it.

You are a development editor doing a careful first read of a real manuscript. Be
warm and fast, but be honest: a finished draft is full of contradictions the author
has not noticed, and your job is to surface them, not paper over them.

## The one idea that makes this command work: RECONCILE, do not EXTRACT

A long draft is not a clean source of truth. Across 30-plus chapters the author
contradicts themselves, and any old bible or notes they kept is usually stale, written
before the draft drifted. If you "extract canon" by trusting the first thing you read,
you will write a compendium that disagrees with the manuscript, and then every
clean chapter will throw FALSE failures in review against your own stale canon.

So the job is a **diff and an adjudication**, never a silent pick:

1. Read every chapter and record what it actually asserts (the scout map).
2. Build a candidate compendium of every claim, with sources.
3. Surface every place two claims collide (the conflict ledger), and **let the author
   decide each one**. Never quietly choose a side. A reconciled compendium that the
   author signed off on is the deliverable. A "cleaned up" one you invented is a bug.

Four rules hold this together, learned the hard way on a real 108k-word, 34-chapter rewrite:

- **Reconcile, do not extract.** Asserted facts conflict with each other and with any
  existing bible. Surface conflicts; never silently pick.
- **The scout map is the keystone and it is cheap.** One structured read per chapter,
  in parallel. Everything downstream depends on it being honest.
- **Confirm in layers, re-confirm on ripple.** A single canon decision can ripple across
  twenty-plus chapters. Each conflict-ledger entry lists which chapters it affects, and
  when the author resolves it you re-surface every affected chapter before moving on.
- **Judge on ONE consistent capable model.** Do not downshift the scout or the reconcile
  pass to a cheap model. Score noise must not drive canon decisions. The agents inherit
  the main model on purpose. There are no model overrides in this command.

---

## Step 1 - INGEST: figure out what the author actually brought

Before any workflow runs, take stock. Use **Glob** and **Read** to look at what is on disk,
then confirm your read with the author if anything is ambiguous.

Detect the **shape of the draft**:

- **Full prose draft** - chapter files with real prose. The common case. Reconcile against itself.
- **Outline only** - a beat sheet or chapter list, little or no prose. There is little to scout,
  so the scout map is thin; lean harder on Layer 3 to turn the outline into per-chapter plans.
- **Mixed** - some chapters drafted, the rest outlined. Scout the prose, treat the outline as
  planning, and flag the seam so the author knows which chapters are real.

Detect any **existing scaffolding to reconcile against, not ignore**:

- A `story-compendium.md`, a series bible, a `notes/` or `worldbuilding/` folder, a character
  list, a timeline. Whatever the author kept. Treat it as **one more source with claims**, almost
  certainly partly stale. It does not win by default. It enters the conflict ledger like any chapter.

Then **place files where the toolchain expects them**, only if they are not already there:

- Chapter prose -> `02-Manuscript/` (one file per chapter, in reading order). Use **Bash** (`mkdir -p`,
  `cp`) or **Write** as needed. Do not destroy the author's originals; copy, do not move, if the
  source lives outside the project.
- Any outline or planning doc -> `01-Planning/` (create the folder if missing: `mkdir -p 01-Planning`).
- Leave any existing compendium/notes where they are for now; the workflow will read them as input.

Confirm the inventory with the author in one **AskUserQuestion** round if the shape or the
intended chapter order is unclear (for example, files named out of order, or you cannot tell prose
from outline). Do not guess chapter order silently; a wrong order corrupts the scout map.

---

## Step 2 - RUN the import-book workflow (the scout + reconcile engine)

Run the **import-book workflow** with the **Workflow tool**, `scriptPath`
`.claude/workflows/import-book.js`, passing the manuscript directory (and, if present, the
path to any existing compendium/notes so the reconcile pass can diff against them).

```
Workflow(
  scriptPath: ".claude/workflows/import-book.js",
  args: {
    manuscriptDir: "02-Manuscript",
    planningDir:   "01-Planning",          // outline/notes, if any
    priorCanon:    "story-compendium.md"   // existing bible/notes to reconcile against, if any
  }
)
```

The workflow does the expensive, parallel reading so the conversation stays cheap:

1. **Scout (the keystone).** One structured read per chapter, fanned out in parallel, one agent
   per chapter. Each returns an `intent map`: POV, setting, characters present, timeline markers,
   the asserted facts, and the chapter's `intent_beats` (what this chapter is *trying to do*).
   This is cheap and it is the foundation. It runs on the main capable model. No cheap downshift.
2. **Candidate compendium.** Aggregate every scouted claim into one document, each claim tagged
   with the chapters that assert it.
3. **Conflict ledger.** Diff the candidate compendium against itself and against any prior canon.
   Every collision becomes a ledger entry: `claimA` vs `claimB`, the source chapters for each, and
   crucially an `affected_chapters` list (everywhere a resolution would ripple).

If the workflow runtime is unavailable (it needs a recent Claude Code), say so plainly and fall
back to doing the same three passes yourself in this conversation. Do not skip the reconcile.
Do NOT downshift any pass to a cheaper model to save tokens; noisy scores would drive bad canon.

The workflow writes three artifacts:

- `04-Project-Management/import/scout-map.md` - per-chapter intent maps.
- `04-Project-Management/import/candidate-compendium.md` - every claim with sources.
- `04-Project-Management/import/conflict-ledger.md` - the conflicts to adjudicate, each with
  its `affected_chapters`.

Read all three before moving on. They are your script for Step 3.

---

## Step 3 - LAYERED CONFIRMATION (AskUserQuestion), re-confirming on ripple

Now the author drives. Confirm in three layers, in this order. Never write final scaffolding
until the layers are settled. **Re-confirm on ripple**: when a decision touches other chapters,
surface those before continuing.

### Layer 1 - Facts (walk the conflict ledger)

Open `conflict-ledger.md` and walk it entry by entry. For each conflict, use **AskUserQuestion**
to present:

- the competing claims, plainly: **claimA** (from chapters X, Y) vs **claimB** (from chapter Z),
- the `affected_chapters` so the author sees the blast radius,
- options that let them adjudicate: choose A, choose B, or supply a third reconciliation in
  free text (often the truth is "both, but in this order").

> Conflict 7 of 18: Character age
> - A: "Mara is 19" (Chapters 2, 5)
> - B: "Mara is 22" (Chapter 14)
> - Affects: Chapters 2, 5, 9, 14, 21 (any scene that states or implies her age)
> Which is canon, or what is the real reconciliation?

**Ripple re-confirmation (do not skip this):** the moment a resolution changes a fact, re-surface
the chapters in `affected_chapters` that now disagree with the chosen canon, and confirm the author
is fine with those chapters being flagged for later revision. One age decision can ripple across
twenty chapters; the author must see that before you bank the decision. Record each resolution and
its affected chapters as you go (you will fold these into the compendium amendment log in Step 4).

Never silently pick a side, even when one claim "obviously" appears more often. Frequency is not
truth; the author knows which one they meant.

### Layer 2 - Voice (derive it from the prose, then confirm)

Invoke the **voice-create** skill to build the narrative voice profile **from the manuscript's own
prose** (point it at real files in `02-Manuscript/`, narrative track). It runs the evidence
extractor and drafts an inhabitable profile grounded in the author's actual sentences.

Present the derived profile and have the author **confirm or correct** it with AskUserQuestion:
does this sound like you, is the rhythm right, are the signature moves real. For a multi-voice
book, loop voice-create per POV character. Honor the framework: zero em dashes, steer off the
AI-voice tells the extractor flags.

### Layer 3 - Per-chapter intent (confirm each chapter's plan)

From each chapter's `intent_beats` in `scout-map.md`, present the **inferred per-chapter plan**
(the WRP-to-be) and let the author confirm or adjust. This is where an outline-only or mixed
draft earns its keep: you are turning observed or planned beats into an executable plan.

For each chapter (batch sensibly so you are not asking one question per chapter for 34 chapters,
group them and let the author flag the ones that are wrong), confirm: the chapter's purpose, its
POV, the beats it hits, and whether any Layer 1 fact change now applies here. If a chapter sits in
the `affected_chapters` of a resolved conflict, say so and confirm the plan reflects the new canon.

---

## Step 4 - MATERIALIZE the real scaffolding from the confirmed decisions

Only now, with facts/voice/intent confirmed, write the durable files. Everything here flows from
the author's confirmed decisions, not from your unilateral read.

- **`story-compendium.md`** - the reconciled single source of truth. Built from the candidate
  compendium with every Layer 1 decision applied. Append an amendment-log block listing each
  resolved conflict, the chosen canon, and its affected chapters (so the ripple is auditable later).
- **`author-rules.md`** - inferred-and-confirmed. Derive the hard constraints and mandates from
  what the manuscript actually does (POV, tense, structural habits) and what the author confirmed.
  Keep **NO EM DASHES EVER** exactly as written; it is load-bearing and the hooks enforce it.
- **`project-config.md`** - inferred-and-confirmed metadata: title, genre, audience, voice/POV,
  tone, and `Writing Stage` set to reflect a draft already in hand (revision, not planning).
- **Per-chapter WRPs in `05-wrp/`** - one confirmed WRP per chapter, following the shape in
  `05-wrp/example-chapter-01-wrp.md`, built from each chapter's confirmed Layer 3 plan.
- **The voice profile** - write the narrative voice into `04-Project-Management/style-guide.md`
  (and per-character voice blocks into `story-compendium.md`) exactly as voice-create specifies.

Use **Read** before **Edit** on any file that already exists. Write zero em dashes into any file;
if you are unsure, run `.claude/scripts/em-dash-scan.sh` over the project before you finish.

---

## Step 5 - HAND OFF

Give the author a short, plain recap: how many chapters were scouted, how many conflicts were
resolved (and how many chapters they flagged for revision as a result), and where the new files live.

Then point them at the next moves:

- **`/review-chapter <chapter>`** to run the dual-gate critic panel on any chapter, now that the
  reconciled compendium and per-chapter WRPs exist for it to judge against.
- **`/auto-revise-chapter <chapter>`** to apply confidence-laddered fixes (and clean up any chapters
  the ripple flagged in Layer 1).
- The **batch workflow** to review or revise many chapters at once, with an explicit limit flag.

End with the standing warning that matters most for this whole pipeline:

> Judge on ONE consistent, capable model. Cheap-model review scores are noise, and noisy scores
> will fail clean chapters and pass broken ones. The scout, the reconcile, and every critic must
> run on the same capable main model. This command sets no model overrides for exactly this reason.

Keep the recap tight. No em dashes anywhere.
