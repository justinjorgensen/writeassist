# Batch Execute WRP (Mass Chapter Production)

**Target WRPs:** $ARGUMENTS

---

## Purpose
Execute multiple WRPs simultaneously to produce publication-ready chapters at scale. Includes automatic review and fix pipeline for every chapter. Gating is defined in `.claude/docs/review-engine.md` (panel 5/7 Pass+, weighted >= 7.0, critical-fail overrides, max 5 revision iterations).

---

## Batch Execution Modes

### 1. **Full Pipeline Mode** (Default)
```markdown
"Execute all Chapter WRPs with auto-quality"
Each chapter goes through:
1. Write from WRP
2. Review with the parallel critic panel
3. Auto-fix until the review-engine gates pass
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
Stage 2: PARALLEL Review (critic panel running simultaneously)... ✓
  🤖 All critics ran in parallel:
  ├─ Prose: Needs Work
  ├─ Pacing: Pass
  ├─ Character: Needs Work
  ├─ Dialogue: Fail
  └─ [3 more critics]: mixed
Stage 3: Auto-fixing... ✓ (187 fixes applied)
Stage 4: PARALLEL Re-review (critic panel again)... ✓
  🤖 Review-engine gates now pass:
  ├─ Prose: Pass ✓
  ├─ Pacing: Pass ✓
  ├─ Character: Strong Pass ✓
  ├─ Dialogue: Pass ✓
  └─ [3 more critics]: Pass+ ✓
Stage 5: Saving final... ✓
Result: PUBLICATION READY (gates passed)

## Processing Chapter 2
Stage 1: Writing from WRP... ⏳ (52% complete)
[Progress] ████████████░░░░░░░░ 

Queue: Chapter 3, 4, 5, 6, 7, 8, 9, 10

NOTE: Each review runs the critic panel SIMULTANEOUSLY
      Not sequential simulation - REAL parallel execution
```

---

## Quality Assurance Pipeline

### Automatic for Each Chapter
```python
FOR each chapter:
  1. WRITE from WRP
  2. REVIEW with the critic panel
  3. WHILE decision == "REVISE" (per review-engine.md) AND iterations < 5:
       - Run auto-fix-chapter
       - Re-review
       - Log improvements
  4. IF still failing the gates:
       - Flag for manual review
       - Continue with next chapter
  5. SAVE final version with the panel verdict
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
# Chapter Review Report
Chapter: 01 - The Awakening
Final Decision: PASS (per .claude/docs/review-engine.md)

| Dimension | Initial Tier | Final Tier |
|-----------|--------------|------------|
| Prose | Needs Work | Pass |
| Pacing | Pass | Pass |
| Dialogue | Fail | Pass |
| Character | Needs Work | Strong Pass |

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

## Chapter Results
| Chapter | Title | Words | Decision | Status |
|---------|-------|-------|----------|---------|
| 1 | The Awakening | 4,234 | PASS | ✓ Ready |
| 2 | Discovery | 3,987 | PASS | ✓ Ready |
| 3 | First Contact | 4,456 | PASS | ✓ Ready |
| 4 | Resistance | 4,102 | REVISE | ⚠ Manual Review |
| 5 | Alliance | 4,678 | PASS | ✓ Ready |

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
1. Review Chapter 4 (failed the review-engine gates)
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

### Progress Reporting
```markdown
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
"Generate and execute all Book One chapters until the review gates pass"
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
- ✓ All chapters pass the review-engine gates (see .claude/docs/review-engine.md)
- ✓ Word count targets met (±10%)
- ✓ Continuity verified across batch
- ✓ No critical errors
- ✓ Timeline consistency maintained
- ✓ Character voices distinct
- ✓ Zero em dashes remain

---

*Batch execution: From WRPs to publication-ready manuscript at scale.*