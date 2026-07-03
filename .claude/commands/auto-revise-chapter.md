---
description: Apply review fixes to a chapter via the confidence ladder, one git worktree per pass
argument-hint: "[chapter-file]"
---
# Auto-Revise Chapter (Intelligent Revision System)

**No-argument behavior:** If no argument is given: use the most recent REVISE decision in `.claude/state/reviews/`; if none, list chapters in `02-Manuscript/` and stop.

**Fix Queue:** $ARGUMENTS

---

## Purpose
Automatically apply high-confidence fixes identified during review-chapter analysis using the four-tier rubric system. When called by execute-wrp pipeline, runs without user interaction and triggers re-review automatically.

---

## Worktree-Isolated Iteration

Each revision pass runs inside its **own git worktree** so the author can diff between iterations instead of trusting a single overwritten file. There is no special harness flag for this: it is plain `git worktree add`, a `cd` into that worktree, edit, and `commit`. The isolation is real git isolation, auditable with `git log` and `git diff`.

### Setup (run once per chapter)
```bash
# From the project root, create a worktree on a fresh branch for pass 1
git worktree add -b revise/chapter-XX-pass-1 .worktrees/chapter-XX-pass-1 HEAD
```

### Iteration loop
For pass `N`:
1. `cd .worktrees/chapter-XX-pass-N` so all edits land in that worktree's checkout.
2. Apply the confidence-ladder fixes against that worktree's copy of the chapter.
3. Commit the pass: `git commit -am "auto-revise pass N"` (run from inside the worktree).
4. Run `/review-chapter` against the chapter file in this worktree.
5. If both gates pass, return to the project root and fast-forward merge the branch into the working branch, then remove the worktree.
6. If it fails and N < MAX_ITERATIONS, create `revise/chapter-XX-pass-(N+1)` from the previous pass's branch and loop:
   ```bash
   # from the project root
   git worktree add -b revise/chapter-XX-pass-$((N+1)) \
     .worktrees/chapter-XX-pass-$((N+1)) revise/chapter-XX-pass-N
   ```

### Why this matters
- Author can `git diff revise/chapter-XX-pass-1 revise/chapter-XX-pass-3` to see exactly what each pass changed.
- A failed pass never corrupts the working copy.
- Multiple revision strategies can be tried in parallel (`pass-3-aggressive`, `pass-3-conservative`) and compared.

### Cleanup
```bash
git worktree remove .worktrees/chapter-XX-pass-N
git branch -d revise/chapter-XX-pass-N
```

The `MAX_ITERATIONS = 5` cap in section 10 below now applies to worktree generations, not in-place rewrites.

---

## Intelligent Fix Process

### 1. **Load Fix Queue from Critic Results**

```markdown
## Auto-Revise Session Started
Source: review-chapter critic panel
Target Chapter: [Chapter-XX]
Decision: REVISE
Reason: [Panel rejected (4/7) / Critical: Continuity contradiction / etc.]
Fixes Queued: [Total count]
Backup Created: Chapter-XX-backup-[timestamp].md
```

---

### 2. **Confidence Ladder (Fix Application Strategy)**

The confidence ladder determines how fixes are applied:

#### 0.95-1.00: Auto-Apply Immediately
**NO markers, NO confirmation** - Apply and log
- Grammar corrections
- Punctuation fixes
- Spelling corrections
- Formatting consistency
- **EM DASH REMOVAL (ALWAYS 1.0 confidence)**

**EM DASH REMOVAL - Replace ALL em dashes with:**
- Commas for brief pauses
- Colons for explanations
- Parentheses for asides
- Period and new sentence for strong breaks

**Filter word removal:**
- "felt", "saw", "heard", "seemed", "appeared"
- Direct sensory → Active description

**Passive to Active voice (when clear):**
- Subject-verb-object reordering
- Verb strengthening

#### 0.90-0.95: Apply with Inline Marker
**Stage fix but add marker for review**
- Transition additions
- Dialogue tag variations
- Sentence rhythm adjustments
- Pronoun clarifications

