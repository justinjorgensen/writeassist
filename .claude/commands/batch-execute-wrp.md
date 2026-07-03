# Batch Execute WRP (Mass Chapter Production)

**Target WRPs:** $ARGUMENTS

---

## Purpose
Execute multiple WRPs simultaneously to produce publication-ready chapters at scale. Includes automatic review and fix pipeline for every chapter, ensuring all output meets 8.0+ quality threshold.

---

## Batch Execution Modes

### 1. **Full Pipeline Mode** (Default)
```markdown
"Execute all Chapter WRPs with auto-quality"
Each chapter goes through:
1. Write from WRP
2. Review with 10 agents
3. Auto-fix until 8.0+
4. Save final version
```

### 2. **Draft Mode**
```markdown
"Execute WRPs draft-only for speed"
- Writes all chapters
- Skips review/fix pipeline
- For rapid first drafts
- Review later in batch
```

### 3. **Progressive Mode**
```markdown
"Execute WRPs one at a time with review"
- Complete each chapter fully
- Show results before proceeding
- Allow manual intervention
- Best for critical chapters
```

---

## Execution Pipeline

### Pre-Execution Validation
```markdown
## System Check
✓ All WRP files valid
✓ story-compendium.md loaded
✓ author-rules.md loaded (NO EM DASHES!)
✓ Previous chapters available for continuity
✓ Output directories ready
✓ Backup system active
```

### Batch Execution Flow (TRUE PARALLEL AGENTS)
```markdown
## Processing Chapter 1
Stage 1: Writing from WRP... ✓ (4,234 words)
Stage 2: PARALLEL Review (10 agents running simultaneously)... ✓
  🤖 All agents ran in parallel:
  ├─ Style Review: 7.2/10
  ├─ Pacing Analysis: 7.8/10
  ├─ Character Review: 7.5/10
  ├─ Dialogue Analysis: 6.9/10
  └─ [6 more agents]: Avg 7.4/10
Stage 3: Auto-fixing... ✓ (187 fixes applied)
Stage 4: PARALLEL Re-review (10 agents again)... ✓
  🤖 All scores now above 8.0:
  ├─ Style Review: 8.3/10 ✓
  ├─ Pacing Analysis: 8.2/10 ✓
  ├─ Character Review: 8.4/10 ✓
  ├─ Dialogue Analysis: 8.1/10 ✓
  └─ [6 more agents]: Avg 8.3/10 ✓
Stage 5: Saving final... ✓
Result: PUBLICATION READY (8.2/10 average)

## Processing Chapter 2
Stage 1: Writing from WRP... ⏳ (52% complete)
[Progress] ████████████░░░░░░░░ 

Queue: Chapter 3, 4, 5, 6, 7, 8, 9, 10

NOTE: Each review uses 10 SIMULTANEOUS agents
      Not sequential simulation - REAL parallel execution
```

---

## Quality Assurance Pipeline

### Automatic for Each Chapter
```python
FOR each chapter:
  1. WRITE from WRP
  2. REVIEW with all agents
  3. WHILE any_score < 8.0 AND iterations < 5:
       - Run auto-fix-chapter
       - Re-review
       - Log improvements
  4. IF still < 8.0:
       - Flag for manual review
       - Continue with next chapter
  5. SAVE final version with scores
```

### Parallel Processing Options
```markdown
Mode: Parallel-4
Running simultaneously:
- Thread 1: Chapter 1 (Stage 3: Auto-fixing)
- Thread 2: Chapter 2 (Stage 1: Writing)
- Thread 3: Chapter 3 (Stage 2: Review)
- Thread 4: Chapter 4 (Stage 1: Writing)
```

---

## Output Management

### File Structure
```
02-Manuscript/
├── Chapter-01-The-Awakening.md
├── Chapter-01-The-Awakening-scores.md
├── Chapter-01-The-Awakening-backup-v1.md
├── Chapter-02-Discovery.md
├── Chapter-02-Discovery-scores.md
└── batch-execution-report.md
```

### Score Tracking
```markdown
# Chapter Score Report
Chapter: 01 - The Awakening
Final Score: 8.3/10

| Category | Initial | Final | Improvement |
|----------|---------|-------|-------------|
| Prose | 7.2 | 8.3 | +1.1 |
| Pacing | 7.8 | 8.2 | +0.4 |
| Dialogue | 6.9 | 8.1 | +1.2 |
| Character | 7.5 | 8.4 | +0.9 |

Total Fixes Applied: 187
Iterations Required: 2
Processing Time: 8 minutes
```

