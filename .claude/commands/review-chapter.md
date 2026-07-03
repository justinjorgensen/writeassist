---
description: Run the parallel critic panel on a chapter and gate per review-engine.md
argument-hint: "[chapter-file]"
allowed-tools: Read, Grep, Glob, Task, Write
---
# Review Chapter - Parallel Multi-Critic Analysis

**No-argument behavior:** If no argument is given: list chapters in `02-Manuscript/` and stop. (Write access is only for saving the report to `.claude/state/reviews/`.)

**Target Chapter:** $ARGUMENTS

---

## Purpose
Deploy 7 core critics with separate context windows to analyze chapters using a four-tier rubric system. Each critic runs independently and simultaneously for maximum speed and accuracy.

## Implementation Requirements
**IMPORTANT**: This command requires invoking 7 separate Task critics IN A SINGLE RESPONSE for true parallel execution. Do not simulate multiple critics within one task - actually invoke 7 Task tools simultaneously.

---

## How This Command Works

When you run `review-chapter Chapter-7`, Claude Code will:
1. Launch 7 separate Task critics SIMULTANEOUSLY
2. Each critic gets its own clean context window
3. All critics run in parallel (not simulated)
4. You see all 7 critics running in the UI
5. Results aggregate using panel gate logic
6. Auto-revise triggers if chapter fails panel OR hits critical fail

### What You'll See:
```
🤖 Running 7 critics...
├─ Prose & Voice [██████████] 100% ✓ Pass
├─ Pacing & Flow [██████████] 100% ✓ Pass
├─ Character & Arc [███████░░░] 70% → Strong Pass
├─ Dialogue & Subtext [██████████] 100% ✓ Pass
├─ Continuity & Logic [████████░░] 80% ⚠ Needs Work
├─ Engagement & Impact [██████████] 100% ✓ Pass
└─ Rules Compliance [██████████] 100% ✓ Pass

Panel Gate: 6/7 Pass or Better → ✓ CHAPTER PASSES
```

---

## The 7 Core Critics + 4 Secondary Critics

**Note**: Core critics review internal chapter quality and control gating. Secondary critics provide advisory feedback only. For chapter-to-chapter continuity, use `/validate-transitions` command.

**Review System:** Four-tier rubric with dual-gate system (Panel Gate + Weighted Gate). See `.claude/docs/review-engine.md` for complete specifications including:
- Detailed anchor rubric for each critic
- Critic weights (defined only there)
- Secondary critics (M-Dash Detection, Themes, Plot, Immersion) - advisory only

### Critic 1: Prose & Voice
**Focus:** Grammar, flow, voice consistency, sentence variety, em dash violations
**Tier Anchors:**
- Strong Pass: "Could publish this prose as-is, flows beautifully"
- Pass: "Prose is clear and effective, voice consistent"
- Needs Work: "Noticeable mechanical issues or voice inconsistency"
- Fail: "Em dashes present OR voice completely wrong"

**Output Schema:**
```json
{
  "critic": "Prose",
  "tier": "Pass",
  "confidence": 0.92,
  "one_line_reason": "Voice strong, no em dashes, minor filter words",
  "fixes": [{"id":"fix-001","summary":"Remove 'felt' at line 45"}]
}
```

---

### Critic 2: Pacing & Flow
**Focus:** Scene momentum, chapter hooks, transitions, drag points
**Tier Anchors:**
- Strong Pass: "Page-turner pacing, perfect scene balance"
- Pass: "Maintains momentum, transitions work"
- Needs Work: "Multiple drag points slow reading"
- Fail: "Chapter has no forward motion or purpose"

---

### Critic 3: Character & Arc
**Focus:** Voice distinction, trait consistency, arc progression, authenticity
**Tier Anchors:**
- Strong Pass: "Characters feel real, growth authentic"
- Pass: "Characters consistent, actions make sense"
- Needs Work: "Some out-of-character moments"
- Fail: "Character unrecognizable or major trait violated"

**Critical Fail Override:** Fail with confidence ≥ 0.90 AND voice issue forces Revise.

---

### Critic 4: Dialogue & Subtext
**Focus:** Natural flow, character voice distinction, subtext, conversation rhythm
**Tier Anchors:**
- Strong Pass: "Dialogue sparkles, voices distinct, subtext rich"
- Pass: "Natural conversation, characters distinguishable"
- Needs Work: "Some stilted dialogue or sameness"
- Fail: "Characters sound identical or exposition dumps"