**Marker format:**
```markdown
[AR-001: Passive voice converted, verify emphasis preserved]
The door was opened by Marcus → Marcus opened the door [AR-001]
```

#### 0.85-0.90: Suggest Only (No Application)
**Add comment but don't change text**
- Stylistic preferences
- Voice adjustments
- Content additions (sensory details)
- Subtext enhancements

**Comment format:**
```markdown
<!-- AR-SUGGEST-001: Consider adding sensory detail here: "dust motes swirled in afternoon light" -->
```

#### < 0.85: Skip
**Too low confidence to suggest**
- Log for potential manual review
- Do not surface to user

---

### 3. **Special Rule: Em Dash Override**

```python
if "em dash" in fix.summary.lower() or "," in fix.location:
    fix.confidence = 1.0  # Force maximum confidence
    apply_immediately()
    log_change("CRITICAL: Em dash removal (zero tolerance)")
```

Em dashes have **ABSOLUTE ZERO TOLERANCE** and are fixed on every pass, regardless of original confidence.

---

### 4. **Fix Application Logic**

```python
FOR each fix in critic_results.all_fixes():
    # Em dash override
    if is_em_dash_fix(fix):
        fix.confidence = 1.0
        apply_immediately()
        continue

    # Confidence ladder
    IF fix.confidence >= 0.95:
        apply_immediately()
        log_change(fix)
    ELIF fix.confidence >= 0.90:
        apply_with_marker(fix)
        add_inline_marker(f"[AR-{fix.id}]")
    ELIF fix.confidence >= 0.85:
        add_suggestion_comment(fix)
    ELSE:
        skip_and_log(fix, "confidence too low")

    update_progress()
```

---

### 5. **Fix Execution Patterns**

#### Pattern: EM DASH ELIMINATION (HIGHEST PRIORITY - Always 1.0 confidence)
```markdown
BEFORE: "She waited for the news,the terrible news"
AFTER:  "She waited for the news, the terrible news"
ACTION: Replace em dash with comma
CONFIDENCE: 1.00 (FORCED)

BEFORE: "The answer was simple,too simple"
AFTER:  "The answer was simple: too simple"
ACTION: Replace em dash with colon
CONFIDENCE: 1.00 (FORCED)

BEFORE: "He ran,sprinted,toward the door"
AFTER:  "He ran (sprinted) toward the door"
ACTION: Replace em dashes with parentheses
CONFIDENCE: 1.00 (FORCED)
```

#### Pattern: Filter Word Removal (Confidence: 0.95+)
```markdown
BEFORE: "She felt the cold wind on her face"
AFTER:  "Cold wind stung her face"
ACTION: Remove filter, strengthen verb
CONFIDENCE: 0.97
APPLICATION: Auto-apply immediately
```

#### Pattern: Passive Voice Correction (Confidence: 0.95+)
```markdown
BEFORE: "The door was opened by Marcus"
AFTER:  "Marcus opened the door"
ACTION: Subject-verb-object reorder
CONFIDENCE: 0.98
APPLICATION: Auto-apply immediately
```

#### Pattern: Dialogue Tag Variety (Confidence: 0.90-0.95)
```markdown
BEFORE: "Stop!" he shouted. "Never!" she shouted.
AFTER:  "Stop!" he shouted. "Never!" Her voice cracked. [AR-023]
ACTION: Vary tags, add action beat
CONFIDENCE: 0.92
APPLICATION: Apply with marker
```

#### Pattern: Sensory Enhancement (Confidence: 0.85-0.90)
```markdown
BEFORE: "The room was dark"
SUGGESTED: "Darkness pressed against her, thick with dust and decay"
ACTION: Add sensory layers
CONFIDENCE: 0.88
APPLICATION: Comment only
FORMAT: <!-- AR-SUGGEST-045: Consider enriching with sensory detail -->
```

#### Pattern: Transition Smoothing (Confidence: 0.90-0.95)
```markdown
BEFORE: "Then they left. The next day arrived."
AFTER:  "They departed as shadows lengthened. Dawn brought new challenges." [AR-067]
ACTION: Smooth scene transition
CONFIDENCE: 0.91
APPLICATION: Apply with marker
```

