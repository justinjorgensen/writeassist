# WriteAssist Review Engine - Four-Tier Rubric

> **CANONICAL SOURCE OF TRUTH.** This document is the ONLY place where review gate numbers, tier-to-number values, dimension weights, and iteration caps are defined. Every other file (commands, agents, skills, docs) must link here instead of restating these numbers. If another file appears to state a different value, this document wins.

The review engine evaluates a chapter with seven named gating critics, each judged on a four-tier rubric. Results aggregate through a dual-gate system (panel gate plus weighted gate) with critical-fail overrides. Scores are qualitative model judgments used as a stopping heuristic, not ground truth.

---

## Four-Tier Rubric

| Tier | Meaning |
|------|---------|
| Strong Pass | Exceptional, publication-ready. Minimal polish needed. |
| Pass | Solid, meets standards. Minor improvements optional. |
| Needs Work | Functional but has clear issues. Targeted fixes required. |
| Fail | Critical problems present. Major revision required. |

---

## The Seven Gating Critics

Each critic is a read-only agent in `.claude/agents/` (`tools: Read, Grep, Glob`). The set of agents equals the set of critics equals the gate denominator.

| Critic | Agent | Weight | Critical-fail override |
|--------|-------|--------|------------------------|
| Continuity & Logic | continuity-checker | 20% | Any Fail forces Revise |
| Rules Compliance | rule-enforcer | 15% | Fail with confidence >= 0.90 (hard violation) forces Revise |
| Voice & Prose | voice-consistency | 15% | Fail with confidence >= 0.90 forces Revise |
| Characters & Arc | character-critic | 15% | none |
| Pacing & Flow | pacing-master | 12.5% | none |
| Dialogue & Subtext | dialogue-coach | 12.5% | none |
| Engagement & Impact | engagement-critic | 10% | none |

Total weight: 100%.

### What each critic checks
- **Continuity & Logic:** timeline consistency, character knowledge tracking, world-rule violations, plot logic, fact-checking against `story-compendium.md`, and character-introduction quality.
- **Rules Compliance:** `author-rules.md` hard constraints and mandates, POV and tense consistency, em-dash violations (zero tolerance), style-guide adherence.
- **Voice & Prose:** voice consistency, sentence variety and rhythm, filter words, grammar, readability.
- **Characters & Arc:** voice distinction, trait consistency, arc progression, emotional authenticity.
- **Pacing & Flow:** scene momentum, opening hook, ending propulsion, drag points, transition smoothness.
- **Dialogue & Subtext:** natural flow, voice distinction in dialogue, subtext, tag variety.
- **Engagement & Impact:** earned emotional beats, clear stakes, theme emergence, plot advancement, scene purpose.

The full anchor rubric for each tier lives in the agent file itself. Each critic emits structured JSON.

---

## Critic Output Schema

```json
{
  "critic": "Continuity",
  "tier": "Pass",
  "confidence": 0.92,
  "one_line_reason": "Timeline consistent, minor location detail needed",
  "fixes": [
    {"id": "fix-001", "summary": "Add time marker before scene transition at line 145"}
  ]
}
```

Fields: `critic` (the dimension name), `tier` (one of the four tiers), `confidence` (0.0 to 1.0), `one_line_reason` (max 100 chars), `fixes` (array, may be empty).

---

## Advisory Critics (feedback only, never gate)

Three advisory agents may run alongside the gating panel: `sensitivity-reviewer`, `thematic-guide`, `grammar-clarity`. They provide polish feedback but never participate in the panel gate, the weighted gate, or critical-fail overrides.

### Advisory pruning rule

Advisory critics are conditionally skipped to control cost. The seven gating critics always run; the gate denominator never changes.

1. **`--fast` flag:** `/review-chapter <file> --fast` skips all advisory critics. Only the seven gating critics run.
2. **No sensitivity constraint:** skip `sensitivity-reviewer` when `author-rules.md` declares no sensitivity constraint (no `Sensitivities:` entry and no sensitivity-related guidance). When the constraint exists but is blank, run it.