---

### Critic 5: Continuity & Logic (ALWAYS RUN)
**Focus:** Timeline consistency, plot holes, world rules, fact checking vs story-compendium.md, **character introduction quality**
**Tier Anchors:**
- Strong Pass: "Airtight continuity, all facts check out, characters properly introduced"
- Pass: "No contradictions, timeline works, introductions adequate"
- Needs Work: "Minor inconsistencies need clarification, thin character introductions"
- Fail: "Direct contradiction of established facts OR family members not properly introduced"

**Critical Fail Override:** ANY Fail from Continuity forces chapter to Revise, regardless of panel vote.

**Character Introduction Detection:** Continuity critic now validates:
- Family members introduced with name + context on first appearance
- Named characters from compendium not referenced generically ("his son" when compendium has "Marcus, age 10")
- Characters with dialogue introduced before or during first dialogue tag
- Photo/memory references include name + context immediately

---

### Critic 6: Engagement & Impact
**Focus:** Emotional beats, tension, stakes, theme emergence, plot advancement
**Tier Anchors:**
- Strong Pass: "Emotionally powerful, themes resonate"
- Pass: "Engaging read, story progresses"
- Needs Work: "Some flat moments or forced themes"
- Fail: "No emotional impact in key scenes or preachy"

---

### Critic 7: Rules Compliance (ALWAYS RUN)
**Focus:** author-rules.md hard constraints, POV consistency, tense consistency, mandates
**Tier Anchors:**
- Strong Pass: "Exceeds all standards and mandates"
- Pass: "All rules followed, constraints respected"
- Needs Work: "Soft constraint violations or mandate misses"
- Fail: "Hard constraint violated with high confidence"

**Critical Fail Override:** Fail with confidence ≥ 0.90 and hard violation forces Revise.

---

## Dual-Gate System & Critical Fail Logic

### Gate 1: Panel Gate (Simple Count)
A chapter **passes the panel gate** if:
```
pass_count = count(core critics with tier == "Pass" OR tier == "Strong Pass")
pass_count >= 5
```

At least **5 of 7 core critics** must return Pass or Strong Pass.

### Gate 2: Weighted Gate (Quality Threshold)
A chapter **passes the weighted gate** if the weighted score meets the threshold defined in `.claude/docs/review-engine.md`. The tier values, dimension weights, and a worked example live ONLY in that document; compute the gate exactly as specified there.

### Chapter Approval Requires BOTH Gates
```
PASS = (passes_panel_gate AND passes_weighted_gate) AND no_critical_fails
```

### Critical Fail Overrides
A chapter is **forced to Revise** if ANY of these conditions are true:

1. **Continuity = Fail** (any confidence)
   - Direct contradiction of established facts
   - Example: EMP in Ch2, airplane works in Ch3

2. **Rules = Fail** with confidence ≥ 0.90
   - Hard constraint violation confirmed
   - Example: Em dashes found (zero tolerance)

3. **Voice & Prose = Fail** with confidence ≥ 0.90
   - Voice completely wrong for this author/story
   - Prose fundamentally broken
   - Voice integrity critical to story

### Final Decision Logic
```python
def evaluate_chapter(critic_results):
    # Step 1: Check critical fails FIRST (bypass both gates)
    for result in critic_results:
        if result.critic == "Continuity" and result.tier == "Fail":
            return "REVISE", "Critical Fail: Continuity contradiction"

        if result.critic == "Rules" and result.tier == "Fail" and result.confidence >= 0.90:
            return "REVISE", "Critical Fail: Hard rule violation"

        if result.critic == "Voice" and result.tier == "Fail" and result.confidence >= 0.90:
            return "REVISE", "Critical Fail: Voice integrity"

    # Step 2: Calculate Panel Gate
    core_critics = [r for r in critic_results if r.critic in CORE_CRITICS]
    pass_count = sum(1 for r in core_critics if r.tier in ["Pass", "Strong Pass"])
    passes_panel = (pass_count >= 5)

    # Step 3: Calculate Weighted Gate
    tier_values = {"Strong Pass": 10, "Pass": 8, "Needs Work": 6, "Fail": 4}
    weights = {
        "Continuity": 0.20, "Rules": 0.15, "Voice": 0.15, "Characters": 0.15,
        "Pacing": 0.125, "Dialogue": 0.125, "Engagement": 0.10
    }
    weighted_score = sum(tier_values[r.tier] * weights.get(r.critic, 0) for r in core_critics)
    passes_weighted = (weighted_score >= 7.0)

    # Step 4: Both gates must pass
    if passes_panel and passes_weighted:
        return "PASS", f"Both gates passed (Panel: {pass_count}/7, Weighted: {weighted_score:.2f}/10.0)"
    elif passes_panel and not passes_weighted:
        return "REVISE", f"Panel passed but weighted failed ({weighted_score:.2f} < 7.0)"
    elif not passes_panel and passes_weighted:
        return "REVISE", f"Weighted passed but panel failed ({pass_count}/7 < 5)"
    else:
        return "REVISE", f"Both gates failed (Panel: {pass_count}/7, Weighted: {weighted_score:.2f}/10.0)"
```

