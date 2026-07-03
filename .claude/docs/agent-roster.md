# Agent Roster (generated from frontmatter)

> Regenerated 2026-07-03 from the YAML frontmatter of every file in `.claude/agents/`.
> This is a DOC, not an agent. If you add, remove, or retool an agent, regenerate this file (see R-20/R-42 in the project history).

**Total agents: 25** (20 read-only, 5 with write access)

## Read-only agents (reviewers, analysts, coordinators)

| Agent | Tools | Description |
|-------|-------|-------------|
| `adaptation-scout` | Read, Grep, Glob, WebFetch, WebSearch | Identifies film/TV/audio adaptation potential and rights opportunities. Use when assessing IP value. |
| `beta-reader-sim` | Read, Grep, Glob | Simulates a target-audience beta reader's reactions, confusions, and emotional responses. Use to predict reader experience. |
| `content-analyzer` | Read, Grep | Analyzes chapter content and selects optimal agents using deterministic rules - used internally by smart-review command |
| `continuity-checker` | Read, Grep, Glob | Cross-chapter continuity, timeline, and fact-consistency auditor. Use to catch contradictions before publishing. |
| `critic-sim` | Read, Grep, Glob | Simulates a tough literary critic reading the chapter. Use to stress-test work before sending to beta readers. |
| `dialogue-coach` | Read, Grep, Glob | Dialogue authenticity, voice distinction, and subtext specialist. Use when reviewing or improving conversation scenes. |
| `grammar-clarity` | Read, Grep, Glob | Grammar correctness, sentence clarity, and readability specialist. Use proactively when reviewing prose for technical accuracy and clarity issues. |
| `market-analyst` | Read, Grep, Glob, WebFetch, WebSearch | Market positioning, comp-title research, and category analysis. Use when defining where the book sits commercially. |
| `marketing-strategist` | Read, Grep, Glob, WebFetch, WebSearch | Marketing plan, audience targeting, and launch strategy specialist. Use post-manuscript when planning release. |
| `pacing-master` | Read, Grep, Glob | Pacing, tension, and scene rhythm specialist. Use when chapter pacing feels off or tension needs analysis. |
| `publisher-desk` | Read, Grep, Glob, WebFetch, WebSearch | Simulates an acquiring editor's eye for marketability, salability, and editorial concerns. Use to pressure-test commercial viability. |
| `query-coach` | Read, Grep, Glob, WebFetch, WebSearch | Query letter, synopsis, and pitch specialist. Use when preparing materials for literary agents or publishers. |
| `rule-enforcer` | Read, Grep, Glob | Enforces author-rules.md hard/soft constraints and mandates. Use FIRST before any creative task to load active rules. |
| `sensitivity-reviewer` | Read, Grep, Glob | Reviews content for representation accuracy and potentially harmful tropes. Use when scenes touch sensitive identity, trauma, or cultural material. |
| `series-coordinator` | Read, Grep, Glob, Task | Multi-book series continuity, arc tracking, and cross-book consistency. Use for series projects spanning multiple manuscripts. |
| `style-editor` | Read, Grep, Glob | Prose-level style, rhythm, and word-choice specialist. Use when polishing line-level writing. |
| `thematic-guide` | Read, Grep, Glob | Theme reinforcement and motif tracking specialist. Use to check whether central themes are landing. |
| `timeline-keeper` | Read, Grep, Glob | Tracks story timeline, character ages, and event sequencing. Use when manipulating chronology or adding flashbacks. |
| `transition-validator` | Read, Grep | Validates continuity between chapter endings and subsequent chapter beginnings - ensures events carry forward properly |
| `voice-consistency` | Read, Grep, Glob | Character voice distinction and narrator voice consistency specialist. Use when characters start sounding alike. |

## Creator agents (hold Write/Edit)

| Agent | Tools | Description |
|-------|-------|-------------|
| `character-developer` | Read, Write, Edit, Grep, Glob | Character profile, arc, and backstory builder. Use when creating new characters or deepening existing ones. |
| `research-assistant` | Read, Write, Edit, Grep, Glob, WebFetch, WebSearch | Research helper for historical, technical, scientific, or cultural accuracy. Use when verifying facts or gathering domain detail. |
| `story-architect` | Read, Write, Edit, Grep, Glob | High-level story structure, plot architecture, and act design. Use when building outlines or restructuring narrative. |
| `twist-engineer` | Read, Write, Edit, Grep, Glob | Plot twist, reveal, and narrative misdirection designer. Use when planning reveals or strengthening surprise. |
| `world-builder` | Read, Write, Edit, Grep, Glob | Worldbuilding, setting, magic-system, and lore architect. Use when constructing or expanding the story world. |

## Honest overlap notes

Several agents intentionally overlap; pick by lens, not by exclusivity:

- **Prose/style**: `style-editor` (line-level polish) overlaps `grammar-clarity` (correctness/readability) and `voice-consistency` (voice drift). In the core review panel, Prose maps to `style-editor`.
- **Reader experience**: `beta-reader-sim` (target-audience reactions; also the Character lens in the core panel) overlaps `critic-sim` (tough literary critic; the Engagement lens).
- **Continuity/time**: `continuity-checker` (cross-chapter facts; also covers world/lore consistency in reviews) overlaps `timeline-keeper` (chronology, ages) and `transition-validator` (chapter-boundary carry-over).
- **Market-facing**: `market-analyst`, `marketing-strategist`, `publisher-desk`, `query-coach`, and `adaptation-scout` share commercial territory; they differ by deliverable (positioning, launch plan, acquisition lens, query materials, rights).
- **Selection**: `content-analyzer` is not a critic; it picks which critics `smart-review` should run.

## Removed in the 2026-07-03 remediation

`meta-coordinator`, `simple-content-analyzer`, and `context-filter` were deleted (unreferenced, contradictory, or policy-violating). `agent-roster` was demoted from an agent to this doc. `series-coordinator` lost Write/Edit to match the read-only orchestration policy.
