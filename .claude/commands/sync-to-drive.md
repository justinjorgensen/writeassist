# Sync to Drive

**Target:** $ARGUMENTS

Sync the current manuscript (or a specific chapter) to a Google Drive folder so beta readers and editors can comment.

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
Adds a public-comment permission link and prints the share URL. Use only for beta-reader rounds.

## What gets synced

- All `*.md` files in `02-Manuscript/`
- `story-compendium.md` (read-only for beta readers, they get context but can't edit)
- The current `outline.md` if `--include-outline` is passed

## What does NOT get synced

- `.claude/` (framework internals)
- `05-wrp/` (blueprints, readers don't need to see the scaffolding)
- `04-Project-Management/` (private tracking)
- Backup files matching `*-backup-*.md`

## Conflict handling

If a Drive doc was edited since the last sync (different `modifiedTime` than recorded), the command pauses and shows a diff. The author decides: overwrite, pull-and-merge, or skip.

A `.claude/state/drive-sync.json` file records `{file → driveFileId, lastSyncedRevision}` to detect conflicts.

## Example flow

```
Author finishes Chapter 5, passes /review-chapter (8.4 avg)
  → /sync-to-drive Chapter-05.md
    → Updates "WriteAssist/MyBook/Chapter-05" Google Doc
    → Email beta readers (manually or via /send-query-letter)
```

## Notes

- Em-dash guard still runs. Files with em-dashes will not have been writable in the first place; sync only fails if a manual file landed there outside the hook.
- Drive's auto-conversion preserves most markdown but flattens code blocks; that's fine for prose-only manuscripts.
