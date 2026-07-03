# Batch Review and Fix (Mass Quality Upgrade)

**Target Chapters:** $ARGUMENTS

---

## Purpose
Review and automatically fix multiple existing chapters to ensure all meet 8.0+ quality standards. Perfect for upgrading draft manuscripts, implementing new style rules, or preparing for submission.

---

## Batch Review Modes

### 1. **Full Manuscript Scan**
```markdown
"Review and fix all chapters in Book One"
"Review entire manuscript and fix to 8.0+"
```

### 2. **Selective Review**
```markdown
"Review chapters flagged by beta readers"
"Review and fix dialogue-heavy chapters"
"Review action sequences only"
```

### 3. **Rule Enforcement**
```markdown
"Remove all em dashes from entire manuscript"
"Apply new style rules to all chapters"
"Fix all passive voice in action scenes"
```

---

## Review Process Flow

### Phase 1: Discovery
```markdown
## Scanning Manuscript
Found: 25 chapters
Total Words: 98,456
Average Score: Unknown
Em Dashes Detected: 147 (WILL BE ELIMINATED)

Chapters to Process:
- 02-Manuscript/Chapter-01-The-Awakening.md
- 02-Manuscript/Chapter-02-Discovery.md
[... all chapters listed ...]
```

### Phase 2: Parallel Review
```markdown
## Deploying Review Agents - Parallel Execution
Each chapter gets 10 simultaneous agents with separate contexts.

**Implementation Note**: Invoke multiple Task agents in a single response for each chapter. Do not simulate multiple agents within one task.

Chapter 1: Running 10 agents...
├─ Style Review ✓
├─ Pacing Analysis ✓
├─ Character Review ✓
└─ [7 more agents] ✓
Overall: 8.3/10 ✓

Chapter 2: Running 10 agents...
├─ Style Review [████████░░] 80%
├─ Pacing Analysis [██████████] 100% ✓
├─ Character Review [███████░░░] 70%
└─ [7 more agents running...]

Chapter 3: Queued
Chapter 4: Queued
Chapter 5: Queued

Each chapter's 10 agents run simultaneously with separate context windows for optimal speed and accuracy
```

### Phase 3: Fix Application
```markdown
## Applying Automatic Fixes

PRIORITY 1: EM DASH REMOVAL (Zero Tolerance)
- Scanning all chapters...
- Found: 147 em dashes
- Replacing with appropriate punctuation...
- Verification: 0 em dashes remain ✓

PRIORITY 2: Quality Fixes
Chapter 1: 156 fixes applied
Chapter 2: 98 fixes applied
Chapter 3: 203 fixes applied
[Progress] ████████░░░░░░░░░░░░ 40%
```

---

## Scoring Dashboard

```markdown
# Live Quality Dashboard
═══════════════════════════════════════════

## Overall Manuscript Health
Average Score: 7.4 → 8.3 ↑
Chapters Below 8.0: 8 → 0 ✓
Total Fixes Applied: 2,847

## Category Breakdown
                Before  After   Change
Prose Quality:  7.2     8.4     +1.2 ↑
Pacing:        7.8     8.3     +0.5 ↑
Dialogue:      6.9     8.2     +1.3 ↑
Character:     7.5     8.3     +0.8 ↑
Continuity:    8.1     8.4     +0.3 ↑

## Critical Issues Fixed
✓ All em dashes removed (147)
✓ All filter words reduced (423)
✓ All passive voice in action fixed (234)
✓ All dialogue tags varied (156)
```

---

## Fix Priority System

### Level 1: Critical (Mandatory)
```markdown
100% Confidence - Always Fixed:
- Em dash removal (ZERO TOLERANCE)
- Grammar errors
- Spelling mistakes
- Punctuation errors
- Format inconsistencies
```

### Level 2: High (Auto-Fixed)
```markdown
95% Confidence - Automatically Applied:
- Filter words (saw, felt, heard)
- Passive voice in action
- Redundant adverbs
- Weak verbs
- Repetitive sentence starts
```

### Level 3: Medium (Contextual)
```markdown
90% Confidence - Context Checked:
- Dialogue tag variety
- Paragraph length variation
- Transition improvements
- Sensory detail addition
- Pacing adjustments
```

---

## Specialized Batch Operations

### Em Dash Elimination Campaign
```markdown
"Eliminate all em dashes from manuscript"

Executing Zero Tolerance Protocol:
- Scanning: 25 chapters
- Found: 147 em dashes
- Replacing with:
  - Commas: 67 instances
  - Colons: 34 instances
  - Parentheses: 28 instances
  - Period + new sentence: 18 instances
- Verification scan...
- Result: 0 em dashes remain
✓ MANUSCRIPT IS EM DASH FREE
```

