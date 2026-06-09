# Import Feature Report

The import feature onboards a manuscript an author already wrote (full prose, outline-only, or mixed) into a live WriteAssist project, and it does so by reconciling the draft's real canon rather than extracting a clean copy of it.

## The import-book workflow (scout + reconcile)

`.claude/workflows/import-book.js` is a two-phase engine that runs the expensive reading in parallel so the conversation stays cheap. It takes `{ manuscript, bible }` and returns `{ chapters_scanned, facts_agreed, conflicts, files_written }`.

- **Phase Scout.** One full-tool agent lists the chapter `.md` files and returns them as an ordered array in natural reading order. Then the workflow fans out one reader agent per chapter, in parallel via a barrier, each returning a structured per-chapter intent map (summary, entities, `facts_asserted` with evidence, `intent_beats`, `voice_tells`, suspected `canon_conflicts`, `work_needed`, and a severity). This map is the keystone and it is cheap: a single structured read per chapter. Failed readers come back as null and are dropped while keeping an honest count.
- **Phase Reconcile.** One full-tool synthesis agent receives all scout maps (injected as evidence) plus any existing bible, clusters facts by topic, detects contradictions (prose-vs-prose and prose-vs-bible), and writes three reviewable artifacts under `04-Project-Management/import/`: `scout-map.md` (the per-chapter map), `candidate-compendium.md` (only the facts that agree, the safe-to-adopt canon), and `conflict-ledger.md` (the keystone, one entry per conflict with both claims, the rippled `affected_chapters`, and author-facing options, never an auto-resolved winner). A stale bible is treated as just one more source of claims that can lose, not as ground truth.

## The /import-book command

`.claude/commands/import-book.md` is the interactive wrapper that drives the author through the engine in five steps:

1. **Ingest.** Use Glob and Read to detect the shape of the draft and any existing scaffolding, place chapter prose into `02-Manuscript/` and outlines into `01-Planning/` (copy, never destroy originals), and confirm chapter order with one AskUserQuestion round if it is ambiguous.
2. **Run the workflow** via the Workflow tool, passing the manuscript directory and any prior canon to reconcile against, with a plain fallback to doing the three passes by hand if the runtime is unavailable.
3. **Layered confirmation with ripple.** Layer 1 walks the conflict ledger entry by entry with AskUserQuestion (claimA vs claimB, the `affected_chapters` blast radius, and options including a free-text third reconciliation), and re-confirms on ripple: the moment a resolution changes a fact, every affected chapter that now disagrees is re-surfaced and flagged before the decision is banked. Layer 2 derives the voice profile from the manuscript's own prose and has the author confirm or correct it. Layer 3 turns each chapter's `intent_beats` into a confirmed per-chapter plan, batched sensibly.
4. **Materialize** the durable scaffolding only after facts, voice, and intent are settled: a reconciled `story-compendium.md` with an auditable amendment log, inferred-and-confirmed `author-rules.md` and `project-config.md`, per-chapter WRPs in `05-wrp/`, and the voice profile.
5. **Hand off** with a tight recap and pointers to `/review-chapter`, `/auto-revise-chapter`, and the batch workflow.

## How the four lessons are baked in

Learned on a real 108k-word, 34-chapter rewrite, the four rules hold both files together:

- **Reconcile, do not extract.** The workflow diffs and adjudicates instead of overwriting; the reconcile agent never picks a winner, and the command frames the deliverable as an author-signed compendium.
- **The scout map is the keystone and it is cheap.** One structured read per chapter, parallelized, and everything downstream depends on it being honest.
- **Confirm in layers, re-confirm on ripple.** Every conflict entry carries an `affected_chapters` list, and resolving a fact re-surfaces every chapter it touches before moving on.
- **Judge on ONE consistent capable model.** There are no model overrides anywhere; every agent inherits the capable main model so score noise never drives a canon decision, and the workflow itself uses no wall-clock or randomness (any needed variation is derived from the chapter index).

## Verify result

PASS. `node --check .claude/workflows/import-book.js` succeeded (SYNTAX_OK); the file has `export const meta` (line 33) and NO `export default`.
