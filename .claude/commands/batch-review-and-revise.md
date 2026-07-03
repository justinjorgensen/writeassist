# Batch Review and Fix (Mass Quality Upgrade)

**Target Chapters:** $ARGUMENTS

---

## Purpose
Review and automatically fix multiple existing chapters until each passes the review gates. Gating is defined in `.claude/docs/review-engine.md` (panel 5/7 Pass+, weighted >= 7.0, critical-fail overrides, max 5 revision iterations). Perfect for upgrading draft manuscripts, implementing new style rules, or preparing for submission.

---

## Batch Review Modes

### 1. **Full Manuscript Scan**
```markdown
"Review and fix all chapters in Book One"
"Review entire manuscript and fix until the review gates pass"
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
Review Status: not yet reviewed
Em Dashes Detected: 147 (WILL BE ELIMINATED)

Chapters to Process:
- 02-Manuscript/Chapter-01-The-Awakening.md
- 02-Manuscript/Chapter-02-Discovery.md
[... all chapters listed ...]
```

### Phase 2: Parallel Review
```markdown
## Deploying Review Agents - Parallel Execution
Each chapter gets the full critic panel running simultaneously with separate contexts.

**Implementation Note**: Invoke multiple Task agents in a single response for each chapter. Do not simulate multiple agents within one task.

Chapter 1: Running the critic panel...
├─ Prose (style-editor) ✓
├─ Pacing (pacing-master) ✓
├─ Character (beta-reader-sim) ✓
└─ [4 more critics] ✓
Decision: PASS ✓

Chapter 2: Running the critic panel...
├─ Prose (style-editor) [████████░░] 80%
├─ Pacing (pacing-master) [██████████] 100% ✓
├─ Character (beta-reader-sim) [███████░░░] 70%
└─ [4 more critics running...]

Chapter 3: Queued
Chapter 4: Queued
Chapter 5: Queued

Each chapter's critics run simultaneously with separate context windows for optimal speed and accuracy
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
Chapters failing the review gates: 8 → 0 ✓
Total Fixes Applied: 2,847

## Dimension Breakdown (tier before → after)
Prose:       Needs Work → Pass
Pacing:      Pass → Pass
Dialogue:    Fail → Pass
Character:   Needs Work → Pass
Continuity:  Pass → Strong Pass

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
✓ All chapters now pass the review-engine gates
✓ Zero em dashes in entire manuscript
✓ All author rules enforced
✓ Continuity verified across book

## Before/After Comparison
| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Chapters failing gates | 8 | 0 | -8 |
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
→ Decision: REVISE
→ Applying fixes...
→ Decision: PASS
✓ Chapter 26 ready

[EDIT] Chapter 12 modified
→ Re-reviewing changed sections
→ Em dash detected! (REMOVING)
→ Fixes applied
✓ Chapter 12 still passes the review gates
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
Chapter 8 still fails the review gates after 5 iterations:
→ Saving current version
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
Weekly: "Review and fix any chapters failing the review gates"
After edits: "Re-review modified chapters"
Before submission: "Final review and fix all"
```

---

## Success Criteria

Batch review succeeds when:
- ✓ All chapters analyzed
- ✓ All chapters pass the review-engine gates (or are flagged)
- ✓ Zero em dashes remain
- ✓ All fixes applied successfully
- ✓ Reports generated
- ✓ Backups created
- ✓ No data loss

---

*Batch review and fix: Upgrade your entire manuscript to professional standards in under an hour.*