This is the only cost-aware pruning in the engine.

---

## Gating Rules

### Gate 1: Panel Gate (simple count)
```
pass_count = count(gating critics with tier in {"Pass", "Strong Pass"})
passes_panel = (pass_count >= 5)
```
At least 5 of 7 gating critics must return Pass or Strong Pass.

### Gate 2: Weighted Gate (quality threshold)
```
tier_value = {"Strong Pass": 10, "Pass": 8, "Needs Work": 6, "Fail": 4}
weighted_score = sum(tier_value[tier] * weight for each gating critic)
passes_weighted = (weighted_score >= 7.0)
```

Worked example:
- Continuity: Pass (8) x 0.20 = 1.60
- Rules: Pass (8) x 0.15 = 1.20
- Voice: Strong Pass (10) x 0.15 = 1.50
- Characters: Pass (8) x 0.15 = 1.20
- Pacing: Needs Work (6) x 0.125 = 0.75
- Dialogue: Pass (8) x 0.125 = 1.00
- Engagement: Pass (8) x 0.10 = 0.80
- Total: 8.05 >= 7.0, passes the weighted gate

### Critical-Fail Override
A chapter is forced to Revise, bypassing both gates, if any of these are true:
1. Continuity = Fail (any confidence).
2. Rules = Fail with confidence >= 0.90 (hard violation).
3. Voice & Prose = Fail with confidence >= 0.90.

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

    pass_count = sum(1 for r in results if r.tier in ("Pass", "Strong Pass"))
    passes_panel = pass_count >= 5

    tier_value = {"Strong Pass": 10, "Pass": 8, "Needs Work": 6, "Fail": 4}
    weight = {"Continuity": 0.20, "Rules": 0.15, "Voice": 0.15, "Characters": 0.15,
              "Pacing": 0.125, "Dialogue": 0.125, "Engagement": 0.10}
    weighted_score = sum(tier_value[r.tier] * weight.get(r.critic, 0) for r in results)
    passes_weighted = weighted_score >= 7.0

    if passes_panel and passes_weighted:
        return "PASS", f"Both gates passed (Panel {pass_count}/7, Weighted {weighted_score:.2f}/10.0)"
    return "REVISE", f"Gate failed (Panel {pass_count}/7, Weighted {weighted_score:.2f}/10.0)"
```

A chapter is approved only when both gates pass and no critical fail fires.

---

## Numeric Mapping (dashboard only)

| Tier | Dashboard value |
|------|-----------------|
| Fail | 4.0 |
| Needs Work | 6.0 |
| Pass | 8.0 |
| Strong Pass | 10.0 |

These numbers feed the weighted-gate calculation and the dashboard display. The qualitative tier is the primary signal.

---

## Auto-Revise Confidence Ladder

When a chapter goes to Revise, `/auto-revise-chapter` applies fixes by confidence:

| Confidence | Action |
|-----------|--------|
| 0.95 to 1.00 | Auto-apply immediately |
| 0.90 to 0.95 | Apply with an inline `[AR-XXX]` marker |
| 0.85 to 0.90 | Suggest only (HTML comment) |
| below 0.85 | Skip and log |

**Em-dash exception:** any em-dash removal is forced to confidence 1.0 and applied on every pass. The PostToolUse em-dash hook is the mechanical backstop that makes em dashes unwritable to manuscript files.

After a revise pass, the panel re-runs. Revision passes are isolated in git worktrees so each pass is a separate, diffable commit; see `/auto-revise-chapter`.

---

## Summary

Seven named gating critics, four-tier rubric, dual gate (5 of 7 Pass-or-better AND weighted score >= 7.0), with critical-fail overrides for Continuity, Rules, and Voice. Advisory critics inform but never gate, and are pruned on `--fast` or when no sensitivity constraint exists. Numeric scores exist for display; the tiers and gates are the authority.
