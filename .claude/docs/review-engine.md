# WriteAssist Review Engine - Four-Tier Rubric System

**Version:** 2.2
**Last Updated:** 2026-07-03

> **CANONICAL SOURCE OF TRUTH.** This document is the ONLY place where review gate numbers, tier values, dimension weights, and iteration caps are defined. Every other file (commands, agents, skills, docs, CLAUDE.md) must link here instead of restating these numbers. If another file appears to state a different gate or threshold, this document wins.

---

## Overview

The WriteAssist Review Engine uses a panel of specialized critics that evaluate chapters using a four-tier rubric system. This replaces the previous numeric 8.0 threshold with clear, qualitative assessments and policy-based gating.

---

## Four-Tier Rubric

### Tier Definitions

| Tier | Meaning | Use Case |
|------|---------|----------|
| **Strong Pass** | Exceptional quality, publication-ready | Minimal polish needed |
| **Pass** | Solid quality, meets standards | Minor improvements optional |
| **Needs Work** | Functional but has clear issues | Targeted fixes required |
| **Fail** | Critical problems present | Major revision required |

### What Each Tier Means

**Strong Pass**
- Prose flows naturally with varied rhythm
- Characters feel authentic and consistent
- Pacing maintains reader engagement
- No rule violations or continuity breaks
- Ready for beta readers or publication

**Pass**
- Writing is clear and effective
- Minor polish opportunities exist
- No blocking issues
- Maintains voice and consistency
- Acceptable for first draft completion

**Needs Work**
- Noticeable issues impact reading experience
- Patterns of mechanical problems
- Voice inconsistencies or pacing drag
- Requires targeted revision
- Not ready for external readers

**Fail**
- Critical continuity contradictions
- Hard rule violations (em dashes, POV breaks)
- Character voice completely off
- Plot holes or logic failures
- Must be revised before proceeding

---

## Critic Output Schema

Every critic must emit structured JSON:

```json
{
  "critic": "Continuity",
  "tier": "Pass",
  "confidence": 0.92,
  "one_line_reason": "Timeline consistent, minor location detail needed",
  "fixes": [
    {
      "id": "fix-001",
      "summary": "Add time marker before scene transition at line 145"
    },
    {
      "id": "fix-002",
      "summary": "Clarify character's location when they enter (line 203)"
    }
  ]
}
```

### Required Fields

- **critic**: Name of the critic agent (Prose, Pacing, Character, etc.)
- **tier**: One of: "Strong Pass", "Pass", "Needs Work", "Fail"
- **confidence**: 0.0-1.0 indicating how certain the assessment is
- **one_line_reason**: Brief justification (max 100 chars)
- **fixes**: Array of actionable fix objects (can be empty for Strong Pass)

### Fix Object Schema

```json
{
  "id": "fix-NNN",
  "summary": "Short actionable description",
  "location": "line 145" | "scene 2" | "paragraph 3" (optional),
  "confidence": 0.95 (optional, inherits from critic if not specified)
}
```

---

## The Seven Core Critics + Four Secondary Critics

### Critic Weights

**Core Critics (Primary Gate)**
- Continuity & Logic: 20% (Critical Fail Override)
- Rules Compliance: 15% (Critical Fail Override)
- Voice & Prose: 15% (Critical Fail Override if confidence ≥ 0.90)
- Characters & Arc: 15%
- Pacing & Flow: 12.5%
- Dialogue & Subtext: 12.5%
- Engagement & Impact: 10%

**Total Core Weight:** 100%

**Secondary Critics (Advisory Only - Never Block)**
- M-Dash Detection: Advisory (feeds into Rules)
- Themes Integration: Advisory
- Plot Development: Advisory
- Sensory Immersion: Advisory

Secondary critics provide feedback but DO NOT participate in panel gate or weighted gate calculations.

---

## Core Critic Detailed Anchor Rubric

### 1. **Continuity & Logic** (20% - ALWAYS RUN - Critical Fail Override)

