# Review Engine Smoke Tests

**System:** Four-tier rubric with dual gate (panel gate plus weighted gate)
**Purpose:** Validate review engine behavior with known test cases

---

## Test Suite Overview

These smoke tests validate the four-tier rubric, the dual-gate logic (panel gate AND weighted gate), critical-fail overrides, and the advisory-pruning rule. They also confirm the seven gating critics launch as named, parallel Task calls.

A chapter passes only when both gates pass and no critical fail fires:
- **Panel gate:** at least 5 of 7 gating critics return Pass or Strong Pass.
- **Weighted gate:** weighted score is at least 7.0.

---

## Test 1: Continuity Contradiction (Critical Fail)

### Setup
```markdown
# Chapter 3 - Test Case

"Marcus checked his phone. The screen lit up instantly."

Sarah remembered the EMP blast from yesterday. Every electronic device in the city had been fried. The power grid was down. Nothing worked.

"Text me when you get there," Marcus said, tapping his phone again.
```

### Expected
Continuity returns Fail (high confidence). Critical-fail override forces REVISE regardless of the gates.

```
DECISION: REVISE
REASON: Critical fail: Continuity contradiction
```

**Validation:**
- continuity-checker returns Fail
- Critical-fail override activates and bypasses both gates
- Chapter goes to Revise even if the other six critics Pass
- Auto-revise suggests a fix

---

## Test 2: Clean Chapter (Should Pass)

### Setup
```markdown
# Chapter 5 - Clean Test

Sarah walked into the coffee shop. Morning light filtered through dusty windows, catching steam rising from the espresso machine.

"The usual?" Marco asked.

She nodded, sliding onto her favorite stool. The worn leather creaked familiarly beneath her.

Outside, traffic hummed. Inside, the grinder whirred to life.

"Here you go." He set the cup before her.

The first sip burned her tongue, but she did not mind. Some things were worth the wait.
```

### Expected
All seven gating critics return Pass or Strong Pass.

```
DECISION: PASS
PANEL GATE: 7/7 Pass or better (need 5) -> passes
WEIGHTED GATE: >= 7.0 -> passes
CRITICAL FAILS: none
```

**Validation:**
- All seven gating critics return Pass or Strong Pass
- Panel gate passes (7/7 >= 5)
- Weighted gate passes
- No critical-fail override

---

## Test 3: Em Dash Violation (Rules Fail)

### Setup
A chapter containing em dashes (zero tolerance). The PostToolUse em-dash hook should already block writing them to a manuscript file; this test exercises the critic path on existing text.

### Expected
rule-enforcer returns Fail (confidence >= 0.90, hard violation). Critical-fail override forces REVISE.

```
DECISION: REVISE
REASON: Critical fail: Hard rule violation (em dashes)
```

### Expected Auto-Revise
All em-dash fixes are forced to confidence 1.0 and auto-applied. Re-review shows Rules = Pass.

**Validation:**
- rule-enforcer returns Fail at confidence >= 0.90
- Critical-fail override activates
- Auto-revise forces every em-dash fix to confidence 1.0
- Em dashes removed without markers
- Re-review returns Rules = Pass

---

## Test 4: Marginal Chapter (Gate Rejection)

### Setup
```markdown
# Chapter 9 - Marginal Test

She felt the wind. It was cold. She saw Marcus. He was far away.

"Hi," she said.

"Hi," he said.

They stood there. Time passed. Nothing happened.
```

### Expected
Multiple Needs Work tiers and one non-critical Fail. The panel gate falls below 5, so the chapter goes to Revise even though no critical fail fires.

```
DECISION: REVISE
PANEL GATE: 3/7 Pass or better (need 5) -> fails
CRITICAL FAILS: none (Engagement Fail is not a critical critic)
```

**Validation:**
- Only three critics return Pass
- Panel gate rejects (3 < 5)
- No critical-fail override (Engagement Fail does not override)
- Auto-revise applies fixes for the Needs Work critics
- Loop continues until both gates pass

---

## Test 5: Advisory Pruning

### Setup
Run `/review-chapter Chapter-11 --fast`, and separately run `/review-chapter Chapter-11` against an `author-rules.md` that has no `Sensitivities:` entry.

### Expected
The seven gating critics always run. Advisory critics are pruned as documented:
- With `--fast`: all advisory critics (sensitivity-reviewer, thematic-guide, grammar-clarity) are skipped.
- Without a sensitivity constraint in `author-rules.md`: sensitivity-reviewer is skipped.

