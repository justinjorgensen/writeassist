# Review Engine Smoke Tests

**Version:** 3.0 (remediated 2026-07-03)
**System:** Four-Tier Rubric, dual gates per `.claude/docs/review-engine.md`
**Fixtures:** `03-Resources/smoke-fixtures/` (all eight exist; see each file's header for its planted defect)

---

## Assertion policy

Critic output comes from nondeterministic LLM judgments, so tests assert only DECIDABLE properties:

- ASSERT: the critic's final output validates against the shared JSON schema (fields: critic, tier, confidence, one_line_reason, fixes; tier is one of the four values)
- ASSERT: the planted defect's dimension lands at **Needs Work or Fail**
- ASSERT: gate decisions (PASS/REVISE) follow `(panel AND weighted) AND no_critical_fails`
- NEVER assert: exact confidence values, exact fix counts, token usage, or timing

---

## Test 1: Continuity Contradiction (Critical Fail)

Fixture: `test-continuity-fail.md` (working phone one day after a city-wide EMP)

Run: `/review-chapter 03-Resources/smoke-fixtures/test-continuity-fail.md`

Assert:
- Continuity critic output validates against the schema
- Continuity tier is Fail (Needs Work is a test failure here; the contradiction is direct)
- Decision is REVISE via the critical-fail override, regardless of the other six verdicts
- At least one fix targets the phone/EMP contradiction

## Test 2: Clean Chapter (Should Pass)

Fixture: `test-clean-chapter.md` (no planted defects)

Run: `/review-chapter 03-Resources/smoke-fixtures/test-clean-chapter.md`

Assert:
- All critic outputs validate against the schema
- The panel gate passes (at least 5 of 7 Pass or Strong Pass)
- No critical fails; decision is PASS
- A report file appears at `.claude/state/reviews/` containing a `**Weighted Score:** X.X/10` line

## Test 3: Em Dash Violation (guard + Rules critic)

Fixture: `test-em-dash-template.md` (contains `<EM-DASH>` tokens; the repo stays glyph-free)

Generate the live fixture OUTSIDE the repo, then test the guard directly:

```bash
# 1. Materialize a live fixture in /tmp with real em dashes
sed 's/<EM-DASH>/\xe2\x80\x94/g' 03-Resources/smoke-fixtures/test-em-dash-template.md > /tmp/em-dash-live.md

# 2. Simulate a PreToolUse Write of that content to a guarded path; expect exit 2
jq -n --rawfile c /tmp/em-dash-live.md \
  '{tool_name:"Write", tool_input:{file_path:"'$PWD'/02-Manuscript/Chapter-99-Test.md", content:$c}}' \
  | .claude/scripts/em-dash-guard-pre.sh
echo "exit=$?"   # ASSERT: 2, and no file created
```

Assert:
- The PreToolUse guard exits 2 and nothing is written to `02-Manuscript/`
- If the live content is reviewed (from /tmp), the Rules critic lands at Fail and the decision is REVISE via the critical-fail override
- Auto-revise treats every em-dash fix as confidence 1.0 (the ladder's one forced value; this is a documented rule, not a probabilistic judgment)

## Test 4: Marginal Chapter (Panel Rejection)

Fixture: `test-marginal.md` (filter words, no momentum, generic dialogue, no progress)

Run: `/review-chapter 03-Resources/smoke-fixtures/test-marginal.md`

Assert:
- All critic outputs validate against the schema
- Fewer than 5 of 7 critics return Pass or Strong Pass, so the panel gate rejects
- No critical-fail override fires (an Engagement Fail alone is not critical)
- Decision is REVISE with the panel gate as the reason

## Test 5: Smart-Review with Pruning

Fixture: `test-dialogue-heavy.md` (dialogue-dominant, no planted defects)

Run: `/smart-review 03-Resources/smoke-fixtures/test-dialogue-heavy.md`

Assert:
- Continuity and Rules critics ran (they are never pruned)
- At least 5 critics ran in total (the minimum panel)
- Every critic that ran was one of the named agents in smart-review's roster table
- The pruned panel gate is applied exactly as defined in review-engine.md ("Panel gate with pruning")

## Test 6: Character Voice Integrity (Critical Fail)

Fixture: `test-voice-fail.md` (established gruff voice shattered in paragraph two)

Run: `/review-chapter 03-Resources/smoke-fixtures/test-voice-fail.md`

Assert:
- Character critic output validates against the schema
- Character tier is Needs Work or Fail; for the override to fire it must be Fail with a voice-related one_line_reason
- If the override fires, decision is REVISE regardless of the panel count

## Test 7: Iteration Loop (Max Iterations)

Fixture: `test-complex-issue.md` (structural problems line fixes cannot solve)

Run: `/review-chapter` then let the auto-revise pipeline loop.

Assert:
- The loop never exceeds 5 iterations
- In an interactive session, the user is prompted at iteration 3; in execute-wrp/batch context that prompt is suppressed (see auto-revise-chapter.md)
- If still failing after iteration 5, the decision is MANUAL_REVIEW_NEEDED (escalation), not a silent PASS
- Each pass exists as a git worktree branch commit (no backup sidecar files)

## Test 8: Gating Arithmetic (dual gates)

Fixture: `test-numeric-mapping.md` (deliberately mixed quality)

Run: `/review-chapter 03-Resources/smoke-fixtures/test-numeric-mapping.md --verbose`

Assert:
- Tiers are displayed as the primary verdicts
- The weighted score is computed per review-engine.md and **controls gating together with the panel gate**: the final rule is `(panel_gate AND weighted_gate) AND no_critical_fails` (D2). The weighted score is NOT display-only.
- Tier-to-number mapping and weights are quoted from review-engine.md, not restated with different values
- The report's `**Weighted Score:** X.X/10` line matches the statusline regex (one decimal, slash, 10)

---

## Success Criteria

The suite passes when every assert above holds. Nondeterministic wobble (a Pass where Strong Pass was expected on a clean fixture) is acceptable anywhere no assert names a specific tier.

## Regression Testing

After any change to review-engine.md, review-chapter.md, smart-review.md, auto-revise-chapter.md, or the guard scripts, re-run all 8 tests plus `.claude/scripts/lint-framework.sh`.
