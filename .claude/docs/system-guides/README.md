# System Guides & Framework Documentation

This directory contains critical system-level documentation for the WriteAssist framework.

## Core Guides

### Review Engine
- **review-engine.md** - Four-tier rubric system, critic definitions, gating logic, character introduction detection

### Parallel Execution
- **PARALLEL-EXECUTION-GUIDE.md** - Critical guide for using Claude Code's TRUE parallel Task execution
- **parallel-review-implementation.md** - Complete implementation example for parallel review agents

## Quick Reference

### Critical Rules
1. **NEVER simulate multiple agents in a single Task** 
2. **ALWAYS use separate Task calls for parallel execution**
3. **Each agent gets its own context window**
4. **Users must see all agents running**

### Performance Benefits
- 10x speed improvement with parallel execution
- Clean context windows (no contamination)
- Better accuracy from focused agents
- Full transparency for users

## Recent Updates

### Character Introduction Detection (2025-10-01)
The Continuity critic now validates character introductions:
- **TIER 1 Critical**: Family members must be introduced with name + context on first appearance
- **Compendium Cross-Check**: Detects generic references when specific names exist in story-compendium.md
- **Auto-Fix Integration**: High confidence fixes (0.95-1.0) applied automatically
- **Critical Fail Override**: Anonymous family introductions force revision

See `review-engine.md` and `agents/continuity-checker.md` for complete specifications.

---

*These guides ensure proper use of Claude Code's capabilities for maximum efficiency.*