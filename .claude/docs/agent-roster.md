# Agent Roster (generated from frontmatter)

> Regenerated 2026-07-03 from the YAML frontmatter of every file in `.claude/agents/`.
> This is a DOC, not an agent. Regenerate it whenever an agent is added, removed, or retooled (lint checks it against the directory).

**Total agents: 16** (11 read-only, 5 with write access)

## Read-only agents (reviewers, analysts)

| Agent | Tools | Description |
|-------|-------|-------------|
| `character-critic` | Read, Grep, Glob | Characters and Arc reviewer. Use to judge character voice distinction, trait consistency, and arc progression against the four-tier rubric. Read-only gating critic. |
| `continuity-checker` | Read, Grep, Glob | Cross-chapter continuity, timeline, and fact-consistency auditor. Use to catch contradictions before publishing. |
| `dialogue-coach` | Read, Grep, Glob | Dialogue authenticity, voice distinction, and subtext specialist. Use when reviewing or improving conversation scenes. |
| `engagement-critic` | Read, Grep, Glob | Engagement and Impact reviewer. Use to judge emotional payoff, tension, stakes, theme emergence, and plot advancement against the four-tier rubric. Read-only gating critic. |
| `grammar-clarity` | Read, Grep, Glob | Grammar correctness, sentence clarity, and readability specialist. Use proactively when reviewing prose for technical accuracy and clarity issues. |
| `pacing-master` | Read, Grep, Glob | Pacing, tension, and scene rhythm specialist. Use when chapter pacing feels off or tension needs analysis. |
| `rule-enforcer` | Read, Grep, Glob | Enforces author-rules.md hard/soft constraints and mandates. Use FIRST before any creative task to load active rules. |
| `sensitivity-reviewer` | Read, Grep, Glob | Reviews content for representation accuracy and potentially harmful tropes. Use when scenes touch sensitive identity, trauma, or cultural material. |
| `thematic-guide` | Read, Grep, Glob | Theme reinforcement and motif tracking specialist. Use to check whether central themes are landing. |
| `timeline-keeper` | Read, Grep, Glob | Tracks story timeline, character ages, and event sequencing. Use when manipulating chronology or adding flashbacks. |
| `voice-consistency` | Read, Grep, Glob | Character voice distinction and narrator voice consistency specialist. Use when characters start sounding alike. |

## Creator agents (hold Write/Edit)

| Agent | Tools | Description |
|-------|-------|-------------|
| `character-developer` | Read, Write, Edit, Grep, Glob | Character profile, arc, and backstory builder. Use when creating new characters or deepening existing ones. |
| `research-assistant` | Read, Write, Edit, Grep, Glob, WebFetch, WebSearch | Research helper for historical, technical, scientific, or cultural accuracy. Use when verifying facts or gathering domain detail. |
| `story-architect` | Read, Write, Edit, Grep, Glob | High-level story structure, plot architecture, and act design. Use when building outlines or restructuring narrative. |
| `twist-engineer` | Read, Write, Edit, Grep, Glob | Plot twist, reveal, and narrative misdirection designer. Use when planning reveals or strengthening surprise. |
| `world-builder` | Read, Write, Edit, Grep, Glob | Worldbuilding, setting, magic-system, and lore architect. Use when constructing or expanding the story world. |
