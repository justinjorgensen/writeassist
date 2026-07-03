# Validate Chapter Transitions

**Target:** Check continuity between consecutive chapters

---

## Purpose

Ensure that chapter endings properly connect to the next chapter's beginning. Catches continuity errors like ignored events, impossible state changes, or broken narrative flow.

## How It Works

This command reads the endings and beginnings of consecutive chapters to verify:
- Major events are acknowledged
- Character states remain consistent
- Timeline flows logically
- Environmental conditions carry forward
- Action sequences continue properly

## Usage Examples

```bash
# Check specific transition
/validate-transitions Chapter-02 Chapter-03

# Check all transitions in manuscript
/validate-transitions 02-Manuscript/

# Check after batch writing
/validate-transitions --after-batch
```

## What It Catches

### Critical Issues
- **Ignored Events**: EMP happens but electronics still work
- **State Violations**: Character dead in Ch 5, alive in Ch 6
- **Timeline Breaks**: Day to night with no transition
- **Location Jumps**: In Paris end of Ch 3, Tokyo start of Ch 4 with no travel

### Example: the EMP continuity break (generic illustration)

```markdown
## Transition Validation: Chapter 2 → Chapter 3

❌ CRITICAL ERROR FOUND

Chapter 2 Ending:
- EMP detonation
- All electronics failing
- Plane diving without power

Chapter 3 Opening:
- Plane flying normally
- Missile lock alarms working (require electronics)
- No mention of EMP or recovery

Required Fix:
Chapter 3 must open with either:
1. Immediate EMP aftermath (emergency procedures, mechanical backup systems)
2. Time jump AFTER recovery (with explanation)
3. Different POV that later addresses the EMP
```

## Implementation Steps

1. **Identify Chapter Pairs**
   - Find all consecutive chapters
   - Include cross-book transitions for series

2. **Extract Transition Zones**
   - Last 200-300 words of each chapter
   - First 200-300 words of next chapter

3. **Run Transition Validator**
   - Deploy transition-validator agent on each pair
   - Check for continuity breaks
   - Flag issues by severity

4. **Generate Report**
   ```markdown
   ## Transition Validation Report
   
   Chapters Checked: 25
   Transitions Valid: 22
   Issues Found: 3
   
   ### Critical Issues (Must Fix)
   - Ch 2→3: EMP event ignored
   - Ch 8→9: Character death not acknowledged
   
   ### Minor Issues (Should Fix)
   - Ch 15→16: Time of day unclear
   ```

## Integration with Existing Commands

### With execute-wrp
After writing each chapter, automatically check transition with previous chapter

### With batch-review-and-revise
Include transition validation in the review process

### With review-chapter
Add note if chapter creates transition issues with neighbors

## Preventive Measures

To prevent transition errors:

1. **Transition Notes**: Keep a buffer of last chapter's ending state
2. **Event Tracking**: Log major events that MUST be addressed
3. **State Snapshot**: Track character/environment state between chapters
4. **Review Prompt**: Always ask "Does this connect to the previous chapter's ending?"

## Output Format

```markdown
## Transition Validation Results

✅ Valid Transitions (20):
- Ch 1→2: Smooth continuation
- Ch 3→4: Clear time jump acknowledged
[...]

❌ Broken Transitions (3):
1. **Ch 2→3**: [CRITICAL] EMP event ignored
   - Fix: Add EMP aftermath to Ch 3 opening
   
2. **Ch 8→9**: [MAJOR] Character location inconsistent
   - Fix: Add travel scene or time marker

3. **Ch 15→16**: [MINOR] Emotional state shifts without explanation
   - Fix: Add internal transition thought

## Recommendations
1. Run transition validation after every batch write
2. Include in final manuscript review
3. Create transition checklist for manual review
```

## Success Metrics

Validation succeeds when:
- ✓ All major events acknowledged
- ✓ No impossible state changes
- ✓ Timeline flows logically
- ✓ Character continuity maintained
- ✓ Environmental consistency preserved

---

This command prevents exactly the kind of continuity break shown in the EMP example above.