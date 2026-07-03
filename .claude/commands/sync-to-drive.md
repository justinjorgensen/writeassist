---
description: Push manuscript files to Google Drive for beta readers via the Drive MCP
argument-hint: "[chapter | all]"
---
# Sync to Drive

**No-argument behavior:** If no argument is given: list what would be synced and ask before proceeding.

**Target:** $ARGUMENTS

Sync the current manuscript (or a specific chapter) to a Google Drive folder so beta readers and editors can comment.

## Plan-Mode Gate (MANDATORY)

Syncing publishes content off this machine. Before ANY upload, enter plan mode and present for approval:

1. **Exactly which files** will be synced (full list, no globs)
2. **Destination** (Drive folder path)
3. **Permissions being granted**, called out explicitly. `--beta` mints an anyone-with-link comment permission; say so in plain words and require the author to approve that line item specifically.
4. **Pre-sync check results** (markers, drafts; see below)

Do not upload anything until the author approves the plan. There is no `--no-plan` for this command; external sharing is always gated.

## Prerequisites

The Google Drive MCP must be authenticated. If not:
1. Call `mcp__claude_ai_Google_Drive__authenticate`
2. Then `mcp__claude_ai_Google_Drive__complete_authentication` with the returned code.

## Behavior

### No argument
Sync the entire `02-Manuscript/` directory to `Drive: WriteAssist/<project-name>/`. Creates the folder if missing. Each `.md` file is converted to a Google Doc with the same name.

### Single chapter argument (e.g., `Chapter-03.md`)
Sync just that file. Use this for incremental updates after a chapter passes the review-engine gates.

### `--beta` flag
Adds an anyone-with-link comment permission and prints the share URL. Use only for beta-reader rounds. This is the widest exposure the command can create; it is NEVER applied without the plan-mode approval above naming it explicitly.

## What gets synced

- All `*.md` files in `02-Manuscript/`
- `story-compendium.md` (read-only for beta readers, they get context but can't edit)
- The current `outline.md` if `--include-outline` is passed

## What does NOT get synced

- `.claude/` (framework internals)
- `05-wrp/` (blueprints, readers don't need to see the scaffolding)
- `04-Project-Management/` (private tracking)
- Backup/draft files matching any deprecated versioning pattern: `*-backup-*.md`, `*-draft*.md`, `*-iteration-*.md`, `*-final.md` duplicates, anything under `versions/` or `archive/`

## Pre-sync marker check (MANDATORY)

Before uploading, scan every candidate file for revision scaffolding and REFUSE to sync any file that contains:

- `[AR-` (auto-revise inline markers)
- `<!-- AR-SUGGEST-` (auto-revise suggestion comments)
- `[SCENE ADDED` (write-scene markers)
- `<!-- TIME:` or similar in-chapter time comments (update-timeline scaffolding)

Report the offending files and lines, and point the author at the marker-strip step in `auto-revise-chapter` / `write-scene`. A chapter with markers is not done; it must not reach readers.

## Conflict handling

If a Drive doc was edited since the last sync (different `modifiedTime` than recorded), the command pauses and shows a diff. The author decides: overwrite, pull-and-merge, or skip.

A `.claude/state/drive-sync.json` file records `{file → driveFileId, lastSyncedRevision}` to detect conflicts.

## Example flow

```
Author finishes Chapter 5, /review-chapter decision: PASS
  → /sync-to-drive Chapter-05.md
    → Updates "WriteAssist/MyBook/Chapter-05" Google Doc
    → Email beta readers (manually or via /send-query-letter)
```

## Notes

- Em-dash guard still runs. Files with em-dashes will not have been writable in the first place; sync only fails if a manual file landed there outside the hook.
- Drive's auto-conversion preserves most markdown but flattens code blocks; that's fine for prose-only manuscripts.