---

## Continuity Management

### Automatic Updates
After each chapter completion:
- Update character details in story-compendium
- Track timeline progression
- Note new plot developments
- Record relationship changes
- Flag world-building additions

### Cross-Chapter Validation
```markdown
Continuity Check Between Chapters:
✓ Timeline consistent (3 days passed)
✓ Character positions tracked
✓ Injuries/conditions maintained
⚠ New character introduced (added to compendium)
✓ Setting descriptions aligned
```

---

## Batch Execution Report

```markdown
# Batch Execution Summary
Date: [Timestamp]
Chapters Processed: 10/10
Total Words: 42,847
Average Score: 8.4/10
Total Time: 1 hour 23 minutes

## Chapter Results
| Chapter | Title | Words | Score | Status |
|---------|-------|-------|-------|---------|
| 1 | The Awakening | 4,234 | 8.3 | ✓ Ready |
| 2 | Discovery | 3,987 | 8.5 | ✓ Ready |
| 3 | First Contact | 4,456 | 8.1 | ✓ Ready |
| 4 | Resistance | 4,102 | 7.9 | ⚠ Manual Review |
| 5 | Alliance | 4,678 | 8.4 | ✓ Ready |

## Automated Fixes Summary
- Total fixes applied: 1,847
- Em dashes removed: 73
- Filter words removed: 234
- Passive voice activated: 156
- Dialogue enhanced: 198
- Transitions smoothed: 89

## Continuity Status
✓ Timeline verified
✓ Character consistency maintained
✓ Setting descriptions aligned
⚠ 2 minor continuity notes for review

## Next Steps
1. Review Chapter 4 (didn't reach 8.0)
2. Read through for artistic preferences
3. Run final proofread
4. Export for beta readers
```

---

## Performance Optimization

### Batch Size Guidelines
- **Small** (1-3 chapters): Full pipeline each
- **Medium** (4-10 chapters): Parallel processing recommended
- **Large** (11-25 chapters): Progressive with breaks
- **Massive** (26+ chapters): Split into acts

### Resource Management
```markdown
Memory Usage: [████████░░] 78%
CPU Usage: [██████████] 95%
Estimated Remaining: 45 minutes
Chapters Complete: 6/15
Current: Chapter 7 (Auto-fixing)
```

---

## Advanced Features

### Intelligent Continuity
```markdown
Chapter 8 detected reference to Chapter 3 event
→ Loading Chapter 3 context
→ Verifying consistency
→ Adjusting details for alignment
✓ Continuity maintained
```

### Style Learning
```markdown
Pattern detected: Author prefers short paragraphs in action
→ Adjusting Chapter 9 action scenes
→ Applying learned style preferences
✓ Style consistency improved
```

### Adaptive Pacing
```markdown
Act 2 pacing analysis:
- Chapters 6-7: Slower (intentional)
- Chapter 8: Needs acceleration
→ Adjusting Chapter 8 scene tempo
✓ Pacing curve optimized
```

---

## Error Handling

### Recovery Options
```markdown
Error in Chapter 5 execution:
1. Retry with same WRP
2. Skip and continue
3. Switch to manual mode
4. Regenerate WRP and retry
5. Abort batch (saves completed)
```

### Rollback Capability
```markdown
All chapters backed up before fixes:
- Can restore any chapter to draft
- Can undo specific fix iterations
- Can revert entire batch
- Version history maintained
```

---

## Integration Commands

### Full Book Pipeline
```bash
"Generate and execute all Book One chapters to 8.0+"
```
1. Runs batch-generate-wrp
2. Runs batch-execute-wrp
3. Ensures all chapters ready

### Daily Writing Session
```bash
"Execute today's 3 planned chapters"
```
1. Identifies today's WRPs
2. Executes with full pipeline
3. Updates writing tracker

### Revision Pipeline
```bash
"Re-execute chapters with updated WRPs"
```
1. Detects modified WRPs
2. Re-writes affected chapters
3. Maintains version history

---

## Success Metrics

Batch execution succeeds when:
- ✓ All chapters reach 8.0+ scores
- ✓ Word count targets met (±10%)
- ✓ Continuity verified across batch
- ✓ No critical errors
- ✓ Timeline consistency maintained
- ✓ Character voices distinct
- ✓ Zero em dashes remain

---

*Batch execution: From WRPs to publication-ready manuscript at scale.*