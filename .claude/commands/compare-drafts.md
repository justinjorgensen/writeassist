---
description: Compare two or more chapter drafts and report differences
argument-hint: "[file-A] [file-B]"
allowed-tools: Read, Grep, Glob
---
# compare-drafts

**Target:** $ARGUMENTS

**No-argument behavior:** If fewer than two files are given: list candidate versions (git history of the chapter) and stop.

Compare different versions of chapters to track changes, improvements, and revision history.

## Command Purpose
Visualize what changed between drafts, track revision progress, and maintain version history for all manuscript changes.

## Usage

```bash
"Compare drafts of Chapter 5"
"Show all changes in latest revision"
"Compare version 1 vs version 3 of Chapter 10"
"Generate revision report for editor"
```

## Comparison Types

### Line-by-Line Comparison
- Shows exact changes
- Added text (green)
- Deleted text (red)
- Modified text (yellow)

### Summary Comparison
- Word count changes
- Scene additions/deletions
- Character appearance changes
- Dialogue percentage shift
- Pacing modifications

### Structural Comparison
- Scene order changes
- POV shifts
- Chapter breaks
- Paragraph restructuring

## Version Management

**Versioning is git** (see `.claude/docs/artifact-contract.md`). There is one current file per chapter; historical versions are git commits and auto-revise worktree branches.

```
# Compare current vs an earlier commit
git diff <commit> -- 02-Manuscript/Chapter-01-Title.md

# Compare two revision passes
git diff revise/chapter-01-pass-1 revise/chapter-01-pass-3 -- 02-Manuscript/Chapter-01-Title.md
```

## Comparison Output

```markdown
# Revision Report: Chapter 5

## Overview
- **Previous Version**: v1.2 (March 1, 2025)
- **Current Version**: v2.0 (March 15, 2025)
- **Word Count**: 3,847 → 4,235 (+388)
- **Scenes**: 3 → 4 (+1 scene added)

## Major Changes

### Added Content
+ New scene: Sarah discovers the letter (Line 145-289)
+ Extended dialogue between Mark and Jennifer (Line 456-501)
+ Internal monologue during climax (Line 890-923)

### Deleted Content
- Removed redundant description of house (Line 67-89)
- Cut excessive backstory (Line 234-278)

### Modified Content
~ Revised opening paragraph for stronger hook
~ Simplified complex sentences throughout
~ Changed POV character's age from 28 to 32

## Statistics
- **Dialogue**: 35% → 42% (+7%)
- **Description**: 40% → 30% (-10%)
- **Action**: 25% → 28% (+3%)
- **Reading Level**: Grade 8 → Grade 7
- **Pacing Score**: 7/10 → 9/10

## Editor Notes Applied
✓ "Make opening more immediate" - DONE
✓ "Add more dialogue" - DONE
✓ "Cut purple prose" - DONE
⧖ "Consider adding subplot" - PENDING
```

## Revision Workflow

### Step 1: Create New Version
```bash
"Start revision of Chapter 5"
# Creates Chapter-05-v2.0-draft.md
```

### Step 2: Track Changes
```bash
"Track changes while revising Chapter 5"
# Real-time change monitoring
```

### Step 3: Review Changes
```bash
"Review all changes in Chapter 5"
# Shows comprehensive diff
```

### Step 4: Accept/Reject
```bash
"Accept revision of Chapter 5"
# Promotes draft to current version
```

## AI Agents Activated

- **continuity-checker** - Ensures consistency
- **style-editor** - Tracks style changes
- **pacing-master** - Analyzes pacing shifts

## Batch Operations

```bash
"Compare all chapters before/after editor feedback"
"Show revision statistics for entire manuscript"
"Generate revision history for Book One"
```

## Integration Features

### Editor Feedback Tracking
- Import editor comments
- Track implementation status
- Generate response report

### Beta Reader Integration
- Compare pre/post beta feedback
- Track which suggestions were applied
- Generate thank-you notes with changes

## Export Options

- PDF with track changes
- HTML with side-by-side view
- Markdown with diff markers
- Editor-friendly Word format

## Best Practices

1. Version before major changes
2. Use descriptive version labels
3. Keep revision notes
4. Track why changes were made
5. Maintain original vision document
6. Archive all feedback
7. Date all versions