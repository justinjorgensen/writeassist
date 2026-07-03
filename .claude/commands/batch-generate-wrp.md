# Batch Generate WRP (Bulk Chapter Planning)

**Target Chapters:** $ARGUMENTS

---

## Purpose
Generate multiple Writing Requirements Plans (WRPs) efficiently for bulk chapter planning. Creates detailed blueprints for entire acts, books, or custom chapter ranges.

---

## Batch Generation Modes

### 1. **Sequential Generation**
```markdown
"Generate WRPs for chapters 1-10"
"Generate WRPs for Act 2 (chapters 11-20)"
"Generate remaining WRPs for Book One"
```

### 2. **Smart Generation**
```markdown
"Generate WRPs for all outlined chapters"
"Generate WRPs for chapters without WRPs"
"Generate WRPs for revised outline sections"
```

### 3. **Selective Generation**
```markdown
"Generate WRPs for action chapters only"
"Generate WRPs for character introduction chapters"
"Generate WRPs for climax sequences"
```

---

## Pre-Generation Checklist

### Transition Context Handling
- **For sequential chapters**: Each WRP reads the previous chapter's ending (if it exists)
- **For non-sequential**: Note gaps that need bridging
- **For first chapters**: No previous context needed
- **Batch advantage**: Maintains transition continuity across all WRPs

Before batch generating WRPs, the system verifies:

```markdown
## Pre-Flight Check
✓ outline.md exists and is current
✓ story-compendium.md is populated
✓ author-rules.md is configured
✓ Chapter structure defined in outline
✓ Timeline established
✓ Character arcs mapped
```

---

## Batch Process Flow

### Phase 1: Analysis
```markdown
Reading outline.md...
Identifying chapters: 1, 2, 3, 4, 5...
Checking existing WRPs...
Found existing: Chapter 2, 5
To generate: Chapters 1, 3, 4
```

### Phase 2: Context Loading
```markdown
Loading story-compendium.md...
Loading author-rules.md...
Loading timeline.md...
Building context for each chapter...
```

### Phase 3: Generation Loop
```markdown
## Generating Chapter 1 WRP
- Title: "The Awakening"
- POV: Sarah
- Word Target: 3,500
- Scenes: 3
- Status: ✓ Complete

## Generating Chapter 3 WRP
- Title: "First Contact"
- POV: Marcus
- Word Target: 4,000
- Scenes: 4
- Status: ✓ Complete

[Progress Bar] ████████████░░░░░░░░ 60%
```

---

## WRP Generation Intelligence

### Context Awareness
Each WRP considers:
- Previous chapter endings
- Next chapter requirements
- Overall arc progression
- Pacing requirements
- Character availability
- Timeline constraints

### Automatic Elements
```markdown
For each chapter WRP:
1. Pull plot points from outline
2. Assign appropriate POV character
3. Calculate word count based on complexity
4. Structure scenes for optimal pacing
5. Include required story elements
6. Add emotional beats
7. Set hooks and cliffhangers
```

---

## Batch Output Structure

```
05-wrp/
├── chapter-01-awakening-wrp.md
├── chapter-02-discovery-wrp.md
├── chapter-03-first-contact-wrp.md
├── chapter-04-resistance-wrp.md
└── batch-report.md
```

---

## WRP Template Variations

### Action Chapter WRP
- Higher scene count
- Shorter scenes
- Multiple POVs possible
- Clear action beats
- Minimal introspection

### Character Development WRP
- Fewer, deeper scenes
- Single POV focus
- Emotional beat emphasis
- Internal conflict priority
- Relationship dynamics

### World-Building WRP
- Descriptive allowances
- Exploration scenes
- Discovery beats
- Sensory emphasis
- Wonder moments

---

## Batch Report Format

```markdown
# Batch WRP Generation Report
Date: [Timestamp]
Chapters Processed: 10

## Summary
✓ Successfully generated: 8 WRPs
⚠ Skipped (existing): 2 WRPs
✗ Failed: 0 WRPs

## Generated WRPs
1. Chapter 1: "The Awakening" - 3,500 words, 3 scenes
2. Chapter 3: "First Contact" - 4,000 words, 4 scenes
[etc...]

## Continuity Notes
- Timeline verified through Chapter 10
- Character arcs aligned
- Pacing curve optimized
- Cliffhangers established

## Next Steps
1. Review generated WRPs for accuracy
2. Run batch-execute-wrp to write chapters
3. Customize any specific scenes as needed
```

---

## Integration with Pipeline

### Automatic Handoff
```markdown
After batch-generate-wrp completes:
→ Option to run batch-execute-wrp
→ All WRPs queued for execution
→ Automatic quality pipeline ready
```

### Smart Sequencing
```markdown
IF generating sequential chapters:
  Maintain narrative flow
  Build on previous events
  Escalate tension appropriately
  
IF generating non-sequential:
  Note gaps for later filling
  Maintain timeline consistency
  Flag continuity checkpoints
```

---

## Advanced Batch Options

### Parallel Generation
```bash
"Generate Act 1 and Act 3 WRPs simultaneously"
```
- Splits into parallel threads
- Maintains consistency via shared context
- Faster for large batches

### Iterative Refinement
```bash
"Generate and refine WRPs until pacing optimal"
```
- Generates initial WRPs
- Analyzes pacing curve
- Adjusts scene counts/word targets
- Regenerates as needed

### Series Planning
```bash
"Generate Book 2 WRPs based on Book 1 outcomes"
```
- Imports Book 1 completion state
- Evolves character positions
- Advances timeline appropriately
- Maintains series continuity

---

## Performance Optimization

### Batch Size Recommendations
- **Small Batch** (1-5 chapters): 2-5 minutes
- **Medium Batch** (6-15 chapters): 5-15 minutes
- **Large Batch** (16-30 chapters): 15-30 minutes
- **Full Book** (30+ chapters): 30-45 minutes

### Memory Management
- Loads only necessary context
- Releases completed WRPs from memory
- Maintains rolling window of 3 chapters
- Saves progress incrementally

---

## Error Recovery

### Partial Completion Handling
```markdown
If batch interrupted at Chapter 7:
- Saves Chapters 1-6 WRPs
- Logs interruption point
- Can resume from Chapter 7
- No work lost
```

### Validation Failures
```markdown
If Chapter 5 fails validation:
- Continues with remaining chapters
- Flags Chapter 5 for manual review
- Provides detailed error report
- Suggests fixes
```

---

## Success Metrics

Batch generation succeeds when:
- ✓ All requested WRPs generated
- ✓ Continuity maintained across all
- ✓ Pacing curve follows story arc
- ✓ Character arcs properly distributed
- ✓ Word counts meet targets
- ✓ Each WRP passes validation

---

## Common Batch Patterns

### New Book Start
```bash
"Generate all Act 1 WRPs for strong opening"
```

### Mid-Book Momentum
```bash
"Generate next 5 chapters from current position"
```

### Climax Preparation
```bash
"Generate final act WRPs with escalating tension"
```

### Series Continuation
```bash
"Generate Book 2 Chapter 1-5 WRPs from Book 1 ending"
```

---

*Batch WRP generation: Transform your outline into a complete chapter blueprint library in minutes.*