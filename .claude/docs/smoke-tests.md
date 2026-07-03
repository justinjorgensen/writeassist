# Review Engine Smoke Tests

**Version:** 2.0
**System:** Four-Tier Rubric with Panel Gate
**Purpose:** Validate review engine behavior with known test cases

---

## Test Suite Overview

These smoke tests validate the four-tier rubric system, panel gate logic, and critical fail overrides.

---

## Test 1: Continuity Contradiction (Critical Fail)

### Setup
Create test chapter with direct continuity violation:

```markdown
# Chapter 3 - Test Case

"Marcus checked his phone. The screen lit up instantly."

Sarah remembered the EMP blast from yesterday. Every electronic device in the city had been fried. The power grid was down. Nothing worked.

"Text me when you get there," Marcus said, tapping his phone again.
```

### Expected Critic Results

**Continuity & Logic:**
```json
{
  "critic": "Continuity",
  "tier": "Fail",
  "confidence": 0.98,
  "one_line_reason": "EMP blast yesterday contradicts working phone",
  "fixes": [
    {
      "id": "fix-001",
      "summary": "Remove phone usage OR explain EMP shielding/recovery"
    }
  ]
}
```

**Other Critics:** Likely Pass (prose is fine, just logic error)

### Expected Final Decision

```
DECISION: REVISE
REASON: Critical: Continuity contradiction
OVERRIDE: Yes (Continuity = Fail triggers regardless of panel)
```

**Validation:**
- ✓ Continuity critic returns Fail
- ✓ Critical fail override activates
- ✓ Chapter forced to Revise even if 6 other critics Pass
- ✓ Auto-revise suggests fix

---

## Test 2: Clean Chapter (Should Pass)

### Setup
Create well-written test chapter with no issues:

```markdown
# Chapter 5 - Clean Test

Sarah walked into the coffee shop. Morning light filtered through dusty windows, catching steam rising from the espresso machine.

"The usual?" Marco asked.

She nodded, sliding onto her favorite stool. The worn leather creaked familiarly beneath her.

Outside, traffic hummed. Inside, the grinder whirred to life. Marco worked with practiced efficiency, tamping grounds with three sharp taps.

"Here you go." He set the cup before her.

The first sip burned her tongue, but she didn't mind. Some things were worth the wait.
```

### Expected Critic Results

All critics should return Pass or Strong Pass:

**Prose & Voice:** Pass (clean prose, no em dashes, good voice)
**Pacing & Flow:** Pass (good momentum, transitions work)
**Character & Arc:** Pass (consistent character, actions fit)
**Dialogue & Subtext:** Pass (natural dialogue, distinct voices)
**Continuity & Logic:** Pass (no contradictions)
**Engagement & Impact:** Pass (engaging scene, progresses story)
**Rules Compliance:** Pass (all rules followed)

### Expected Final Decision

```
DECISION: PASS
REASON: Panel approved (7/7)
PANEL GATE: 7 Pass or Better (need 5) → ✓
CRITICAL FAILS: None → ✓
```

**Validation:**
- ✓ All 7 critics return Pass or Strong Pass
- ✓ Panel gate passes (7/7 ≥ 5)
- ✓ No critical fail overrides
- ✓ Chapter marked complete

---

## Test 3: Em Dash Violation (Rules Fail)

### Setup
Create chapter with em dashes (zero tolerance):

```markdown
# Chapter 7 - Em Dash Test

Sarah waited—hoped—for a reply. The silence stretched longer than she could bear. Marcus had always been reliable—until now.

"Where are you?" she whispered to the empty room.

The clock ticked. Five minutes became ten—then twenty. Her coffee grew cold—forgotten.
```

### Expected Critic Results

**Rules Compliance:**
```json
{
  "critic": "Rules",
  "tier": "Fail",
  "confidence": 0.96,
  "one_line_reason": "7 em dashes found (zero tolerance policy)",
  "fixes": [
    {"id":"fix-001","summary":"Replace em dash with comma at 'waited—hoped'"},
    {"id":"fix-002","summary":"Replace em dash with colon at 'reliable—until'"},
    {"id":"fix-003","summary":"Replace em dash with comma at 'ten—then'"},
    {"id":"fix-004","summary":"Replace em dash with period at 'cold—forgotten'"}
  ]
}
```

### Expected Final Decision

```
DECISION: REVISE
REASON: Critical: Hard rule violation (em dashes)
OVERRIDE: Yes (Rules = Fail with confidence ≥ 0.90)
```

### Expected Auto-Revise Behavior

All em dashes forced to confidence = 1.0 and auto-applied:

```markdown
# After Auto-Revise

Sarah waited, hoped, for a reply. The silence stretched longer than she could bear. Marcus had always been reliable: until now.

"Where are you?" she whispered to the empty room.

The clock ticked. Five minutes became ten, then twenty. Her coffee grew cold. Forgotten.
```

**Validation:**
- ✓ Rules critic returns Fail
- ✓ Confidence ≥ 0.90 triggers critical fail override
- ✓ Auto-revise forces all em dash fixes to confidence 1.0
- ✓ All em dashes removed without markers
- ✓ Re-review shows Rules = Pass

---

## Test 4: Marginal Chapter (Panel Rejection)

### Setup
Create chapter with multiple issues but no critical fails:

```markdown
# Chapter 9 - Marginal Test

She felt the wind. It was cold. She saw Marcus. He was far away.

"Hi," she said.

"Hi," he said.

They stood there. Time passed. Nothing happened. The scene continued without purpose.
```

### Expected Critic Results

**Prose & Voice:** Needs Work (filter words, repetitive structure)
**Pacing & Flow:** Needs Work (no momentum, drag points)
**Character & Arc:** Pass (characters consistent, if flat)
**Dialogue & Subtext:** Needs Work (generic, no subtext)
**Continuity & Logic:** Pass (no contradictions)
**Engagement & Impact:** Fail (no emotional impact, no story progress)
**Rules Compliance:** Pass (no rule violations)

### Expected Final Decision

```
DECISION: REVISE
REASON: Panel rejected (3/7 Pass, need 5+)
PANEL GATE: 3 Pass or Better (need 5) → ✗
CRITICAL FAILS: None (Engagement Fail not critical)
```