---

## Numeric Mapping (Dashboard Display Only)

For visualization and the weighted gate, tiers map to numbers. The mapping is defined ONLY in `.claude/docs/review-engine.md`; use it for:
1. **Weighted Gate Calculation** (CONTROLS GATING)
2. **Panel Gate** tier counting (CONTROLS GATING)
3. **Dashboard Display:** progress tracking and visualization

Both panel gate AND weighted gate must pass for chapter approval (unless critical fail overrides).

---

## Auto-Revise Integration

### Trigger Logic:
```python
def should_revise(evaluation_result):
    if evaluation_result.decision == "REVISE":
        if called_by == "execute-wrp":
            # Automatic revision without confirmation
            apply_fixes(critic_results)
            re_review_chapter()  # Loop until pass
        else:
            # Manual review - ask user
            prompt_user_for_auto_revise()
```

### Fix Confidence Ladder:
- **0.95-1.00**: Auto-apply immediately
- **0.90-0.95**: Apply with inline marker
- **0.85-0.90**: Suggest only
- **< 0.85**: Skip

**Special Rule:** Em dash removal ALWAYS auto-applies (confidence = 1.0)

---

## Review Output Format

### Aggregate Report:
```markdown
# Chapter Review Report
**Chapter:** [Number - Title]
**Decision:** [PASS / REVISE]
**Reason:** [Panel approved (6/7) / Critical: Continuity contradiction / etc.]

## Critic Results:

### Prose & Voice
- **Tier:** Pass
- **Confidence:** 0.92
- **Reason:** Voice strong, no em dashes, minor filter words
- **Fixes:** 2 suggested

### Pacing & Flow
- **Tier:** Strong Pass
- **Confidence:** 0.88
- **Reason:** Chapter maintains momentum, strong hook and ending
- **Fixes:** None

### Character & Arc
- **Tier:** Pass
- **Confidence:** 0.91
- **Reason:** Characters consistent, actions motivated
- **Fixes:** 1 suggested

### Dialogue & Subtext
- **Tier:** Needs Work
- **Confidence:** 0.86
- **Reason:** Some characters sound similar, needs more subtext
- **Fixes:** 4 suggested

### Continuity & Logic
- **Tier:** Pass
- **Confidence:** 0.94
- **Reason:** Timeline consistent, all facts check out
- **Fixes:** None

### Engagement & Impact
- **Tier:** Pass
- **Confidence:** 0.89
- **Reason:** Emotional beats earned, story progresses well
- **Fixes:** 1 suggested

### Rules Compliance
- **Tier:** Pass
- **Confidence:** 0.97
- **Reason:** All hard constraints followed, no rule violations
- **Fixes:** None

---

## Panel Gate Analysis
- **Pass/Strong Pass Count:** 6/7
- **Threshold:** 5+ needed
- **Result:** ✓ Chapter PASSES panel gate

## Critical Fail Check
- Continuity: Pass (no override)
- Rules: Pass (no override)
- Character Voice: Pass (no override)
- **Result:** ✓ No critical fails

---

## Final Decision: PASS

Chapter meets quality standards. Proceed to next chapter or apply optional fixes for polish.

## Fix Summary (Optional):
Total fixes available: 8
- High confidence (0.95+): 3 → Auto-apply
- Medium confidence (0.90-0.95): 2 → Apply with markers
- Low confidence (0.85-0.90): 3 → Suggestions only

Run `/auto-revise-chapter` to apply fixes automatically.
```