**What it checks:**
- Timeline consistency across chapters
- **Character introduction quality (NEW)**
- Character knowledge tracking (they only know what they've learned)
- World rule violations
- Plot logic holes
- Fact checking against story-compendium.md
- Event acknowledgment (if EMP in Ch2, electronics don't work in Ch3)

**Character Introduction Validation:**
- Family members introduced with name + context on first appearance
- Named characters from compendium not referenced generically
- Characters with dialogue introduced before/during first dialogue tag
- Photo/memory references include name + context immediately

**Strong Pass:**
- Airtight continuity, all facts check out against compendium
- **All characters properly introduced with name + context**
- Timeline crystal clear, no ambiguity
- Character knowledge perfectly tracked
- World rules consistently applied
- Zero contradictions or logic holes

**Pass:**
- No contradictions present
- **Character introductions adequate (name present, minimal context)**
- Timeline works and makes sense
- Character actions logically follow from their knowledge
- World rules respected
- Minor clarifications might improve but nothing blocks story

**Needs Work:**
- Minor timeline inconsistencies need clarification
- **Thin character introductions (name only, no context)**
- Character knowledge slightly unclear in one scene
- Small world detail seems off but not breaking
- Needs tightening but not fundamentally broken

**Fail:**
- Direct contradiction of established facts (EMP fried electronics, but phone works)
- **Family members appear in scene WITHOUT proper introduction**
- **Named character in compendium referenced generically ("his son" when compendium has "Marcus, age 10")**
- Timeline impossibility (travel time doesn't work)
- Character knows something they couldn't possibly know
- Major plot hole that breaks story logic
- World rule violated in a way that undermines the story

**Critical Fail Override:** ANY Fail from Continuity forces chapter to Revise, regardless of panel vote.

---

### 2. **Rules Compliance** (15% - ALWAYS RUN - Critical Fail Override if Hard Violation)

**What it checks:**
- author-rules.md hard constraints (NEVER break)
- author-rules.md mandates (ALWAYS do)
- POV consistency (no head-hopping)
- Tense consistency
- Em dash violations (ZERO TOLERANCE - should be caught by M-Dash critic)
- Style guide adherence

**Strong Pass:**
- Exceeds all standards and mandates
- POV and tense flawless
- Every hard constraint respected
- Every mandate fulfilled
- Zero em dashes (or other forbidden elements)
- Style guide followed perfectly

**Pass:**
- All hard constraints followed
- No mandate violations
- POV and tense consistent throughout
- Style guide respected
- No forbidden elements present

**Needs Work:**
- Soft constraint violations (AVOID but not forbidden)
- Mandate missed in minor way
- POV slips slightly but correctable
- Style guide deviated from but not critically

**Fail:**
- Hard constraint violated (em dashes present, POV head-hopping, forbidden element used)
- Multiple mandate violations
- Tense inconsistency throughout
- Breaks core author rules repeatedly

**Critical Fail Override:** Fail with confidence ≥ 0.90 AND hard violation (not soft constraint) forces Revise.

---

### 3. **Voice & Prose** (15% - Core - Critical Fail Override if confidence ≥ 0.90)

**What it checks:**
- Voice consistency with established author style
- Sentence variety and rhythm
- Filter word usage ("felt", "saw", "heard")
- Grammar and mechanical clarity
- Prose readability and flow
- Character voice distinction when in their POV

**Strong Pass:**
- Could publish this prose as-is
- Voice perfectly consistent with established style
- Sentence rhythm varied and engaging
- Filter words absent or brilliantly justified
- Grammar flawless
- Reads smoothly, no stumbles

**Pass:**
- Prose is clear and effective
- Voice consistent with established style
- Sentence variety adequate
- Filter words minimal and acceptable
- Grammar clean
- Reads well, minor polish opportunities

**Needs Work:**
- Noticeable voice inconsistency in some sections
- Sentence structure repetitive
- Too many filter words
- Some mechanical issues (grammar, punctuation)
- Readability suffers in places

**Fail:**
- Voice completely wrong for this author/character
- Unreadable or confusing prose
- Grammar issues make meaning unclear
- Filter words overwhelming
- Prose fundamentally broken

**Critical Fail Override:** Fail with confidence ≥ 0.90 forces Revise (voice integrity is critical).

---

### 4. **Characters & Arc** (15% - Core)

**What it checks:**
- Character voice distinction (do they sound like themselves?)
- Actions match established traits and motivations
- Arc progression feels natural and earned
- Emotional authenticity
- Character growth (or intentional stagnation) makes sense
- Consistency with previous chapters

**Strong Pass:**
- Characters feel real and alive
- Voices perfectly distinct and authentic
- Actions flow naturally from established traits
- Arc progression feels earned and authentic
- Emotional beats ring true
- Growth (or resistance to growth) makes perfect sense

**Pass:**
- Characters consistent with previous chapters
- Actions make sense for who they are
- Voices distinguishable
- Arc progression logical
- Emotions feel authentic
- No jarring out-of-character moments

**Needs Work:**
- Some out-of-character moments that need explaining
- Voice distinction could be sharper
- Arc progression feels slightly forced
- Emotional beats need more setup
- One or two actions don't quite fit

**Fail:**
- Character completely unrecognizable
- Actions contradict established core traits
- Arc progression makes no sense
- Emotional authenticity completely absent
- Multiple major out-of-character moments

**Note:** Fail does NOT trigger critical override unless voice issue AND high confidence (handled by Voice & Prose critic).

---

### 5. **Pacing & Flow** (12.5% - Core)

**What it checks:**
- Scene momentum (does story move forward?)
- Chapter opening hook
- Ending propulsion (chapter end leaves reader wanting more)
- Drag points and rush zones
- Transition smoothness between scenes
- Beat timing (action/reflection balance)

**Strong Pass:**
- Page-turner pacing throughout
- Opening hook immediately engaging
- Perfect scene balance (action/reflection)
- Transitions seamless
- Ending creates strong forward momentum
- Zero drag points

**Pass:**
- Chapter maintains forward motion
- Opening engages within first paragraph
- Scenes have clear purpose
- Transitions work naturally
- Ending provides momentum
- Minor pacing adjustments possible but not required

**Needs Work:**
- Multiple drag points slow reading
- Opening takes too long to engage
- Some scenes feel purposeless
- Transitions feel abrupt or forced
- Ending lacks momentum
- Beat timing off (too much action or too much reflection)

**Fail:**
- Chapter has no forward motion
- Opening completely fails to engage
- Multiple scenes serve no story purpose
- Transitions broken
- Ending provides zero momentum
- Pacing fundamentally broken

---

### 6. **Dialogue & Subtext** (12.5% - Core)

**What it checks:**
- Natural conversation flow
- Character voice distinction in dialogue
- Subtext presence (what's NOT being said)
- Dialogue serves story purpose
- Tag variety and action beats
- Reads naturally aloud
- Age/education/background appropriate vocabulary

**Strong Pass:**
- Dialogue sparkles and feels completely natural
- Voices perfectly distinct (could identify speaker without tags)
- Rich subtext in every exchange
- Every line serves character or plot
- Reads beautifully aloud
- Tag variety perfect, action beats enhance

**Pass:**
- Natural conversation flow
- Characters distinguishable by voice
- Some subtext present
- Dialogue serves story
- Reads well aloud
- Tags and beats adequate

**Needs Work:**
- Some stilted or unnatural dialogue
- Character voices blend together in places
- Subtext weak or absent
- Some dialogue feels like filler
- Awkward when read aloud
- Tag variety needed

**Fail:**
- Characters all sound identical
- Dialogue completely unnatural
- Zero subtext (just exposition dumps)
- Dialogue serves no purpose
- Unreadable aloud
- Pure exposition disguised as conversation

---

### 7. **Engagement & Impact** (10% - Core)

**What it checks:**
- Emotional beats earned (setup before payoff)
- Tension and stakes clear
- Theme emergence (NOT preaching)
- Plot advancement (does story progress?)
- Reader investment (do we care?)
- Scene purpose (why is this scene here?)

**Strong Pass:**
- Emotionally powerful and resonant
- Tension palpable, stakes crystal clear
- Themes emerge naturally from story
- Plot advances significantly
- Reader deeply invested in outcome
- Every scene essential

**Pass:**
- Engaging read
- Emotional beats feel earned
- Tension present, stakes clear enough
- Themes present but not preachy
- Story progresses meaningfully
- Scenes have clear purpose

**Needs Work:**
- Some flat emotional moments
- Tension weak in places
- Themes feel forced or preachy
- Plot advancement minimal
- Reader investment waning
- Some scenes feel unnecessary

**Fail:**
- No emotional impact in key scenes
- Zero tension or unclear stakes
- Heavy-handed theme preaching
- Plot doesn't advance at all
- Reader has no reason to care
- Chapter serves no story purpose

---

## Secondary Critics (Advisory Only)

These critics provide feedback but DO NOT block chapter passage. They inform revisions but don't participate in gating calculations.

### S1. **M-Dash Detection** (Advisory - Feeds Rules Critic)

**Purpose:** Detect and flag all em dash usage for zero-tolerance enforcement.

**Strong Pass:** Zero em dashes found
**Pass:** Zero em dashes found
**Needs Work:** Em dashes found (1-3)
**Fail:** Em dashes found (4+)

**Action:** Results feed into Rules Compliance critic. Any em dashes found should cause Rules to consider a Fail for hard constraint violation.

### S2. **Themes Integration** (Advisory)

**Purpose:** Evaluate theme development without blocking on heavy-handedness (Engagement critic handles preachiness).

**Strong Pass:** Themes woven seamlessly, resonate deeply
**Pass:** Themes present and natural
**Needs Work:** Themes present but could be more subtle
**Fail:** N/A (Advisory - never fails)

### S3. **Plot Development** (Advisory)

**Purpose:** Track plot advancement and foreshadowing (Engagement critic handles story progress requirement).

**Strong Pass:** Significant plot advancement, excellent foreshadowing
**Pass:** Plot moves forward adequately
**Needs Work:** Minimal plot movement
**Fail:** N/A (Advisory - never fails)

### S4. **Sensory Immersion** (Advisory)

**Purpose:** Evaluate sensory detail richness (Voice & Prose critic handles readability requirement).

**Strong Pass:** Rich multi-sensory immersion
**Pass:** Adequate sensory details
**Needs Work:** Sparse sensory details
**Fail:** N/A (Advisory - never fails)

**Note:** Secondary critics provide polish recommendations but cannot block chapter passage.

---

## Aggregation & Gating Rules

The review engine uses a **dual-gate system** with critical fail overrides.

### Gate 1: Panel Gate (Simple Count)

A chapter **passes the panel gate** if:
```
pass_count = count(core critics with tier == "Pass" OR tier == "Strong Pass")
pass_count >= 5
```

At least **5 of 7 core critics** must return Pass or Strong Pass.

---

### Gate 2: Weighted Gate (Quality Threshold)

A chapter **passes the weighted gate** if:
```
weighted_score = sum(tier_value * weight for each core critic)
weighted_score >= 70% of maximum possible

Where:
- Strong Pass = 10 points
- Pass = 8 points
- Needs Work = 6 points
- Fail = 4 points

Maximum possible = 10 * 1.00 (100% weight) = 10.0
Threshold = 7.0 (70% of 10.0)
```

**Weighted Calculation:**
```python
weighted_score = (
    (Continuity tier value × 0.20) +
    (Rules tier value × 0.15) +
    (Voice tier value × 0.15) +
    (Characters tier value × 0.15) +
    (Pacing tier value × 0.125) +
    (Dialogue tier value × 0.125) +
    (Engagement tier value × 0.10)
)

if weighted_score >= 7.0:
    passes_weighted_gate = True
```

**Example Passing Scenario:**
- Continuity: Pass (8) × 0.20 = 1.6
- Rules: Pass (8) × 0.15 = 1.2
- Voice: Strong Pass (10) × 0.15 = 1.5
- Characters: Pass (8) × 0.15 = 1.2
- Pacing: Needs Work (6) × 0.125 = 0.75
- Dialogue: Pass (8) × 0.125 = 1.0
- Engagement: Pass (8) × 0.10 = 0.8

**Total:** 8.05 ≥ 7.0 → **PASSES WEIGHTED GATE**

(This example has 6/7 Pass+, but even with 5/7 Pass+ and good Strong Passes, weighted can pass)

---

### Chapter Passes if BOTH Gates Pass

A chapter is approved when:
```
(passes_panel_gate AND passes_weighted_gate) AND no_critical_fails
```

If either gate fails, or any critical fail is present, the chapter goes to Revise.

### Critical Fail Override

A chapter is **forced to Revise** if ANY of these conditions are true:

1. **Continuity = Fail** (any confidence)
   - Direct contradiction of established facts
   - Cannot proceed with broken continuity

2. **Rules = Fail** with confidence ≥ 0.90
   - Hard constraint violation confirmed
   - Must fix before progressing

3. **Voice & Prose = Fail** with confidence ≥ 0.90
   - Voice completely wrong for this author/story
   - Prose fundamentally broken
   - Voice integrity critical to story

**Note:** Critical fail overrides bypass BOTH gates. If any critical fail triggers, chapter goes to Revise immediately.

---

### Final Decision Logic

```python
def evaluate_chapter(critic_results):
    # Step 1: Check critical fails FIRST (bypass gates)
    for result in critic_results:
        if result.critic == "Continuity" and result.tier == "Fail":
            return "REVISE", "Critical Fail: Continuity contradiction"

        if result.critic == "Rules" and result.tier == "Fail" and result.confidence >= 0.90:
            return "REVISE", "Critical Fail: Hard rule violation"

        if result.critic == "Voice" and result.tier == "Fail" and result.confidence >= 0.90:
            return "REVISE", "Critical Fail: Voice integrity"

    # Step 2: Calculate Panel Gate (simple count)
    core_critics = [r for r in critic_results if r.critic in CORE_CRITICS]
    pass_count = sum(1 for r in core_critics if r.tier in ["Pass", "Strong Pass"])
    passes_panel = (pass_count >= 5)

    # Step 3: Calculate Weighted Gate (quality threshold)
    tier_values = {"Strong Pass": 10, "Pass": 8, "Needs Work": 6, "Fail": 4}
    weights = {
        "Continuity": 0.20,
        "Rules": 0.15,
        "Voice": 0.15,
        "Characters": 0.15,
        "Pacing": 0.125,
        "Dialogue": 0.125,
        "Engagement": 0.10
    }

    weighted_score = sum(
        tier_values[r.tier] * weights.get(r.critic, 0)
        for r in core_critics
    )
    passes_weighted = (weighted_score >= 7.0)

    # Step 4: Final decision requires BOTH gates
    if passes_panel and passes_weighted:
        return "PASS", f"Both gates passed (Panel: {pass_count}/7, Weighted: {weighted_score:.2f}/10.0)"
    elif passes_panel and not passes_weighted:
        return "REVISE", f"Panel passed but weighted failed ({weighted_score:.2f} < 7.0)"
    elif not passes_panel and passes_weighted:
        return "REVISE", f"Weighted passed but panel failed ({pass_count}/7 < 5)"
    else:
        return "REVISE", f"Both gates failed (Panel: {pass_count}/7, Weighted: {weighted_score:.2f}/10.0)"
```

**Summary:**
1. Critical fails override everything → Immediate REVISE
2. Must pass Panel Gate (5/7 Pass+) AND Weighted Gate (≥7.0) → PASS
3. Fail either gate → REVISE

---

## Numeric Mapping (Dashboard Only)

For visualization and progress tracking, tiers map to numbers:

| Tier | Dashboard Value |
|------|----------------|
| Fail | 4.0 |
| Needs Work | 6.0 |
| Pass | 8.0 |
| Strong Pass | 10.0 |

**IMPORTANT:** These tier-to-number mappings are used for BOTH weighted gate calculations (controls gating) AND dashboard visualization. The dual-gate system uses these values:
- **Weighted Gate:** Uses these numbers × weights to calculate score (must be ≥7.0)
- **Panel Gate:** Uses simple tier counting (need 5/7 Pass or Strong Pass)
- **Critical Fails:** Override both gates entirely

### Weighted Score Display

The weighted gate calculation (Continuity 20%, Rules 15%, Voice 15%, Characters 15%, Pacing 12.5%, Dialogue 12.5%, Engagement 10%) produces a score on a 10-point scale.

**Dashboard Display Example:**
```markdown
## Weighted Gate Score: 8.05/10.0 ✓ PASS (≥7.0)

Breakdown:
- Continuity (20%): Pass (8) → 1.60
- Rules (15%): Pass (8) → 1.20
- Voice (15%): Strong Pass (10) → 1.50
- Characters (15%): Pass (8) → 1.20
- Pacing (12.5%): Needs Work (6) → 0.75
- Dialogue (12.5%): Pass (8) → 1.00
- Engagement (10%): Pass (8) → 0.80

Total: 8.05 ≥ 7.0 threshold
```

This weighted score is useful for:
- Evaluating overall quality beyond simple counting
- Identifying which critics contribute most to score
- Comparing chapter quality over time
- Understanding why a chapter passed or failed weighted gate

**IMPORTANT:** While this weighted score DOES control gating (must be ≥7.0), it works in tandem with the panel gate (need 5/7 Pass+). BOTH gates must pass for chapter approval.

---

## Smart-Review Integration

When using smart-review to prune critics based on chapter content:

### Rules for Pruning

1. **ALWAYS RUN:**
   - Continuity (critical fail override)
   - Rules (critical fail override)

2. **Can be pruned based on content:**
   - Prose (if minimal narration)
   - Pacing (if single-scene chapter)
   - Character (if no major character scenes)
   - Dialogue (if dialogue-light)
   - Engagement (if transitional chapter)

3. **Panel gate with pruning:**
   ```python
   critics_run = len([c for c in results if c was executed])
   pass_count = len([c for c in results if c.tier in ["Pass", "Strong Pass"]])

   # Need 5 passes OR 70% of critics run passed
   if pass_count >= 5 or (pass_count / critics_run >= 0.70):
       return "PASS"
   ```

### Example: Dialogue-Heavy Chapter

Smart-review might run only:
- Dialogue (core for this chapter)
- Character (speakers need consistency)
- Continuity (ALWAYS)
- Rules (ALWAYS)
- Prose (light check)

5 critics run. Need at least 4 passes to succeed: 4/5 = 80%, which clears the 70% threshold (3/5 = 60% does not).

---

## Auto-Revise Confidence Ladder

When fixes are proposed, confidence determines application strategy:

### Confidence Levels

**0.95-1.00: Auto-Apply**
- Apply fix immediately without markers
- Log change for review
- Examples: Em dash removal, grammar fixes, filter words

**0.90-0.95: Stage with Markers**
- Apply fix but add inline marker
- Format: `[AR-001: Fix applied, verify context]`
- Examples: Passive voice conversion, transition additions

**0.85-0.90: Suggest Only**
- Add comment but don't apply
- Format: `<!-- SUGGEST: Consider rephrasing this sentence -->`
- Examples: Stylistic preferences, voice adjustments

**< 0.85: Skip**
- Too low confidence to suggest
- Log for potential manual review

### Special Rule: Em Dash Removal

**ALWAYS AUTO-APPLY** regardless of confidence:
```python
if "em dash" in fix.summary.lower():
    apply_immediately()
    confidence = 1.0  # Override to maximum
```

Em dashes have **zero tolerance** and are fixed on every pass.

---

## Critic Anchor Statements

Each critic should use these anchors to calibrate their assessments:

### Prose & Voice
- **Strong Pass:** "Could publish this prose as-is, flows beautifully"
- **Pass:** "Prose is clear and effective, voice consistent"
- **Needs Work:** "Noticeable mechanical issues or voice inconsistency"
- **Fail:** "Em dashes present OR voice completely wrong"

### Pacing & Flow
- **Strong Pass:** "Page-turner pacing, perfect scene balance"
- **Pass:** "Maintains momentum, transitions work"
- **Needs Work:** "Multiple drag points slow reading"
- **Fail:** "Chapter has no forward motion or purpose"

### Character & Arc
- **Strong Pass:** "Characters feel real, growth authentic"
- **Pass:** "Characters consistent, actions make sense"
- **Needs Work:** "Some out-of-character moments"
- **Fail:** "Character unrecognizable or major trait violated"

### Dialogue & Subtext
- **Strong Pass:** "Dialogue sparkles, voices distinct, subtext rich"
- **Pass:** "Natural conversation, characters distinguishable"
- **Needs Work:** "Some stilted dialogue or sameness"
- **Fail:** "Characters sound identical or exposition dumps"

### Continuity & Logic
- **Strong Pass:** "Airtight continuity, all facts check out"
- **Pass:** "No contradictions, timeline works"
- **Needs Work:** "Minor inconsistencies need clarification"
- **Fail:** "Direct contradiction of established facts"

### Engagement & Impact
- **Strong Pass:** "Emotionally powerful, themes resonate"
- **Pass:** "Engaging read, story progresses"
- **Needs Work:** "Some flat moments or forced themes"
- **Fail:** "No emotional impact in key scenes or preachy"

### Rules Compliance
- **Strong Pass:** "Exceeds all standards and mandates"
- **Pass:** "All rules followed, constraints respected"
- **Needs Work:** "Soft constraint violations or mandate misses"
- **Fail:** "Hard constraint violated with high confidence"

---

## Iteration & Loop Control

### Auto-Revision Loop

When a chapter fails the panel:

1. Collect all fixes from critic results
2. Apply fixes using confidence ladder
3. Re-run review with same critic panel
4. Check panel gate again
5. Repeat until pass OR max iterations reached

### Loop Limits

```python
MAX_ITERATIONS = 5
ESCALATION_THRESHOLD = 3

for iteration in range(1, MAX_ITERATIONS + 1):
    results = run_review_panel(chapter)

    if evaluate_chapter(results) == "PASS":
        return "SUCCESS", results

    if iteration >= ESCALATION_THRESHOLD:
        # After 3 attempts, ask user if they want to continue
        if not user_confirms_continue():
            return "MANUAL_REVIEW_NEEDED", results

    apply_fixes(results)

return "MAX_ITERATIONS_REACHED", results
```

After 5 iterations without passing, escalate to manual review.

---

## Example Critic Output

### Example 1: Clean Chapter (Passes)

```json
{
  "critic": "Continuity",
  "tier": "Pass",
  "confidence": 0.94,
  "one_line_reason": "All facts consistent with Ch2, timeline clear",
  "fixes": []
}
```

```json
{
  "critic": "Prose",
  "tier": "Strong Pass",
  "confidence": 0.88,
  "one_line_reason": "Voice strong, rhythm varied, no em dashes",
  "fixes": [
    {
      "id": "fix-001",
      "summary": "Consider varying sentence openers in paragraph 3 (optional polish)"
    }
  ]
}
```

**Result:** 6/7 critics return Pass or better → **Chapter PASSES**

---

### Example 2: Critical Continuity Fail

```json
{
  "critic": "Continuity",
  "tier": "Fail",
  "confidence": 0.98,
  "one_line_reason": "EMP in Ch2 disables electronics, airplane works here",
  "fixes": [
    {
      "id": "fix-001",
      "summary": "Remove airplane scene or explain EMP shielding",
      "location": "scene 3"
    }
  ]
}
```

**Result:** Critical fail override → **Chapter FORCED TO REVISE** (even if 6 other critics passed)

---

### Example 3: Rules Violation

```json
{
  "critic": "Rules",
  "tier": "Fail",
  "confidence": 0.96,
  "one_line_reason": "7 em dashes found (zero tolerance policy)",
  "fixes": [
    {
      "id": "fix-001",
      "summary": "Replace em dash with comma at line 45"
    },
    {
      "id": "fix-002",
      "summary": "Replace em dash with colon at line 89"
    },
    {
      "id": "fix-003",
      "summary": "Replace em dash with period at line 134"
    }
  ]
}
```

**Result:** Critical fail override (confidence 0.96 ≥ 0.90, hard violation) → **Chapter FORCED TO REVISE**

---

## Version History

### Version 2.1 (2025-10-01) - Character Introduction Detection

**New Feature: Character Introduction Validation**
- Continuity critic now detects improper character introductions
- **TIER 1 Critical**: Family members (spouse, children, parents, siblings)
- **TIER 2**: Named colleagues, emotional significant characters, recurring characters
- **TIER 3**: Skip - functional roles, unnamed crowd/group references

**Detection Rules Added:**
1. Anonymous Introduction: Flags pronoun/role references without names ("his daughter")
2. Compendium Cross-Check: Detects generic references when specific names exist in story-compendium.md
3. Photo/Memory Exception: Requires name + context in reference moment
4. Dialogue Priority: Characters must be introduced before/during first dialogue
5. Belated Introduction: Catches names appearing late after anonymous first mention

**Auto-Fix Integration:**
- High confidence fixes (0.95-1.0): Auto-applied immediately
- Medium confidence (0.90-0.95): Applied with [AR-XXX] markers
- Low confidence (0.85-0.90): Suggestion comments only

**Critical Fail Triggers:**
- Family member in scene without name + context
- Named character from compendium used generically throughout
- Character with dialogue introduced only as pronoun/role

**Files Updated:**
- `.claude/agents/continuity-checker.md` - Added detection system with examples
- `.claude/commands/review-chapter.md` - Updated Critic 5 focus
- `.claude/docs/review-engine.md` - Added validation to Continuity rubric anchors

### Version 2.0 (2025-09-29) - Four-Tier Rubric System

**Major System Overhaul:**
- Replaced numeric 1-10 scores with qualitative four-tier rubric (Strong Pass, Pass, Needs Work, Fail)
- Introduced dual-gate system (Panel Gate + Weighted Gate)
- Added critical fail overrides for Continuity, Rules, and Voice (high confidence)

**What Changed:**

| Old System | New System |
|-----------|------------|
| Numeric scores 1-10 | Four-tier rubric |
| Weighted average ≥ 8.0 threshold | Panel gate (5/7 pass) + critical fails |
| Numbers control gating | Numbers for dashboard only |
| All agents equal weight in gating | Critical fail overrides |

**Backward Compatibility:**
For dashboards expecting numeric scores:
- Map tiers to numbers (4, 6, 8, 10)
- Calculate weighted average for display
- Show both tier and number in UI

**Command Updates:**
- `/review-chapter`: Now uses four-tier rubric
- `/smart-review`: Preserves Continuity and Rules in pruning
- `/auto-revise-chapter`: Uses confidence ladder
- `/batch-review-and-revise`: Applies new gating to each chapter

---

## Testing & Validation

### Smoke Test Cases

**Test 1: Continuity Contradiction**
- Chapter with EMP in Ch2, electronics work in Ch3
- Expected: Continuity returns Fail, chapter forced to Revise
- Validates critical fail override

**Test 2: Clean Chapter**
- Well-written chapter, no issues
- Expected: 6-7 critics return Pass/Strong Pass
- Validates panel gate

**Test 3: Em Dash Violation**
- Chapter with 5 em dashes
- Expected: Rules returns Fail, auto-revise removes all em dashes
- Validates zero tolerance policy

**Test 4: Marginal Chapter**
- 4 Pass, 2 Needs Work, 1 Fail (non-critical)
- Expected: Panel rejects (need 5 passes), goes to revision
- Validates panel threshold

**Test 5: Smart-Review with Continuity**
- Dialogue-heavy chapter, prune to 5 critics
- Expected: Continuity and Rules still run
- Validates ALWAYS RUN rule

---

## Future Enhancements

### Planned Improvements

1. **Critic Consolidation**
   - Move detection logic (pacing, dialogue tagging) to shared tools
   - Critics become policy appliers only
   - Reduces duplication

2. **Theme/Plot Merger**
   - Combine Theme and Plot into Engagement critic
   - Reduces critic count to 6 core

3. **Optional Immersion**
   - Make sensory/immersion checking optional
   - Fold into Prose or Pacing when needed

4. **Confidence Calibration**
   - Track critic accuracy over time
   - Adjust confidence thresholds based on real performance

5. **User Feedback Loop**
   - Allow users to rate critic assessments
   - Train confidence scoring with real data

---

## Summary

The WriteAssist Review Engine uses a **four-tier rubric** (Strong Pass, Pass, Needs Work, Fail) evaluated by **7 core critics**. Chapters pass when at least **5 critics** return Pass or better, unless a **critical fail** (Continuity, Rules with high confidence) forces revision.

Numeric scores (4, 6, 8, 10) exist only for dashboards and visualization. The panel gate and critical fail rules are the sole authorities for gating decisions.

Auto-revision uses a **confidence ladder** (0.95+ auto-apply, 0.90-0.95 stage with markers, 0.85-0.90 suggest only), with **zero tolerance for em dashes**.

This system provides clear, defensible quality gates while preserving flexibility for editorial judgment.