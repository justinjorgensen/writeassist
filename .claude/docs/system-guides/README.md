# System Guides & Framework Documentation

This directory and its parent (`.claude/docs/`) contain system-level documentation for the WriteAssist framework.

## What lives where

### In `.claude/docs/` (parent directory)
- **review-engine.md** - THE canonical spec: four-tier rubric, critic definitions, gate numbers, weights, iteration caps. Every other file links here for gating.
- **agent-roster.md** - Generated list of all agents with tools and honest overlap notes.
- **smoke-tests.md** - Smoke-test checklist and fixtures for the review pipeline.

### In this directory
- **cron-setup.md** - Recommended scheduled jobs (weekly continuity, daily smart-review, query follow-ups).
- **ultrareview-gate.md** - When and how the author runs `/code-review ultra` as the final publish gate.

### In `.claude/docs/archive/`
- **PARALLEL-EXECUTION-GUIDE.md**, **parallel-review-implementation.md** - Deprecated v1 docs, kept for history only. Do not follow them.

## Quick Reference

### Critical Rules
1. **NEVER simulate multiple agents in a single Task**
2. **ALWAYS use separate Task calls for parallel execution**
3. **Each agent gets its own context window**
4. **Critics are spawned as NAMED read-only agents** (see the mapping table in `.claude/commands/review-chapter.md`)

### Character Introduction Detection
The Continuity critic validates character introductions:
- **TIER 1 Critical**: Family members must be introduced with name + context on first appearance
- **Compendium Cross-Check**: Detects generic references when specific names exist in story-compendium.md
- **Auto-Fix Integration**: High confidence fixes (0.95-1.0) applied automatically
- **Critical Fail Override**: Anonymous family introductions force revision

See `../review-engine.md` and `../../agents/continuity-checker.md` for complete specifications.