### Dashboard Display (Optional):
```markdown
## Tier Summary
- Prose: Pass
- Pacing: Strong Pass
- Character: Pass
- Dialogue: Needs Work
- Continuity: Pass
- Engagement: Pass
- Rules: Pass

**Weighted Average:** X.X/10 (computed per review-engine.md; shown for dashboard tracking)
```

---

## Benefits of Parallel Execution:

1. **Fast Reviews** - All 7 critics run simultaneously
2. **Clean Context Windows** - No contamination between analyses
3. **Visible Progress** - See all critics working in UI
4. **Independent Assessment** - No influence between critics
5. **Better Accuracy** - Each critic focuses purely on their specialty

---

## Command Variations

```bash
# Basic review with all 7 critics
review-chapter Chapter-07

# Review without auto-revise prompt
review-chapter Chapter-07 --no-autofix

# Verbose output with detailed fix analysis
review-chapter Chapter-07 --verbose
```

---

## Parallel Execution Instructions

**Incorrect approach (sequential or simulated):**
One Task told to "simulate 7 different critics" in a single context. This is sequential, contaminates analyses, and (worse) a generic agent holds Write/Edit, violating the read-only review policy.

**Correct approach (true parallel execution, named read-only agents):**
Each critic is spawned as its NAMED agent from `.claude/agents/`. These agents are locked to `Read, Grep, Glob` and carry the Output Contract for the shared JSON schema. The core-7 mapping:

| Dimension | subagent_type |
|-----------|---------------|
| Prose | `style-editor` |
| Pacing | `pacing-master` |
| Character | `beta-reader-sim` (character/arc lens) |
| Dialogue | `dialogue-coach` |
| Continuity | `continuity-checker` |
| Engagement | `critic-sim` |
| Rules | `rule-enforcer` |

Invoke all 7 Task tools in a SINGLE response like this:
```xml
<function_calls>
<invoke name="Task">
  <parameter name="subagent_type">style-editor</parameter>
  <parameter name="description">Prose Critic</parameter>
  <parameter name="prompt">Review the chapter at [path] as the Prose critic using the four-tier rubric. Follow your Output Contract: final output is the shared JSON schema with "critic":"Prose".</parameter>
</invoke>
<invoke name="Task">
  <parameter name="subagent_type">pacing-master</parameter>
  <parameter name="description">Pacing Critic</parameter>
  <parameter name="prompt">Review the chapter at [path] as the Pacing critic using the four-tier rubric. Follow your Output Contract: final output is the shared JSON schema with "critic":"Pacing".</parameter>
</invoke>
<!-- ... ALL 7 CRITICS IN ONE MESSAGE, each with its named subagent_type from the table ... -->
</function_calls>
```

**Key point**: All Task invocations must be in ONE message for parallel execution.

---

## Success Metrics

Review succeeds when:
- ✓ All 7 critics run IN PARALLEL
- ✓ Each critic returns proper JSON schema
- ✓ Panel gate logic correctly applied
- ✓ Critical fail overrides checked
- ✓ Specific, actionable fixes provided
- ✓ Clear PASS/REVISE decision made

---

## Report Persistence (MANDATORY)

Every run writes its full report to `.claude/state/reviews/<chapter-slug>-<n>.md`, where `<n>` increments per review of that chapter (e.g. `chapter-05-2.md` for the second review of Chapter 5). Create the directory if missing.

The report MUST contain a weighted-score line in exactly this shape so the statusline can read it:

```
**Weighted Score:** 8.1/10
```

(Compute the value per review-engine.md; one decimal, slash, 10.) Also include the decision (PASS/REVISE), the per-critic tiers, and the fixes JSON. This is what makes review results persistent and the statusline's `last:` segment real.

---

## Iteration Loop

When chapter fails panel or hits critical fail:

1. Collect all fixes from critic results
2. Apply fixes using confidence ladder
3. Re-run review with same 7 critics
4. Re-evaluate with panel gate logic
5. Repeat until PASS or max 5 iterations
6. Escalate to manual review if max iterations reached

---

*This command uses the four-tier rubric system with panel-based gating. See `.claude/docs/review-engine.md` for complete specifications.*