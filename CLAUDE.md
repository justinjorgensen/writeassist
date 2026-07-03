# CLAUDE.md - WriteAssist v2 Framework Configuration

> **NOTE:** This is the **framework's system configuration**. Users should NOT edit this file.
> **For project-specific settings** (genre, voice, themes, etc.), edit `project-config.md` instead.
> **For v2 changes vs v1:** see `MIGRATION.md` in the project root.

This file provides guidance to Claude Code (claude.ai/code) when working with the WriteAssist framework.

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
  agents/             - Specialized review agent definitions
  commands/           - 24 slash command implementations
  docs/               - System guides including review-engine.md
```

**Note:** Multi-book projects can create subdirectories later if needed (e.g., `02-Manuscript/Book-1/`), but the default setup uses a single manuscript directory for simplicity.

### WRP Workflow (Writing Requirements Plan)
The primary workflow for chapter creation:
1. Generate WRP (`/generate-wrp [chapter-number]`) - Creates detailed chapter blueprint
2. Execute WRP (`/execute-wrp [wrp-file]`) - Writes chapter from blueprint with automated quality pipeline
3. Automatic Review - a parallel critic panel evaluates the chapter using the four-tier rubric
4. Auto-revision loop - Gating is defined in `.claude/docs/review-engine.md` (panel 5/7 Pass+, weighted >= 7.0, critical-fail overrides, max 5 revision iterations)

## Critical Rules

### Zero Em Dash Policy
**ABSOLUTE ZERO TOLERANCE** for em dashes: the em dash character (U+2014) or the double-hyphen `--`. Use commas, colons, semicolons, or parentheses instead.

In v2 this is enforced mechanically by two hooks: a **PreToolUse guard** (`.claude/scripts/em-dash-guard-pre.sh`) denies any Write/Edit whose proposed content contains an em dash on guarded paths (the call is blocked before anything reaches disk), and a **PostToolUse backstop** (`.claude/scripts/em-dash-guard.sh`) rescans the file after writes and surfaces violations that slip through other routes. Note: writes made via Bash bypass both hooks, so review agents remain a secondary check. See `author-rules.md` line 18 and `.claude/settings.json`.

### Parallel Agent Execution
When using multi-agent commands (review-chapter, batch-review-and-revise):
- **ALWAYS use separate Task agents** - Never simulate multiple agents in one Task
- **Launch agents in parallel** - All agents run simultaneously for 10x speed improvement
- **Each agent gets clean context** - No contamination between analyses
- See `.claude/docs/system-guides/PARALLEL-EXECUTION-GUIDE.md` for implementation details

### Tool Isolation per Agent (v2)
All 25 agents in `.claude/agents/` carry YAML frontmatter declaring which tools they can use (full list: `.claude/docs/agent-roster.md`). **Reviewer agents are locked to `Read, Grep, Glob`**, they physically cannot edit the manuscript. Only creator agents (story-architect, character-developer, world-builder, twist-engineer, research-assistant) hold `Write, Edit`. The orchestrator (series-coordinator) additionally holds `Task` but no Write/Edit.

If an agent reports "cannot write file" during a review, that's correct behavior, the review pipeline is read-only by design. Edits flow through `/auto-revise-chapter`.

### Plan-Mode Gates (v2)
`/outline-book` and `/generate-wrp` enter plan mode before writing artifacts. The author approves the structure before the model commits a 5-10 page blueprint to disk. Skip with `--no-plan` only in batch contexts where the outline is already approved.

### Worktree-Isolated Revisions (v2)
`/auto-revise-chapter` runs each revision pass in its own git worktree (`.worktrees/chapter-XX-pass-N`). This lets the author `git diff` between passes and prevents a bad revision from corrupting the working copy. See the command file for the loop protocol.

### Hooks (v2)
`.claude/settings.json` registers four hooks:
- **PreToolUse / em-dash-guard-pre**, denies any Write/Edit whose proposed content contains em dashes on manuscript paths (exit 2 blocks the call before it touches disk).
- **PostToolUse / em-dash-guard**, backstop rescan of the file after Write/Edit; surfaces any em dash that reached disk (exit 2).
- **PostToolUse / post-chapter-review**, opt-in via `WRITEASSIST_AUTO_REVIEW=1`; drops a breadcrumb when a chapter is saved.
- **Stop / update-tracker**, appends a session-end word-count line to `04-Project-Management/writing-tracker.md`.

### Statusline (v2)
`.claude/scripts/statusline.sh` emits: `[model] proj | latest-chapter | total-words | em-dash:N | last-review-score`. Em-dash count is colored red if non-zero (it should always be zero).

### Skills (v2)
Two skills ship under `.claude/skills/`:
- `writeassist-workflow`, author-facing stage-to-command map. Available in any project that includes this skill.
- `improv-story-form`, premise builder ported from `improv_story_form.html`.

### Quality Standards
- Chapters are evaluated by a parallel critic panel using the four-tier rubric (Strong Pass / Pass / Needs Work / Fail)
- Gating is defined in `.claude/docs/review-engine.md` (panel 5/7 Pass+, weighted >= 7.0, critical-fail overrides, max 5 revision iterations)
- Auto-revision pipeline runs until the gates pass or the iteration cap is reached

## Available Slash Commands

### Planning & Setup
- `/outline-book` - Generate comprehensive book outline
- `/story-compendium-manager` - Create/update story compendium
- `/initialize-story-compendium` - Set up story compendium from scratch
- `/create-character` - Add character profiles

### Writing
- `/generate-wrp [chapter]` - Create chapter blueprint
- `/execute-wrp [file]` - Write chapter from WRP with automated quality pipeline
- `/write-chapter [chapter]` - Direct chapter writing (no WRP)
- `/write-scene` - Write individual scenes

### Quality Control
- `/review-chapter [chapter]` - Parallel critic panel evaluates the chapter (auto-triggered by execute-wrp)
- `/smart-review [chapter]` - Content-aware review using only relevant agents
- `/auto-revise-chapter [chapter]` - Apply fixes from review scores
- `/curate-chapters [range]` - Deep consistency analysis across chapters
- `/dialogue-specialist [chapter]` - Focused dialogue review
- `/validate-transitions [chapters]` - Check chapter-to-chapter continuity
- `/compare-drafts [files]` - Compare chapter versions

### Batch Operations
- `/batch-generate-wrp` - Mass WRP creation
- `/batch-execute-wrp` - Mass chapter production
- `/batch-review-and-revise` - Mass quality upgrade for multiple chapters

### Maintenance
- `/book-cleanup` - Archive drafts, organize files
- `/update-rules` - Modify author-rules.md
- `/update-timeline` - Maintain story timeline
- `/workshop-ingestion` - Import workshop transcripts into project

### External Integrations (v2)
- `/sync-to-drive [chapter]` - Push manuscript to Google Drive for beta readers (uses Drive MCP)
- `/send-query-letter [agent]` - Draft and send query via Gmail MCP, with plan-mode gate
- `/schedule-writing-time [window]` - Create Calendar blocks with word-count goals

### Reference
- `/workflow-guide` - Display workflow documentation
- `/batch-operations` - Batch command documentation
- `.claude/docs/system-guides/ultrareview-gate.md` - When and how to invoke `/ultrareview` as final publish gate
- `.claude/docs/system-guides/cron-setup.md` - Recommended scheduled jobs (weekly continuity, daily smart-review, query follow-ups)

## Key Files to Check Before Creative Work

1. **author-rules.md** - MANDATORY first read. Contains hard constraints (never break), soft constraints (avoid unless justified), and mandates (always do)
2. **story-compendium.md** - Your story's encyclopedia (character details, timeline, world rules)
3. **project-config.md** - Project-specific settings (genre, voice, tone, themes, dialogue style)
4. **04-Project-Management/style-guide.md** - Voice, tone, prose style guidelines
5. **04-Project-Management/writing-tracker.md** - Current progress and focus areas

## Common Workflows

### Starting New Chapter
```
1. Read author-rules.md (MANDATORY)
2. Check story-compendium.md for context
3. /generate-wrp [chapter-number]
4. Review WRP, adjust if needed
5. /execute-wrp chapter_[X]_WRP.md
   (Automatically triggers review and auto-revision pipeline)
