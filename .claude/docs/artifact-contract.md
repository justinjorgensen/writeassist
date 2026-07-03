# Artifact Contract (D7)

Canonical paths and names for everything the framework writes. Every command links here; do not restate or invent variants.

| Artifact | Canonical location |
|----------|--------------------|
| Chapters | `02-Manuscript/Chapter-NN-Title.md` (flat; no Book subdirectories by default) |
| WRPs | `05-wrp/chapter-NN-wrp.md` |
| Outline | `01-Planning/outline.md` |
| Timeline | `01-Planning/timeline.md` (validation report: `01-Planning/timeline-validation.md`) |
| Style guide | `04-Project-Management/style-guide.md` |
| Writing tracker | `04-Project-Management/writing-tracker.md` |
| Review reports | `.claude/state/reviews/<chapter>-<n>.md` |
| Batch reports | `.claude/state/batch-reports/` |
| Story compendium | `story-compendium.md` (project root) |

## Versioning

**Versioning is git.** Commit chapters as they change; revision passes run in git worktrees (`auto-revise-chapter`); compare versions with `git diff`.

Deprecated and NOT to be created: `versions/` folders, `Chapter-XX-backup-<timestamp>.md`, `Chapter-XX-iteration-N.md`, `-draft` sidecars. If old backup files exist, `book-cleanup` archives them.

## Multi-book projects

A project may opt into `02-Manuscript/Book-N/` subdirectories, but nothing in the framework assumes them; commands operate on the flat default unless the author restructures deliberately.
