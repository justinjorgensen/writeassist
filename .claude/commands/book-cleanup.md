---
description: Archive drafts and organize project files
---
# book-cleanup

**No-argument behavior:** Takes no arguments; operates on the whole project.

Performs deep cleaning of book project files, archiving redundant content while preserving quality data in STORY_COMPENDIUM.

## Usage
```
/book-cleanup [options]
```

## Options
- `--analyze` - Analyze files without making changes
- `--archive` - Move redundant files to archive
- `--consolidate` - Merge duplicate information
- `--validate` - Check story compendium completeness
- `--all` - Perform all cleanup operations

## Workflow

### 1. Analysis Phase
- Scan all project directories
- Identify duplicate information
- Find orphaned files
- Check for inconsistencies
- Extract unique quality data not in STORY_COMPENDIUM

### 2. Evaluation Phase
- Compare all content against STORY_COMPENDIUM
- Identify gaps in documentation
- Find contradictions
- Prepare consolidation plan

### 3. Archive Phase
- Create dated archive folder
- Move redundant files
- Preserve directory structure
- Log all movements

### 4. Consolidation Phase
- Add extracted quality data to STORY_COMPENDIUM
- Merge character profiles
- Combine timeline information
- Integrate world-building notes

### 5. Validation Phase
- Verify STORY_COMPENDIUM completeness
- Check cross-references
- Validate timeline consistency
- Confirm character tracking

## File Categories

### Keep in Active Directory
- Current manuscript chapters
- Active planning documents
- story-compendium.md
- Style guide
- Writing tracker
- WRP files in use

### Archive Candidates
- Old outlines
- Superseded drafts
- Duplicate research
- Abandoned plot threads
- Previous versions
- Temporary notes

### Extract Before Archiving
- Unique character details
- World-building elements
- Timeline events
- Research insights
- Useful descriptions
- Plot ideas worth keeping

## Examples

```bash
/book-cleanup --analyze
# Shows what would be cleaned without changes

/book-cleanup --archive --validate
# Archives redundant files and validates STORY_COMPENDIUM

/book-cleanup --all
# Complete cleanup with all operations
```

## Cleanup Checklist

1. Back up project first
2. Run analysis
3. Review proposed changes
4. Extract valuable data
5. Execute cleanup
6. Validate story compendium
7. Maintain tracking files

## Expected Results

- STORY_COMPENDIUM becomes single source of truth
- Clean directory structure
- No lost information
- Easier navigation
- Faster searches
- Reduced confusion
- Clear versioning

## Archive Structure

```
archive/
├── 2024-01-15_cleanup/
│   ├── old_outlines/
│   ├── character_drafts/
│   ├── abandoned_plots/
│   └── cleanup_log.md
```

## Safety Features

- Nothing permanently deleted
- All moves logged
- STORY_COMPENDIUM backed up
- Confirmation prompts
- Dry run option
- Rollback capability

## Integration with Other Commands

- Run before major revisions
- Use after completing drafts
- Execute before submissions
- Schedule regular cleanups

## Report Output

After cleanup:
```
Cleanup Report - [Date]
========================
Files Analyzed: XXX
Files Archived: XX
Data Extracted: XX items
Story Compendium Updated: XX sections
Contradictions Resolved: XX
Space Saved: XX MB
```

## Best Practices

1. Clean up monthly
2. Always analyze first
3. Review before archiving
4. Extract before moving
5. Validate after cleanup
6. Document decisions
7. Keep archive organized