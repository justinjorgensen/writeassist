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
Deploy the seven named, tool-isolated gating critics in parallel to evaluate a chapter against the four-tier rubric. Each critic runs in its own clean context window and returns a structured assessment. Results aggregate through the dual-gate system (panel gate plus weighted gate) with critical-fail overrides.

The seven gating critics are real agents in `.claude/agents/`, each locked to `Read, Grep, Glob`. They physically cannot edit the manuscript, so review is read-only by design. Edits flow through `/auto-revise-chapter`.

---

## Implementation Requirement (read this first)

This command MUST launch the seven gating critics as **separate, named Task calls in a single response** so they run in parallel. Each Task sets `subagent_type` to the agent's exact name. Do NOT use `subagent_type: general-purpose`, and do NOT inline the rubric into a prompt: the rubric already lives in each agent file.

The seven gating critics and their `subagent_type` values:

| Dimension (weight) | subagent_type |
|---|---|
| Continuity & Logic (20%, critical-fail) | `continuity-checker` |
| Rules Compliance (15%, critical-fail) | `rule-enforcer` |
| Voice & Prose (15%, critical-fail) | `voice-consistency` |
| Pacing & Flow | `pacing-master` |
| Dialogue & Subtext | `dialogue-coach` |
| Characters & Arc (15%) | `character-critic` |
| Engagement & Impact (10%) | `engagement-critic` |

### Correct invocation

Invoke all selected critics in ONE message. Each Task names its agent:

```xml
<function_calls>
<invoke name="Task">
  <parameter name="subagent_type">continuity-checker</parameter>
  <parameter name="description">Continuity and Logic critic</parameter>
  <parameter name="prompt">Review the chapter at [path] against your four-tier rubric. Cross-check facts against story-compendium.md and constraints in author-rules.md. Return your JSON assessment.</parameter>
</invoke>
<invoke name="Task">
  <parameter name="subagent_type">rule-enforcer</parameter>
  <parameter name="description">Rules Compliance critic</parameter>
  <parameter name="prompt">Review the chapter at [path] against your four-tier rubric and author-rules.md hard constraints. Return your JSON assessment.</parameter>
</invoke>
<invoke name="Task">
  <parameter name="subagent_type">voice-consistency</parameter>
  <parameter name="description">Voice and Prose critic</parameter>
  <parameter name="prompt">Review the chapter at [path] against your four-tier rubric. Return your JSON assessment.</parameter>
</invoke>
<invoke name="Task">
  <parameter name="subagent_type">pacing-master</parameter>
  <parameter name="description">Pacing and Flow critic</parameter>
  <parameter name="prompt">Review the chapter at [path] against your four-tier rubric. Return your JSON assessment.</parameter>
</invoke>
<invoke name="Task">
  <parameter name="subagent_type">dialogue-coach</parameter>
  <parameter name="description">Dialogue and Subtext critic</parameter>
  <parameter name="prompt">Review the chapter at [path] against your four-tier rubric. Return your JSON assessment.</parameter>
</invoke>
<invoke name="Task">
  <parameter name="subagent_type">character-critic</parameter>
  <parameter name="description">Characters and Arc critic</parameter>
  <parameter name="prompt">Review the chapter at [path] against your four-tier rubric. Return your JSON assessment.</parameter>
</invoke>
<invoke name="Task">
  <parameter name="subagent_type">engagement-critic</parameter>
  <parameter name="description">Engagement and Impact critic</parameter>
  <parameter name="prompt">Review the chapter at [path] against your four-tier rubric. Return your JSON assessment.</parameter>
</invoke>
</function_calls>
```

### Incorrect invocation (do not do this)

```xml
<invoke name="Task">
  <parameter name="subagent_type">general-purpose</parameter>
  <parameter name="prompt">Simulate seven critics...</parameter>
</invoke>
```

A general-purpose agent with an inline prompt defeats tool isolation (it could edit the manuscript) and does not exercise the rubric that lives in each agent file. Always name the agents.

---

## Advisory Critics (feedback only, never gate)

Three advisory agents may run alongside the gating panel: `sensitivity-reviewer`, `thematic-guide`, `grammar-clarity`. They provide polish feedback but do NOT participate in the panel gate, the weighted gate, or critical-fail overrides.

