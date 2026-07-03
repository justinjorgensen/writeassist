---
name: writeassist-workflow
description: Guide for using the WriteAssist book-writing framework. Works for fiction, memoir, autobiography, biography, and narrative non-fiction. Use when the user is working on a manuscript with WriteAssist or asks how to write/plan/revise a chapter using the framework's commands and agents.
---

# WriteAssist Workflow

This skill is the user-facing guide for the WriteAssist framework. It surfaces the right command for the author's current stage and explains the constraints they must respect. The framework supports any long-form prose mode: fiction, memoir, autobiography, biography, narrative non-fiction.

## When to use this skill

- The user is inside (or starting) a WriteAssist project (i.e., a directory with `author-rules.md`, `story-compendium.md`, `02-Manuscript/`).
- They ask "how do I outline / write / revise / publish a chapter."
- They mention WRPs, the em-dash rule, the 10-agent panel, or batch chapter operations.

## First rule: read the constraint docs

Before ANY creative task, read in this order:
1. `author-rules.md`, hard/soft constraints. Em dashes are absolutely banned.
2. `story-compendium.md`, characters, timeline, world rules.
3. `project-config.md`, genre, voice, target audience.

Then check `04-Project-Management/writing-tracker.md` to see what's in progress.

## The author's stage → command map

| If they want to… | Run |
|---|---|
| Start a brand-new book | `/outline-book` (plan-mode gate, then writes `01-Planning/outline.md`) |
| Set up character/world details | `/initialize-story-compendium` then `/create-character` |
| Plan the next chapter | `/generate-wrp <chapter-number>` (plan-mode gate) |
| Actually write the chapter | `/execute-wrp 05-wrp/chapter_XX_WRP.md` (auto-fires review) |
| Direct write without a WRP | `/write-chapter <chapter-number>` |
| Score an existing chapter | `/review-chapter <file>` (parallel critic panel) |
| Cheap re-check of a near-final chapter | `/smart-review <file>` |
| Apply review fixes | `/auto-revise-chapter <file>` (uses worktrees in v2) |
| Mass-produce a batch | `/batch-generate-wrp` → `/batch-execute-wrp` |
| Sanity-check the whole MS | `/curate-chapters all` |
| Send to beta readers | `/sync-to-drive` |
| Pitch agents | `/send-query-letter` |
| Final gate before publish | (author runs) `/code-review ultra` |

## The quality gate (v2)

A chapter is "done" when:
1. `review-chapter` reports PASS. Gating is defined in `.claude/docs/review-engine.md` (panel 5/7 Pass+, weighted >= 7.0, critical-fail overrides, max 5 revision iterations).
2. The em-dash count in the statusline is `em-dash:0` (enforced by hook, em dashes can't even be written to disk).
3. Continuity-checker reports no contradictions vs `story-compendium.md`.
4. Author has accepted any pending `[AR-XXX]` markers from auto-revise.

Only then is the chapter ready for `/sync-to-drive` → beta readers, or `/code-review ultra` → publish.

## Key mechanics to know

- 29 agents have YAML frontmatter with **strict tool isolation**: reviewers can't write to the manuscript.
- Hooks block em dashes mechanically. The rule is enforced at write time, not just as agent instruction.
- `/auto-revise-chapter` iterates in **git worktrees**, so each pass is diffable.
- `/outline-book` and `/generate-wrp` enter plan mode before writing artifacts.
- External commands route through MCPs: `/sync-to-drive`, `/send-query-letter`, `/schedule-writing-time`.
- Final cloud gate: `/code-review ultra` (author-triggered). See `.claude/docs/system-guides/ultrareview-gate.md`.

## Mode-specific notes

For **memoir and autobiography**, treat <code>story-compendium.md</code> as a fact-checked record of real people, places, and dates. <code>sensitivity-reviewer</code> and <code>continuity-checker</code> matter more than in fiction. <code>twist-engineer</code> matters less.

For **biography**, the subject is the protagonist; the author is the narrator. <code>research-assistant</code> becomes load-bearing for sourcing claims.

For **narrative non-fiction**, the WRP should note what's documented vs. reconstructed, so reviewers can flag any drift into fictionalization the author didn't intend.

## What this skill does NOT do

- Doesn't replace `CLAUDE.md`, that's framework configuration. This skill is the **user-facing workflow guide**.
- Doesn't make creative judgments. It routes the author to the right command.
- Doesn't bypass plan-mode gates or hook enforcement.
