---
name: writeassist-workflow
description: Guide for using the WriteAssist book-writing framework. Works for fiction, memoir, autobiography, biography, and narrative non-fiction. Use when the user is working on a manuscript with WriteAssist or asks how to write/plan/revise a chapter using the framework's commands and agents.
---

# WriteAssist Workflow

This skill is the user-facing guide for the WriteAssist framework. It surfaces the right command for the author's current stage and explains the constraints they must respect. The framework supports any long-form prose mode: fiction, memoir, autobiography, biography, narrative non-fiction.

## When to use this skill

- The user is inside (or starting) a WriteAssist project (i.e., a directory with `author-rules.md`, `story-compendium.md`, `02-Manuscript/`).
- They ask "how do I outline / write / revise / publish a chapter."
- They mention WRPs, the em-dash rule, the four-tier review panel, or batch chapter operations.

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
| Set up character/world details | `/setup-story` |
| Plan the next chapter | `/generate-wrp <chapter-number>` (plan-mode gate) |
| Actually write the chapter | `/execute-wrp 05-wrp/chapter_XX_WRP.md` (auto-fires the four-tier panel) |
| Direct write without a WRP | `/write-chapter <chapter-number>` |
| Score an existing chapter | `/review-chapter <file>` (seven named gating critics in parallel) |
| Faster re-check of a near-final chapter | `/review-chapter <file> --fast` (skips advisory critics) |
| Apply review fixes | `/auto-revise-chapter <file>` (worktree-isolated passes) |
| Mass-produce a batch | `/batch-execute-wrp` (advanced; requires `--limit N`) |
| Sanity-check the whole MS | `/curate-chapters all` |

## Strict workflows vs light slash commands

The commands above are the **light path**: prose prompts the model interprets. For the
high-stakes review and production tasks there is also a **strict path**: runnable dynamic
workflows that the runtime executes as real control flow (deterministic fan-out, pipelines,
gates, plain-JS aggregation, no randomness). These live in `.claude/workflows/` and are indexed
in `.claude/workflows/README.md`.

| Strict workflow (`.claude/workflows/`) | Use it instead of the light command when… |
|---|---|
| `review-chapter.js` | You want the reproducible four-tier dual-gate with evidence collected once and reused, and selective adversarial verification. The `/review-chapter` slash command is the quick path for a single ad-hoc score. |
| `auto-revise-chapter.js` | You want the full review-revise loop driven to PASS or a cap, each pass on its own worktree/branch, fixes applied by the fixed confidence ladder. The `/auto-revise-chapter` command is the lighter, hands-on version. |
| `batch-execute-wrp.js` | You are mass-producing chapters and want the mandatory `--limit` guard, the hard ceiling, and the write-then-review pipeline with queue accounting. |
| `compare-drafts.js` | You are ranking two or more drafts of the same chapter and want a deterministic Copeland-style ranking from position-bias-cancelled pairwise judgments, not a single freeform ranker. |

Prefer the strict workflow when the result needs to be reproducible, auditable, or cost-capped.
Use the light slash command for a fast, one-off pass or when the harness predates the workflow
requirement (Claude Code 2.1.154+, tested 2.1.168, research-preview); the light path is the hedge
when dynamic workflows are unavailable. The light commands are not deprecated.

## The quality gate

A chapter is "done" when the four-tier review panel returns PASS:
1. At least 5 of the 7 gating critics return Pass or Strong Pass (panel gate) AND the weighted score is at least 7.0 (weighted gate), with no critical-fail override from Continuity, Rules, or Voice.
2. The em-dash count in the statusline is `em-dash:0` (enforced by the hook; em dashes cannot even be written to disk).
3. `continuity-checker` reports no contradictions vs `story-compendium.md`.
4. The author has accepted any pending `[AR-XXX]` markers from auto-revise.

Scores are qualitative model judgments used as a stopping heuristic, not ground truth.

## Key mechanics to know

- Gating critics have YAML frontmatter with **strict tool isolation** (`Read, Grep, Glob`): they cannot write to the manuscript.
- Hooks enforce the em-dash ban mechanically. A PreToolUse hook denies any Write/Edit/MultiEdit that would introduce one, before it executes, and a final scanner catches any that arrive by other paths (shell, external tools). The rule is enforced by the harness, not just as an agent instruction.
- `/auto-revise-chapter` iterates in **git worktrees** (plain `git worktree add` plus `cd` plus `commit`), so each pass is a diffable commit.
- `/outline-book` and `/generate-wrp` enter plan mode before writing artifacts.
- `/review-chapter` launches the seven gating critics as named, parallel Task calls. Advisory critics (sensitivity-reviewer, thematic-guide, grammar-clarity) inform but never gate, and are pruned on `--fast` or when `author-rules.md` declares no sensitivity constraint.

## Mode-specific notes

For **memoir and autobiography**, treat <code>story-compendium.md</code> as a fact-checked record of real people, places, and dates. <code>sensitivity-reviewer</code> and <code>continuity-checker</code> matter more than in fiction. <code>twist-engineer</code> matters less.

For **biography**, the subject is the protagonist; the author is the narrator. <code>research-assistant</code> becomes load-bearing for sourcing claims.

For **narrative non-fiction**, the WRP should note what's documented vs. reconstructed, so reviewers can flag any drift into fictionalization the author didn't intend.

## What this skill does NOT do

- Doesn't replace `CLAUDE.md`, that's framework configuration. This skill is the **user-facing workflow guide**.
- Doesn't make creative judgments. It routes the author to the right command.
- Doesn't bypass plan-mode gates or hook enforcement.