### Advisory pruning rule (the real, documented behavior)

Advisory critics are conditionally skipped to control cost. The seven gating critics ALWAYS run.

1. **`--fast` flag:** `/review-chapter <file> --fast` skips all advisory critics. Only the seven gating critics run.
2. **No sensitivity constraint:** skip `sensitivity-reviewer` when `author-rules.md` declares no sensitivity constraint. Concretely, if `author-rules.md` has no `Sensitivities:` entry and no sensitivity-related guidance, `sensitivity-reviewer` is not launched. When in doubt (the constraint is present but blank), run it.

This is the only cost-aware pruning in the engine. The gating denominator never shrinks: it is always the seven named critics.

---

## Dual-Gate System and Critical-Fail Logic

The seven gating critics map to fixed weights:

| Critic | Weight | Critical-fail override |
|---|---|---|
| Continuity & Logic | 20% | Any Fail forces Revise |
| Rules Compliance | 15% | Fail with confidence >= 0.90 (hard violation) forces Revise |
| Voice & Prose | 15% | Fail with confidence >= 0.90 forces Revise |
| Characters & Arc | 15% | none (voice path owned by Voice & Prose) |
| Pacing & Flow | see review-engine.md | none |
| Dialogue & Subtext | see review-engine.md | none |
| Engagement & Impact | 10% | none |

### Gate 1: Panel Gate (simple count)
```
pass_count = count(gating critics with tier in {"Pass", "Strong Pass"})
passes_panel = (pass_count >= 5)
```
At least **5 of 7** gating critics must return Pass or Strong Pass.

### Gate 2: Weighted Gate (quality threshold)
```
tier_value = {"Strong Pass": 10, "Pass": 8, "Needs Work": 6, "Fail": 4}
weighted_score = sum(tier_value[tier] * weight for each gating critic)
passes_weighted = (weighted_score >= 7.0)
```

Example:
- Continuity: Pass (8) x 0.20 = 1.60
- Rules: Pass (8) x 0.15 = 1.20
- Voice: Strong Pass (10) x 0.15 = 1.50
- Characters: Pass (8) x 0.15 = 1.20
- Pacing: Needs Work (6) x 0.125 = 0.75
- Dialogue: Pass (8) x 0.125 = 1.00
- Engagement: Pass (8) x 0.10 = 0.80
- Total meets the weighted-gate threshold defined in review-engine.md (worked example lives there)

### Final Decision
```python
def evaluate_chapter(results):
    # Step 1: critical-fail overrides bypass both gates
    for r in results:
        if r.critic == "Continuity" and r.tier == "Fail":
            return "REVISE", "Critical fail: Continuity contradiction"
        if r.critic == "Rules" and r.tier == "Fail" and r.confidence >= 0.90:
            return "REVISE", "Critical fail: Hard rule violation"
        if r.critic == "Voice" and r.tier == "Fail" and r.confidence >= 0.90:
            return "REVISE", "Critical fail: Voice integrity"

    # Step 2: panel gate
    pass_count = sum(1 for r in results if r.tier in ("Pass", "Strong Pass"))
    passes_panel = pass_count >= 5

    # Step 3: weighted gate
    tier_value = {"Strong Pass": 10, "Pass": 8, "Needs Work": 6, "Fail": 4}
    weight = {"Continuity": 0.20, "Rules": 0.15, "Voice": 0.15, "Characters": 0.15,
              "Pacing": 0.125, "Dialogue": 0.125, "Engagement": 0.10}
    weighted_score = sum(tier_value[r.tier] * weight.get(r.critic, 0) for r in results)
    passes_weighted = weighted_score >= 7.0

    # Step 4: both gates must pass
    if passes_panel and passes_weighted:
        return "PASS", f"Both gates passed (Panel {pass_count}/7, Weighted {weighted_score:.2f}/10.0)"
    return "REVISE", f"Gate failed (Panel {pass_count}/7, Weighted {weighted_score:.2f}/10.0)"
```

A chapter is approved only when **both gates pass and no critical fail fires**. Otherwise it goes to Revise.