---

### 6. **Smart Fix Validation**

Before applying each fix (regardless of confidence):

```markdown
VALIDATE:
□ Maintains character voice
□ Preserves author style
□ Respects genre conventions
□ Follows author-rules.md
□ Doesn't break continuity
□ Enhances rather than changes meaning

IF validation fails:
  - Downgrade confidence by 0.10
  - Re-evaluate using confidence ladder
  - May shift from auto-apply to marker or suggestion
```

---

### 7. **Progress Tracking**

Report what was actually applied, by confidence band. Do not fabricate counts or timings.

```markdown
## Auto-Revise Progress
Fix Breakdown:
- Auto-applied (0.95+): N fixes
- With markers (0.90-0.95): N fixes
- Suggestions (0.85-0.90): N fixes
- Skipped (<0.85): N fixes

Em Dash Removals (zero tolerance): N, all fixed
```

---

### 8. **Marker System**

For staged fixes (confidence 0.90-0.95), insert inline markers:

```markdown
[AR-001: Passive voice corrected - verify maintains emphasis]
[AR-002: Transition added - check flow]
[AR-003: Dialogue tag varied - confirm character voice]
```

For suggestions (confidence 0.85-0.90), add HTML comments:

```markdown
<!-- AR-SUGGEST-045: Consider adding sensory detail: "dust motes swirled in afternoon light" -->
```

---

### 9. **Revision Report Generation**

```markdown
# Auto-Revise Report
**Chapter:** [Number - Title]
**Session:** [Timestamp]
**Duration:** [X minutes]
**Original Decision:** REVISE ([reason])
**Target:** Pass panel gate (5/7) OR resolve critical fail

## Fix Summary
- Total Fixes Queued: [X]
- Auto-Applied (0.95+): [X] → No markers
- With Markers (0.90-0.95): [X] → Review [AR-XXX] tags
- Suggestions (0.85-0.90): [X] → See comments
- Skipped (<0.85): [X] → Logged for manual review

## Critical Fixes
✓ **Em Dashes Removed:** 7 (ZERO TOLERANCE enforced)
✓ **Rules Violations:** 3 fixed (POV consistency, tense)
✓ **Continuity Errors:** 1 fixed (timeline reference corrected)

## Applied Changes by Category

### High-Confidence (0.95+ - Auto-Applied)
✓ Grammar corrections: 12
✓ Filter word removal: 18
✓ Passive voice activation: 9
✓ Punctuation fixes: 15
✓ Spelling corrections: 3

### Medium-Confidence (0.90-0.95 - With Markers)
✓ [AR-001 to AR-045] - 45 fixes applied
- Dialogue tag variations: 8
- Transition smoothing: 7
- Pronoun clarifications: 12
- Sentence rhythm adjustments: 18

### Suggestions (0.85-0.90 - Comments Only)
<!-- See 22 AR-SUGGEST-XXX comments throughout chapter -->
- Sensory detail opportunities: 9
- Action beat additions: 6
- Subtext enhancements: 7

## Panel Re-Evaluation Prediction
Based on fixes applied, expected tier improvements:
- Prose: Needs Work → Pass
- Rules: Fail → Pass [em dashes removed]
- Dialogue: Needs Work → Pass
- Character: Pass → Pass [maintained]

**Predicted Panel Result:** 6/7 Pass or Better → ✓ SHOULD PASS

## Next Steps
1. Re-run `/review-chapter` to verify fixes
2. Review [AR-XXX] markers if needed
3. Consider AR-SUGGEST comments for polish
4. If still fails: manual review required

## Backup & Rollback
Original saved: `Chapter-XX-backup-[timestamp].md`
Rollback: `/restore-chapter Chapter-XX-backup-[timestamp]`
```

---

### 10. **Iteration & Loop Control**

When chapter fails panel or hits critical fail:

```python
MAX_ITERATIONS = 5
ESCALATION_THRESHOLD = 3

for iteration in range(1, MAX_ITERATIONS + 1):
    # Apply fixes
    apply_revisions(critic_results)

    # Re-review
    new_results = run_review_panel(chapter)
    decision = evaluate_chapter(new_results)

    if decision == "PASS":
        return "SUCCESS", new_results

    if iteration >= ESCALATION_THRESHOLD:
        # After 3 attempts, ask user if they want to continue
        if not user_confirms_continue():
            return "MANUAL_REVIEW_NEEDED", new_results

    # Log iteration
    log_iteration(iteration, decision, fixes_applied)

return "MAX_ITERATIONS_REACHED", new_results
```

**Loop Prevention:**
- Maximum 5 iterations
- After 3 iterations, prompt user for continuation
- If still failing after 5, escalate to manual review

---

## Integration with Other Commands

### Post-Revision Workflow:
1. **auto-revise-chapter** applies fixes
2. **review-chapter** re-evaluates with same critics
3. Evaluate with panel gate logic
4. IF decision == "PASS":
   - Mark chapter complete
   - Generate final report
5. ELSE IF iteration < MAX_ITERATIONS:
   - Loop back to step 1
6. ELSE:
   - Escalate to manual review

### Automated Pipeline Mode (execute-wrp):
When triggered by execute-wrp:
- No user prompts for confirmation
- Automatic re-review after each revision
- Continues until panel passes OR max iterations
- Saves backup before each iteration
- Provides consolidated report at end
- Total process time: ~2-5 minutes for most chapters

---

## Success Metrics

Auto-revise succeeds when:
- ✓ Chapter passes panel gate (5/7) OR critical fails resolved
- ✓ No meaning changed by fixes
- ✓ Voice preserved throughout
- ✓ Style maintained
- ✓ All fixes logged with confidence
- ✓ Backup created before changes
- ✓ Markers placed for review (0.90-0.95 fixes)

---

## Confidence Calibration

Critics should calculate confidence based on:

```markdown
Base Confidence = Rule Clarity + Pattern Frequency + Context Match

Modifiers:
+10% if fix type explicitly in author-rules.md
+5% if similar fix previously accepted
-20% if in character dialogue (voice sensitive)
-15% if in emotional scene (authenticity risk)
-10% if unique style element present
-30% if plot-critical passage

Final Confidence = clamp(Base + Modifiers, 0.0, 1.0)
```

**Em Dash Exception:** Always force confidence = 1.0, regardless of context.

---

## Common Fix Patterns

### High-Confidence Patterns (0.95+ - Auto-Apply)
1. Em dash removal (FORCED to 1.0)
2. Filter word removal: "felt/saw/heard" → direct sensory
3. Passive voice: "was opened by" → "opened"
4. Grammar: comma splices, fragments
5. Spelling corrections
6. POV filter removal
7. Weak verb strengthening

### Medium-Confidence Patterns (0.90-0.95 - With Markers)
8. Dialogue tag variety
9. Transition smoothing
10. Pronoun clarification
11. Sentence rhythm adjustments
12. Paragraph length variation

### Low-Confidence Patterns (0.85-0.90 - Suggestions Only)
13. Sensory detail additions
14. Action beat insertions
15. Subtext enhancement
16. Telling → Showing conversions

---

*Auto-revise applies intelligent, confidence-based improvements using the four-tier rubric system. See `.claude/docs/review-engine.md` for complete specifications.*

---

## Final Step: Strip All Markers (MANDATORY before a chapter is declared done)

Before a chapter is marked complete (and before any sync or export), remove ALL revision scaffolding from the chapter file:

1. Resolve or reject every `[AR-NNN: ...]` inline marker (accept the change and delete the marker, or revert the change).
2. Delete every `<!-- AR-SUGGEST-NNN: ... -->` comment (apply the suggestion first if the author wants it).
3. Verify: `grep -nE "\[AR-|AR-SUGGEST-" <chapter-file>` returns nothing.

`sync-to-drive` refuses to upload files containing these markers; this step is what makes a chapter shippable.
