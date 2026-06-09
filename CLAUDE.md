# CLAUDE.md - WriteAssist Framework Configuration

> **NOTE:** This is the **framework's system configuration**. Users should NOT edit this file.
> **For project-specific settings** (genre, voice, themes, etc.), edit `project-config.md` instead.

This file provides guidance to Claude Code (claude.ai/code) when working with the WriteAssist framework.

## Requirements

The core surface (slash commands, hooks, statusline, agents) runs on any current Claude Code; the only host dependencies are `jq` and `python3`. The **dynamic workflows** under `.claude/workflows/` (`review-chapter`, `auto-revise-chapter`, `batch-execute-wrp`, `compare-drafts`) are runnable JavaScript orchestrations that need Claude Code **2.1.154+** (tested on **2.1.168**), research-preview. When that runtime is unavailable, use the light slash-command paths in `.claude/commands/` instead: they cover the same tasks and remain as a hedge. See `.claude/workflows/README.md`.

## Project Type

This is **WriteAssist**, a creative writing framework for producing high-quality long-form prose with AI assistance. It works for any book-length narrative: fiction (novels, short story collections), memoir, autobiography, biography, or narrative non-fiction. It is NOT a software development project (no build, test, or deployment commands).

## Core Architecture

### Constraint-Driven Writing System
The framework uses a four-document constraint hierarchy:
1. **author-rules.md** - Hard constraints, soft constraints, and mandates (MUST be read before any creative task)
2. **story-compendium.md** - Your story's encyclopedia (characters, timeline, world details, plot structure)
3. **project-config.md** - User project settings (genre, voice, tone, themes, dialogue style)
4. **CLAUDE.md** - Framework AI behavior and workflow rules (system-level, DO NOT EDIT)

AI agents MUST check `author-rules.md` FIRST before any creative work. Flag violations with `[RULE VIOLATION: rule-name]` tags.

### Directory Structure
```
01-Planning/           - Outlines, beat sheets, story structure
02-Manuscript/         - Final chapter files (all chapters write here)
03-Resources/          - Research, worldbuilding, workshop materials
04-Project-Management/ - Templates, style guide, writing tracker
05-wrp/               - Writing Requirements Plans (chapter blueprints)
.claude/
  agents/             - Specialized agents (creators and read-only critics)
  commands/           - Slash command implementations
  docs/               - System guides including review-engine.md
```

**Note:** Multi-book projects can create subdirectories later if needed (e.g., `02-Manuscript/Book-1/`), but the default setup uses a single manuscript directory for simplicity.

### WRP Workflow (Writing Requirements Plan)
The primary workflow for chapter creation:
1. Generate WRP (`/generate-wrp [chapter-number]`) - Creates a detailed chapter blueprint
2. Execute WRP (`/execute-wrp [wrp-file]`) - Writes the chapter from the blueprint, then auto-fires the four-tier review panel
3. Automatic review - the seven named gating critics run in parallel against the four-tier rubric
4. Auto-revision - if the panel sends the chapter to Revise, `/auto-revise-chapter` applies fixes and the panel re-runs (worktree-isolated)

## Critical Rules

### Zero Em Dash Policy
**ABSOLUTE ZERO TOLERANCE** for em dashes. Use commas, colons, semicolons, or parentheses instead.

This is enforced **mechanically by a PreToolUse hook** (`.claude/scripts/em-dash-guard.sh`): a `Write`, `Edit`, or `MultiEdit` that would introduce an em dash to a manuscript file is denied before it executes (the hook exits 2), so the token never reaches disk through those tools. Because that matcher cannot see shell writes, a **final scanner** (`.claude/scripts/em-dash-scan.sh`, on `Bash` and `Stop`) enforces a clean final state across every other path. Review critics remain a secondary check. See `author-rules.md` and `.claude/settings.json`.

### Parallel Critic Execution
When running `/review-chapter` (directly or auto-fired by `/execute-wrp`):
- **ALWAYS use separate Task agents** - Never simulate multiple critics in one Task
- **Launch the seven gating critics in parallel** - all in one response, each in its own clean context
- **Name each agent** - set `subagent_type` to the agent's name (continuity-checker, rule-enforcer, voice-consistency, pacing-master, dialogue-coach, character-critic, engagement-critic). Never `general-purpose` with an inline prompt
- **Each agent gets clean context** - no contamination between analyses

### Tool Isolation per Agent
Every agent in `.claude/agents/` carries YAML frontmatter declaring its tools. **The seven gating critics are locked to `Read, Grep, Glob`**, so they physically cannot edit the manuscript. Only creator agents (story-architect, character-developer, world-builder, twist-engineer, research-assistant) hold `Write, Edit`.

If a critic reports "cannot write file" during a review, that is correct behavior: the review pipeline is read-only by design. Edits flow through `/auto-revise-chapter`.

### Plan-Mode Gates
`/outline-book` and `/generate-wrp` enter plan mode before writing artifacts. The author approves the structure before the model commits a blueprint to disk. Skip with `--no-plan` only in batch contexts where the outline is already approved.

### Worktree-Isolated Revisions
`/auto-revise-chapter` runs each revision pass in its own git worktree (`.worktrees/chapter-XX-pass-N`). This is plain `git worktree add` plus `cd` plus `commit`, not a special harness flag. The author can `git diff` between passes, and a bad revision never corrupts the working copy. See the command file for the loop protocol.