```
GATING CRITICS RUN: 7/7 (always)
ADVISORY (--fast): skipped
ADVISORY (no sensitivity constraint): sensitivity-reviewer skipped
```

**Validation:**
- The seven gating critics always run; the gate denominator stays 7
- `--fast` skips all advisory critics
- Missing sensitivity constraint skips sensitivity-reviewer
- Gating decision is unaffected by advisory pruning

---

## Test 6: Character Voice Integrity (Critical Fail)

### Setup
A chapter where an established gruff, terse character suddenly speaks in long, cheerful, effusive sentences completely unlike their established voice.

### Expected
voice-consistency returns Fail at confidence >= 0.90 (voice integrity). Critical-fail override forces REVISE.

```
DECISION: REVISE
REASON: Critical fail: Voice integrity
```

**Validation:**
- voice-consistency returns Fail at confidence >= 0.90
- Critical-fail override activates
- Chapter goes to Revise even if the gates would otherwise pass

---

## Test 7: Named Parallel Critics

### Setup
Run `/review-chapter` on any chapter and observe the Task launches.

### Expected
Seven Task calls fire in a single response, each with `subagent_type` set to a gating critic name: continuity-checker, rule-enforcer, voice-consistency, pacing-master, dialogue-coach, character-critic, engagement-critic. None use `general-purpose`.

**Validation:**
- Exactly seven gating Task calls in one response
- Each names its agent (no general-purpose, no inline rubric)
- Each agent is read-only (Read, Grep, Glob) and cannot edit the manuscript

---

## Test 8: Dashboard Numeric Mapping

### Setup
Run a review and inspect the numeric display.

### Expected
Tiers are the primary signal. Numbers (Fail 4.0, Needs Work 6.0, Pass 8.0, Strong Pass 10.0) feed the weighted gate and the dashboard. The weighted score is shown as part of the gating decision, not as a separate threshold that replaces it.

```markdown
## Gating Tiers
- Continuity: Pass, Pacing: Strong Pass, Characters: Needs Work,
  Dialogue: Pass, Rules: Pass, Voice: Pass, Engagement: Pass

## Gates
- Panel: 6/7 Pass or better (need 5) -> passes
- Weighted: >= 7.0 -> passes
- FINAL: PASS
```

**Validation:**
- Tiers shown first
- Numbers labeled as dashboard mapping
- Panel gate uses tier counts; weighted gate uses tier numbers times weights
- Both gates reported in the final decision

---

## Hook Smoke Tests

Run on a clean clone:
- **em-dash-guard (PostToolUse):** attempt to write an em dash to a file under `02-Manuscript/`; the write is blocked (exit 2).
- **post-chapter-review (PostToolUse):** with `WRITEASSIST_AUTO_REVIEW=1`, saving a chapter drops a breadcrumb and does not error.
- **update-tracker (Stop):** session end appends a word-count line to `04-Project-Management/writing-tracker.md` without erroring.
- **statusline.sh:** prints a one-line status with `em-dash:0` and `review:PASS|REVISE|...`, never a numeric score threshold.

---

## Running the Tests

```bash
/review-chapter test-continuity-fail.md      # REVISE (Critical fail: Continuity)
/review-chapter test-clean-chapter.md        # PASS (both gates)
/review-chapter test-em-dash-fail.md         # REVISE (Critical fail: Rules)
/auto-revise-chapter test-em-dash-fail.md    # all em dashes removed, confidence 1.0
/review-chapter test-marginal.md             # REVISE (panel gate 3/7)
/review-chapter test-dialogue-heavy.md --fast  # gating only, advisory pruned
/review-chapter test-voice-fail.md           # REVISE (Critical fail: Voice)
/review-chapter any-chapter.md               # observe seven named parallel Tasks
```

### Success Criteria
- Panel gate counts Pass and Strong Pass tiers correctly
- Weighted gate computes tier value times weight correctly
- Critical-fail overrides work for Continuity, Rules (high confidence), and Voice (high confidence)
- Numbers are display only; both gates control gating
- The seven gating critics always run; advisory critics prune on `--fast` and the sensitivity rule
- Auto-revise uses the confidence ladder and forces em-dash fixes to 1.0

---

## Regression Testing

After any change to the review engine, re-run these tests to confirm:
1. Dual-gate logic unchanged
2. Critical-fail overrides still fire
3. Confidence ladder preserved
4. Numbers never leak into gating beyond the weighted-gate calculation
5. Advisory pruning preserves the seven gating critics

---

*These smoke tests validate the four-tier rubric engine. Run after any review engine changes.*
