# Migrating from WriteAssist v1 → v2

This document explains what changed in v2 and what you need to do if you have an in-progress v1 manuscript.

**v1 lives at:** `~/projects/WriteAssist` (untouched, keep it as your safety net).
**v2 lives at:** `~/projects/WriteAssist-v2` (this folder).

## TL;DR

v2 takes the existing WriteAssist framework and layers on Claude Code features that have shipped since Oct 2025. **No agents or commands were removed.** The writing workflow is unchanged. What's new is *enforcement*, *integration*, and *isolation*.

## What's new

| Area | v1 | v2 |
|---|---|---|
| Em-dash policy | Agent instruction (sometimes missed) | **Mechanical hook**, em dashes can't be written to disk |
| Agent capabilities | All agents could do anything | **YAML frontmatter** with strict tool restrictions; reviewers locked to read-only |
| Revision iteration | In-place rewrite, single backup file | **Git worktrees**, each pass is its own branch, diffable |
| Plan approval | None, model commits artifacts immediately | **Plan-mode gates** on `/outline-book` and `/generate-wrp` |
| Status visibility | Check `writing-tracker.md` manually | **Custom statusline**, live word count, em-dash count, last review score |
| External tools | None | **Drive / Gmail / Calendar MCPs** wired via 3 new commands |
| Recurring jobs | Manual | **Cron / routines** (opt-in, documented in `cron-setup.md`) |
| Final publish gate | Just `review-chapter` | **`/code-review ultra`** documented as cloud final gate |
| Cross-project reach | Framework-bound | **Skills** (`writeassist-workflow`, `improv-story-form`) work in any project |

## File-level changes

### New
- `.claude/settings.json`, hooks + statusline config
- `.claude/scripts/em-dash-guard.sh`, PostToolUse blocker
- `.claude/scripts/update-tracker.sh`, Stop-hook tracker append
- `.claude/scripts/post-chapter-review.sh`, opt-in chapter-save breadcrumb
- `.claude/scripts/statusline.sh`, live status line
- `.claude/skills/writeassist-workflow/SKILL.md`, author workflow skill
- `.claude/skills/improv-story-form/SKILL.md`, premise builder skill
- `.claude/commands/sync-to-drive.md`, Drive MCP integration
- `.claude/commands/send-query-letter.md`, Gmail MCP integration
- `.claude/commands/schedule-writing-time.md`, Calendar MCP integration
- `.claude/docs/system-guides/ultrareview-gate.md`, final-gate doc
- `.claude/docs/system-guides/cron-setup.md`, scheduled-job recipes
- `MIGRATION.md`, this file

### Modified
- All 24 agents in `.claude/agents/*.md` that previously lacked frontmatter, now carry `name`, `description`, `tools`, `model` keys
- `.claude/commands/outline-book.md`, plan-mode gate prepended
- `.claude/commands/generate-wrp.md`, plan-mode gate prepended
- `.claude/commands/auto-revise-chapter.md`, worktree-iteration section prepended
- `CLAUDE.md`, sections added covering tool isolation, hooks, plan-mode gates, worktrees, statusline, skills

### Unchanged
- `author-rules.md`, `project-config.md`, `story-compendium.md` (still blank templates, fill them in per project)
- All HTML guides (`readme.html`, `technical-guide.html`, `improv_story_form.html`)
- The newer agents (`content-analyzer`, `transition-validator`), they already had frontmatter. (Historical note: `context-filter`, `meta-coordinator`, and `simple-content-analyzer` also shipped with frontmatter but were deleted in the 2026-07-03 remediation as unreferenced or policy-violating.)
- Directory layout (`01-Planning/`, `02-Manuscript/`, `03-Resources/`, `04-Project-Management/`, `05-wrp/`)

## Migrating an in-progress v1 manuscript

If you have a real book underway in `~/projects/WriteAssist` (or a `WriteAssist-Story`-style derived folder), here's the path:

1. **Don't move the old folder.** Keep it as backup until v2 proves itself.
2. **Create a fresh v2-based project folder for the book**:
   ```bash
   cp -r ~/projects/WriteAssist-v2 ~/projects/<your-book-name>
   ```
3. **Copy your filled-in constraint docs** from the old project:
   ```bash
   cp ~/projects/<old-project>/{project-config,author-rules,story-compendium}.md ~/projects/<your-book-name>/
   ```
4. **Copy the manuscript and WRPs**:
   ```bash
   cp ~/projects/<old-project>/02-Manuscript/*.md ~/projects/<your-book-name>/02-Manuscript/
   cp ~/projects/<old-project>/05-wrp/*.md ~/projects/<your-book-name>/05-wrp/
   ```
5. **Clean any em-dashes first**, or the hook will reject the first edit. Sweep:
   ```bash
   cd ~/projects/<your-book-name>
   grep -rlP '\x{2014}|(?<!-)--(?!-)' 02-Manuscript/ 01-Planning/ 05-wrp/
   # Hand-edit the matches with appropriate replacements (comma / colon / parens)
   ```
6. **Initialize git** if you want worktree-based revisions:
   ```bash
   cd ~/projects/<your-book-name>
   git init && git add -A && git commit -m "import from v1"
   ```
7. **Smoke-test the hooks**: in a Claude Code session, try editing a manuscript file to add an em dash. The hook should block it with exit 2.
8. **Smoke-test the statusline**: it should show `em-dash:0` in green.
9. **Optionally install cron jobs** per `.claude/docs/system-guides/cron-setup.md`.
10. **Authenticate MCPs** you want to use (Drive, Gmail, Calendar). See each command's prerequisites.

## Rollback

If anything in v2 misbehaves:
- The hook scripts are plain bash, delete `.claude/settings.json` to disable all of them at once.
- The new agent frontmatter is non-destructive; strip the `---...---` block from any agent file to revert that one agent.
- Plan-mode gates can be bypassed per-invocation with `--no-plan`.
- Worktree revisions can be skipped by editing the chapter directly; the rest of the framework doesn't care.

## What's intentionally NOT in v2

- **No fork of `review-chapter` or `execute-wrp`.** They work as-is, they just now run against agents with tighter tool restrictions.
- **No replacement of the 24 slash commands with skills.** Slash commands stay as the in-framework primitives. Skills are for cross-project reach.
- **No automatic /code-review ultra triggering.** It's an author-driven final gate per Claude Code's design (user-triggered + billed).
- **No backwards-compat shims.** If you fork v1 and v2 diverges further, you'll merge by hand.