### Dialogue Enhancement Batch
```markdown
"Review and fix all dialogue across manuscript"

Focus: Dialogue optimization
- Natural flow enhancement
- Tag variety improvement
- Subtext clarification
- Voice distinction sharpening
- Action beat integration
```

### Pacing Optimization Batch
```markdown
"Fix pacing issues in all chapters"

Analyzing pace curve...
- Slow chapters: 3, 7, 12 (will accelerate)
- Rush chapters: 9, 15 (will decelerate)
- Optimizing sentence variety
- Adjusting paragraph lengths
- Balancing description/action
```

---

## Batch Report Generation

```markdown
# Batch Review & Fix Report
Date: [Timestamp]
Chapters Processed: 25/25
Time Elapsed: 47 minutes

## Executive Summary
✓ All chapters now meet 8.0+ standard
✓ Zero em dashes in entire manuscript
✓ All author rules enforced
✓ Continuity verified across book

## Before/After Comparison
| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Average Score | 7.4 | 8.3 | +0.9 |
| Chapters <8.0 | 8 | 0 | -8 |
| Em Dashes | 147 | 0 | -147 |
| Filter Words | 423 | 87 | -336 |
| Passive Voice | 234 | 12 | -222 |

## Chapter-by-Chapter Results
[Detailed breakdown for each chapter]

## Patterns Detected
1. Tendency to use em dashes in dialogue (FIXED)
2. Overuse of "suddenly" (REDUCED by 78%)
3. Repetitive sentence starts in action (VARIED)

## Recommendations
1. All chapters ready for beta readers
2. Consider manual review of Chapter 12 climax
3. Update author-rules.md with new patterns
```

---

## Continuous Monitoring Mode

### Real-Time Quality Tracking
```markdown
Monitoring Mode Active
Watching: 02-Manuscript/

[NEW] Chapter 26 detected
→ Running automatic review
→ Score: 7.6/10
→ Applying fixes...
→ New score: 8.2/10
✓ Chapter 26 ready

[EDIT] Chapter 12 modified
→ Re-reviewing changed sections
→ Em dash detected! (REMOVING)
→ Fixes applied
✓ Chapter 12 maintained at 8.3/10
```

---

## Performance Metrics

### Processing Speed
- **Review Speed**: ~30 seconds per chapter
- **Fix Application**: ~45 seconds per chapter
- **Total per Chapter**: ~1.5 minutes
- **25 Chapter Book**: ~35-40 minutes

### Resource Usage
```markdown
CPU: ████████░░ 80%
Memory: ██████░░░░ 60%
Parallel Threads: 4
Chapters/Hour: ~40
```

---

## Advanced Features

### Learning Mode
```markdown
Pattern Recognition Active:
- Your style prefers short action sentences
- You avoid semicolons (only 3 in manuscript)
- You prefer "said" over alternatives (good!)
→ Applying learned preferences to fixes
```

### Consistency Enforcement
```markdown
Cross-Chapter Standardization:
- Character name spelling verified
- Location descriptions aligned
- Technology terms consistent
- Timeline references checked
```

### Version Control Integration
```markdown
Git Integration:
- Each batch creates new branch
- Commits after each chapter
- Full rollback capability
- Diff reports available
```

---

## Error Recovery

### Partial Batch Recovery
```markdown
Batch interrupted at Chapter 15:
- Chapters 1-14: Saved and complete
- Chapter 15: Partial (rolling back)
- Chapters 16-25: Pending
Resume? [Y/N]
```

### Quality Assurance Fallback
```markdown
Chapter 8 won't reach 8.0 after 5 iterations:
→ Saving at 7.9/10
→ Flagging for manual review
→ Detailed issue report generated
→ Continuing with remaining chapters
```

---

## Integration with Other Commands

### Complete Pipeline
```bash
1. "Generate all WRPs" → batch-generate-wrp
2. "Write all chapters" → batch-execute-wrp  
3. "Review and fix all" → batch-review-and-fix
4. "Export manuscript" → compile-manuscript
```

### Maintenance Mode
```bash
Weekly: "Review and fix any chapters below 8.0"
After edits: "Re-review modified chapters"
Before submission: "Final review and fix all"
```

---

## Success Criteria

Batch review succeeds when:
- ✓ All chapters analyzed
- ✓ All scores ≥ 8.0 (or flagged)
- ✓ Zero em dashes remain
- ✓ All fixes applied successfully
- ✓ Reports generated
- ✓ Backups created
- ✓ No data loss

---

*Batch review and fix: Upgrade your entire manuscript to professional standards in under an hour.*