### Hooks
`.claude/settings.json` registers four hooks:
- **PreToolUse / em-dash-guard** - denies any Write/Edit/MultiEdit that would introduce em dashes to manuscript files, before execution (exit 2). Matches the em dash by codepoint escape, not a literal byte.
- **PostToolUse(Bash) and Stop / em-dash-scan** - final scanner; flags any banned token that reached disk via a non-Write/Edit path (shell, external tools) (exit 2).
- **PostToolUse / post-chapter-review** - opt-in via `WRITEASSIST_AUTO_REVIEW=1`; drops a breadcrumb when a chapter is saved.
- **Stop / update-tracker** - appends a session-end word-count line to `04-Project-Management/writing-tracker.md`.

### Statusline
`.claude/scripts/statusline.sh` emits: `[model] proj | latest-chapter | total-words | em-dash:N | last-review`. The em-dash count is colored red if non-zero (it should always be zero).

### Skills
One skill ships under `.claude/skills/`:
- `writeassist-workflow` - author-facing stage-to-command map, available in any project that includes this skill.

### Quality Standard
A chapter is "done" when the four-tier review panel returns PASS: at least 5 of the 7 gating critics return Pass or Strong Pass (panel gate) AND the weighted score is at least 7.0 (weighted gate), with no critical-fail override from Continuity, Rules, or Voice. See `.claude/docs/review-engine.md` for the full specification. Scores are qualitative model judgments used as a stopping heuristic, not ground truth.

## Available Slash Commands

### Planning & Setup
- `/outline-book` - Generate a comprehensive book outline (plan-mode gate)
- `/setup-story` - Set up the story compendium and characters

### Writing
- `/generate-wrp [chapter]` - Create a chapter blueprint (plan-mode gate)
- `/execute-wrp [file]` - Write a chapter from a WRP, then auto-fire the four-tier panel
- `/write-chapter [chapter]` - Direct chapter writing (no WRP)
- `/write-scene` - Write individual scenes (advanced)

### Quality Control
- `/review-chapter [chapter]` - The seven named gating critics score the chapter in parallel (auto-fired by execute-wrp)
- `/auto-revise-chapter [chapter]` - Apply review fixes in isolated git worktrees
- `/curate-chapters [range]` - Deep consistency analysis across chapters (advanced)
- `/dialogue-specialist [chapter]` - Focused dialogue review (advanced)
- `/validate-transitions [chapters]` - Check chapter-to-chapter continuity (advanced)
- `/compare-drafts [files]` - Compare chapter versions (advanced)

### Batch Operations
- `/batch-execute-wrp` - Mass chapter production (advanced; requires `--limit N`, carries a token-cost warning)

### Maintenance
- `/book-cleanup` - Archive drafts, organize files (advanced)
- `/update-rules` - Modify author-rules.md
- `/update-timeline` - Maintain the story timeline (advanced)
- `/workshop-ingestion` - Import workshop transcripts into the project (advanced)

### Dynamic Workflows (`.claude/workflows/`)
The strict, deterministic counterparts to the light commands above, executed by the runtime as real control flow. Require Claude Code 2.1.154+ (tested 2.1.168), research-preview; the light commands are the hedge when that runtime is unavailable. Indexed in `.claude/workflows/README.md`.
- `review-chapter.js` - Reproducible four-tier dual-gate review; evidence collected once, selective adversarial verification (strict counterpart to `/review-chapter`)
- `auto-revise-chapter.js` - Full review-revise loop to PASS or a cap, each pass on its own worktree/branch (strict counterpart to `/auto-revise-chapter`)
- `batch-execute-wrp.js` - Capped, pipelined mass production: write then review each WRP, mandatory `--limit` guard (strict counterpart to `/batch-execute-wrp`)
- `compare-drafts.js` - Round-robin pairwise tournament with deterministic Copeland ranking (strict counterpart to `/compare-drafts`)

## Key Files to Check Before Creative Work

1. **author-rules.md** - MANDATORY first read. Hard constraints (never break), soft constraints (avoid unless justified), and mandates (always do)
2. **story-compendium.md** - Your story's encyclopedia (character details, timeline, world rules)
3. **project-config.md** - Project-specific settings (genre, voice, tone, themes, dialogue style)
4. **04-Project-Management/style-guide.md** - Voice, tone, prose style guidelines
5. **04-Project-Management/writing-tracker.md** - Current progress and focus areas

## Common Workflows

### Starting a New Chapter
```
1. Read author-rules.md (MANDATORY)
2. Check story-compendium.md for context
3. /generate-wrp [chapter-number]
4. Review the WRP, adjust if needed
5. /execute-wrp chapter_[X]_WRP.md
   (Automatically fires the four-tier review panel, then auto-revise if needed)
```

### Quality Upgrade for an Existing Chapter
```
/review-chapter Chapter-01.md
/auto-revise-chapter Chapter-01.md   (if the panel returns REVISE)
```

## Important Implementation Notes

- This framework uses Claude Code's native Task tool for true parallel agent execution
- Each gating critic gets its own context window
- Never simulate multiple critics in a single Task: that defeats parallelism and tool isolation
- The seven gating critics are always named explicitly (never general-purpose)
- Advisory critics (sensitivity-reviewer, thematic-guide, grammar-clarity) inform but never gate, and are pruned on `--fast` or when no sensitivity constraint exists

## Document Updates

When authors discover patterns or make creative decisions, they update:
- `author-rules.md` - Add new constraints or mandates
- `story-compendium.md` - Lock in story decisions
- `04-Project-Management/writing-tracker.md` - Track progress

AI agents should suggest rule updates when patterns emerge.