**Validation:**
- ✓ Only 3 critics return Pass
- ✓ Panel gate rejects (3 < 5)
- ✓ No critical fail override (Engagement Fail doesn't override)
- ✓ Auto-revise applies fixes for Needs Work critics
- ✓ Loop continues until panel passes

---

## Test 5: Smart-Review with Pruning

### Setup
Create dialogue-heavy chapter, trigger smart-review:

```markdown
# Chapter 11 - Dialogue Test

"Listen," Marcus said.

"I'm listening," Sarah replied.

"This isn't working."

"What isn't?"

"Us. This. Everything."

Sarah's hands trembled. "You don't mean that."

"I do." His voice cracked. "I'm sorry."

"Sorry doesn't fix this."

"I know."
```

### Expected Content Analysis

- **Type:** Dialogue-heavy
- **Suggested Critics:** Dialogue, Character, Continuity (always), Rules (always), Prose
- **Pruned:** Pacing (single scene), Engagement (short chapter)

### Expected Critic Results

5 critics run:
- **Prose:** Pass
- **Character:** Pass
- **Dialogue:** Strong Pass
- **Continuity:** Pass
- **Rules:** Pass

### Expected Final Decision

```
DECISION: PASS
REASON: Panel approved (5/5)
ADJUSTED GATE: 5 critics run, need 4 Pass (80%) → Have 5 (100%) ✓
CRITICAL FAILS: None → ✓
```

**Validation:**
- ✓ Continuity and Rules always run (never pruned)
- ✓ Content analysis prunes only non-critical critics
- ✓ Adjusted panel gate (5 critics = need 4 Pass)
- ✓ Token usage reduced ~50%
- ✓ Critical fail detection preserved

---

## Test 6: Character Voice Integrity (Critical Fail)

### Setup
Create chapter where established character completely breaks voice:

```markdown
# Chapter 13 - Voice Test

Marcus had always been a man of few words. Gruff. Direct. No nonsense.

"Well, gosh darn it, Sally-mae!" Marcus exclaimed cheerfully, twirling around the kitchen. "Isn't this just the most marvelous morning? The birds are singing their little hearts out, and I simply must share my feelings with you, my dearest companion! Oh, how my heart overflows with joy and merriment!"
```

### Expected Critic Results

**Character & Arc:**
```json
{
  "critic": "Character",
  "tier": "Fail",
  "confidence": 0.95,
  "one_line_reason": "Marcus's voice completely unrecognizable, breaks established traits",
  "fixes": [
    {
      "id": "fix-001",
      "summary": "Rewrite dialogue to match Marcus's established gruff, direct voice"
    }
  ]
}
```

### Expected Final Decision

```
DECISION: REVISE
REASON: Critical: Voice integrity (Character Fail, confidence ≥ 0.90, voice issue)
OVERRIDE: Yes
```

**Validation:**
- ✓ Character critic returns Fail
- ✓ Confidence ≥ 0.90
- ✓ "voice" detected in one_line_reason
- ✓ Critical fail override activates
- ✓ Chapter forced to Revise even if panel would pass

---

## Test 7: Iteration Loop (Max Iterations)

### Setup
Create chapter that can't be auto-fixed easily:

```markdown
# Chapter 15 - Complex Issue Test

[Chapter with deep structural problems that require manual rewriting, not simple fixes]
```

### Expected Behavior

**Iteration 1:**
- Review → REVISE (multiple Needs Work, one Fail)
- Auto-revise applies high-confidence fixes
- Re-review → Still REVISE (core issues remain)

**Iteration 2:**
- Auto-revise applies medium-confidence fixes
- Re-review → Still REVISE

**Iteration 3:**
- Auto-revise applies low-confidence fixes
- Re-review → Still REVISE
- **User prompt:** "Continue revising? (3/5 iterations)"

**Iteration 4-5:**
- If user continues, attempt remaining fixes
- If still failing after iteration 5 → Escalate

### Expected Final Decision

```
DECISION: MANUAL_REVIEW_NEEDED
REASON: Max iterations reached (5/5), chapter still fails panel
ESCALATION: Yes
```

**Validation:**
- ✓ Maximum 5 iterations enforced
- ✓ User prompted after iteration 3
- ✓ Escalation to manual review after max iterations
- ✓ All iteration attempts logged
- ✓ Backups preserved for each iteration

---

## Test 8: Dashboard Numeric Mapping

### Setup
Run review on any chapter, verify numeric display:

### Expected Output

```markdown
## Critic Results (Four-Tier Rubric):
- Prose: Pass
- Pacing: Strong Pass
- Character: Needs Work
- Dialogue: Pass
- Continuity: Pass
- Engagement: Fail
- Rules: Pass

## Dashboard Display (Numeric Mapping):
- Prose: 8.0 (Pass)
- Pacing: 10.0 (Strong Pass)
- Character: 6.0 (Needs Work)
- Dialogue: 8.0 (Pass)
- Continuity: 8.0 (Pass)
- Engagement: 4.0 (Fail)
- Rules: 8.0 (Pass)

Weighted Average: 7.6/10 (for tracking only, NOT used for gating)

## Panel Gate Decision:
Pass Count: 5/7 (need 5) → ✓ PASS
Critical Fails: None → ✓
FINAL: PASS
```

**Validation:**
- ✓ Tiers displayed first (primary)
- ✓ Numbers shown as "dashboard display"
- ✓ Explicit note that numbers don't control gating
- ✓ Panel gate uses tier counts, not numeric average
- ✓ Weighted average shown for tracking only

---

## Running the Tests

### Manual Execution

```bash
# Test 1: Continuity violation
/review-chapter test-continuity-fail.md
# Expected: REVISE (Critical: Continuity contradiction)

# Test 2: Clean chapter
/review-chapter test-clean-chapter.md
# Expected: PASS (Panel approved 7/7)

# Test 3: Em dash violation
/review-chapter test-em-dash-fail.md
# Expected: REVISE (Critical: Hard rule violation)
/auto-revise-chapter test-em-dash-fail.md
# Expected: All em dashes removed, confidence = 1.0

# Test 4: Marginal chapter
/review-chapter test-marginal.md
# Expected: REVISE (Panel rejected 3/7)

# Test 5: Smart-review with pruning
/smart-review test-dialogue-heavy.md
# Expected: PASS (5/5 critics, Continuity+Rules preserved)

# Test 6: Voice integrity
/review-chapter test-voice-fail.md
# Expected: REVISE (Critical: Voice integrity)

# Test 7: Iteration loop
/review-chapter test-complex-issue.md
# Then trigger auto-revise pipeline
# Expected: Escalation after 5 iterations

# Test 8: Numeric mapping
/review-chapter any-chapter.md --verbose
# Expected: Tiers shown, then numbers, explicit "display only" note
```

### Success Criteria

All tests pass when:
- ✓ Panel gate correctly counts Pass/Strong Pass tiers
- ✓ Critical fail overrides work for Continuity, Rules (high confidence), Character Voice (high confidence)
- ✓ Numeric scores displayed but don't control gating
- ✓ Smart-review always includes Continuity and Rules
- ✓ Auto-revise uses confidence ladder (0.95+, 0.90-0.95, 0.85-0.90)
- ✓ Em dash fixes forced to confidence 1.0
- ✓ Iteration loop enforces max 5, prompts at 3
- ✓ Adjusted panel gate works for smart-review (5 critics = need 4)

---

## Regression Testing

After any changes to review-engine, re-run all 8 smoke tests to ensure:
1. Panel gate logic unchanged
2. Critical fail overrides still work
3. Confidence ladder preserved
4. Numeric mapping doesn't leak into gating
5. Smart-review preserves critical critics
6. Iteration limits enforced

---

*These smoke tests validate the four-tier rubric system. Run after any review engine changes.*