```

### Batch Production
```
1. /batch-generate-wrp (creates WRPs for multiple chapters)
2. Review/adjust WRPs
3. /batch-execute-wrp (writes all chapters with quality pipeline)
```

### Quality Upgrade Existing Chapters
```
/batch-review-and-revise Chapter-01.md Chapter-02.md Chapter-03.md
```

## Performance Characteristics

- Parallel review: ~30 seconds (vs ~5 minutes sequential)
- Smart review: 78% token reduction, 29% faster than full review
- Batch operations: 10x speed improvement with parallel execution
- Quality pipeline: automatic iteration until the review-engine gates pass (see `.claude/docs/review-engine.md`)

## Important Implementation Notes

- This framework uses Claude Code's native Task tool for true parallel agent execution
- Each specialized agent (prose, pacing, dialogue, etc.) gets its own context window
- Never simulate multiple agents in a single Task - this defeats parallelism benefits
- All review commands automatically use parallel execution
- Users should see all agents running simultaneously for full transparency

## Document Updates

When authors discover patterns or make creative decisions, they update:
- `author-rules.md` - Add new constraints or mandates
- `story-compendium.md` - Lock in story decisions
- `04-Project-Management/writing-tracker.md` - Track progress

AI agents should suggest rule updates when patterns emerge.