---

## Numeric Mapping (dashboard only)

For visualization, tiers map to numbers; the mapping is defined ONLY in `.claude/docs/review-engine.md` and feeds the weighted gate AND the dashboard display. The qualitative tier is the primary signal; the number is a convenience. Scores are model judgments used as a stopping heuristic, not ground truth.

---

## Auto-Revise Integration

If the decision is REVISE:
- When called by `/execute-wrp`, revision proceeds automatically (no confirmation prompt) via `/auto-revise-chapter`, then the panel re-runs.
- When run manually, the command reports the decision and asks before applying fixes.

Fixes apply via the confidence ladder documented in `/auto-revise-chapter`:
- 0.95 to 1.00: auto-apply
- 0.90 to 0.95: apply with an inline `[AR-XXX]` marker
- 0.85 to 0.90: suggest only
- below 0.85: skip

Em dash removal always applies at confidence 1.0 (zero tolerance), and the PostToolUse em-dash hook is the mechanical backstop.

---

## Review Output Format

```markdown
# Chapter Review Report
**Chapter:** [Number - Title]
**Decision:** [PASS / REVISE]
**Reason:** [Both gates passed (6/7) / Critical fail: Continuity contradiction / etc.]

## Gating Critic Results
### Continuity & Logic (continuity-checker)
- Tier: Pass | Confidence: 0.94 | Reason: Timeline consistent, all facts check out

### Rules Compliance (rule-enforcer)
- Tier: Pass | Confidence: 0.97 | Reason: All hard constraints followed

### Voice & Prose (voice-consistency)
- Tier: Strong Pass | Confidence: 0.90 | Reason: Voice strong, no em dashes

### Characters & Arc (character-critic)
- Tier: Pass | Confidence: 0.91 | Reason: Characters consistent, actions motivated

### Pacing & Flow (pacing-master)
- Tier: Pass | Confidence: 0.88 | Reason: Momentum maintained, hook and ending land

### Dialogue & Subtext (dialogue-coach)
- Tier: Needs Work | Confidence: 0.86 | Reason: Some voices blend, subtext thin

### Engagement & Impact (engagement-critic)
- Tier: Pass | Confidence: 0.89 | Reason: Emotional beats earned, story progresses

## Panel Gate
- Pass or better: 6/7 (need 5) -> passes

## Weighted Gate
- Weighted score meets the review-engine.md threshold -> passes

## Critical Fail Check
- Continuity: Pass | Rules: Pass | Voice: Pass -> no override

## Advisory Critics (feedback only)
- sensitivity-reviewer: [run / skipped: no sensitivity constraint / skipped: --fast]
- thematic-guide: [tier or skipped]
- grammar-clarity: [tier or skipped]

## Final Decision: PASS
```

---

## Command Variations

```bash
# Full review: seven gating critics plus applicable advisory critics
review-chapter Chapter-07

# Fast review: gating critics only, advisory critics skipped
review-chapter Chapter-07 --fast

# Review without an auto-revise prompt
review-chapter Chapter-07 --no-autofix
```

---

## Success Criteria

Review succeeds when:
- The seven gating critics launch as named, parallel Task calls in one response
- Each returns its JSON assessment from its own agent rubric
- Advisory pruning is applied (`--fast` and the sensitivity rule)
- Panel gate and weighted gate are both computed
- Critical-fail overrides are checked first
- A clear PASS or REVISE decision is reported

---

*This command uses the four-tier rubric with dual-gate gating. See `.claude/docs/review-engine.md` for the complete specification.*


---

## Report Persistence (MANDATORY)

Every run writes its full report to `.claude/state/reviews/<chapter-slug>-<n>.md`, where `<n>` increments per review of that chapter (e.g. `chapter-05-2.md` for the second review of Chapter 5). Create the directory if missing.

The report MUST contain a weighted-score line in exactly this shape so the statusline can read it:

```
**Weighted Score:** 8.1/10
```

(One decimal, slash, 10; computed per review-engine.md.) Also include the decision (PASS/REVISE), the per-critic tiers, and the fixes JSON. This is what keeps review results persistent and the statusline's `last:` segment real.
