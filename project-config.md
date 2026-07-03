# PROJECT-CONFIG.md - Your Project Settings

> **USER FILE:** This is YOUR configuration file. Customize it for your specific project.
> **For framework configuration**, see `CLAUDE.md` (DO NOT EDIT that file).

This file configures how AI assistants behave when working on YOUR specific writing project.
Customize these settings to match your genre, voice, tone, and style preferences.

## 🎯 Project Context

**Project Name**: 
**Genre**: 
**Target Audience**: [Your Audience]
**Writing Stage**: [Planning/Drafting/Revising/Editing]

## ✍️ Writing Style Guidelines

### Voice & Tone
- **Narrative Voice**: [First/Third person, past/present tense]
- **Tone**: [Serious/Light/Dark/Hopeful/etc]
- **Formality Level**: [Literary/Commercial/Casual]
- **Emotional Range**: [Restrained/Expressive/Variable]

### Prose Preferences
- **Sentence Variety**: [Short and punchy / Mixed lengths / Complex and flowing]
- **Description Style**: [Minimalist / Balanced / Rich and detailed]
- **Metaphor Usage**: [Rare / Occasional / Frequent]
- **Pacing**: [Fast / Moderate / Deliberate]

### ALWAYS DO:
- ✅ Maintain consistent character voices
- ✅ Check story-compendium.md for story facts
- ✅ Follow established timeline
- ✅ Respect character arcs
- ✅ Show rather than tell
- ✅ Earn emotional moments

### NEVER DO:
- ❌ Break established story logic without reason
- ❌ Change character core traits mid-story
- ❌ Use anachronistic language/concepts
- ❌ Info-dump exposition
- ❌ Resolve conflicts too easily
- ❌ [Your specific prohibition]

## 📝 Content Guidelines

### Themes to Emphasize
1. **[Primary Theme]**: [How to handle it]
2. **[Secondary Theme]**: [How to handle it]
3. **[Tertiary Theme]**: [How to handle it]

### Topics to Handle Carefully
- **[Sensitive Topic]**: [Approach guidelines]
- **[Complex Topic]**: [Treatment notes]

### Topics to Avoid
- ❌ [Topic to avoid]: [Reason]
- ❌ [Topic to avoid]: [Reason]

## 🎭 Character Voice Rules

### Dialogue Guidelines
- **Dialect/Accent**: [How to handle]
- **Formality Variations**: [Character differences]
- **Vocabulary Level**: [Educational backgrounds]
- **Speech Patterns**: [Unique character traits]

### Internal Monologue Style
- **Thought Presentation**: [Italics/Plain/Tagged]
- **Stream of Consciousness**: [Yes/No/Sometimes]
- **Self-Awareness Level**: [High/Medium/Low]

## 🔧 Technical Preferences

### Chapter Structure
- **Average Length**: [Word count target]
- **Scene Breaks**: [How to handle]
- **Cliffhangers**: [Every chapter/Sometimes/Rarely]
- **Multiple POVs**: [Yes/No - If yes, how to handle]

### Formatting
- **Dialogue**: [US/UK conventions]
- **Thoughts**: [Italics/Quotes/Plain]
- **Emphasis**: [Italics/Bold/Neither]
- **Scene Breaks**: [###/***/___|

## 🤖 AI Behavior Rules

### CRITICAL: Parallel Agent Execution
When using multi-agent reviews (review-chapter, batch-review-and-revise, etc.):
1. **ALWAYS use separate Task agents** - Never simulate multiple agents in one Task
2. **Launch agents in parallel** - All 10 review agents run simultaneously
3. **Each agent gets clean context** - No contamination between analyses
4. **User sees all agents running** - Full transparency and 10x speed improvement
5. **See `.claude/docs/system-guides/PARALLEL-EXECUTION-GUIDE.md`** for implementation details

### MANDATORY: Before ANY Task
1. **READ `author-rules.md` FIRST** - This is your primary constraint document
2. **Flag rule violations** with `[RULE VIOLATION: rule-name]` tags
3. **Justify any rule-breaking** with explicit reasoning
4. **Suggest rule updates** when patterns emerge

### When Writing New Content
1. **Check author-rules.md** for constraints and mandates
2. **Read relevant chapters** to match style
3. **Check story-compendium.md** for story facts
4. **Review character documents** for voice
5. **Maintain established pacing**
6. **Flag any canon or rule conflicts**

### When Editing/Revising
1. **Preserve author's voice** over AI preferences
2. **Suggest, don't override** stylistic choices
3. **Mark significant changes** with comments
4. **Maintain consistency** over variety
5. **Respect established canon** absolutely

### When Analyzing
1. **Be specific** with examples
2. **Prioritize major issues** over nitpicks
3. **Suggest solutions**, not just problems
4. **Consider genre expectations**
5. **Respect creative choices**

## 🚦 Quality Standards

### Minimum Requirements
- [ ] Character actions align with established traits
- [ ] Timeline makes logical sense
- [ ] World rules remain consistent
- [ ] Dialogue sounds natural when read aloud
- [ ] Themes emerge from story, not preaching

### Excellence Markers
- [ ] Subtext enriches dialogue
- [ ] Descriptions engage multiple senses
- [ ] Pacing varies appropriately
- [ ] Emotions feel earned
- [ ] Ending satisfies but surprises

## 🎨 Creative License

### AI MAY Add:
- ✅ Sensory details that enhance immersion
- ✅ Character gestures/reactions that fit personality
- ✅ Environmental details that support mood
- ✅ Natural dialogue tags and actions
- ✅ Transitional passages between scenes

### AI MAY NOT Add:
- ❌ New plot points without approval
- ❌ Character backstory not in CODEX
- ❌ World elements that change physics
- ❌ Dialogue that breaks character voice
- ❌ Themes not established in planning

## 📊 Progress Tracking

### Current Focus
- **Active Chapter**: [Chapter X]
- **Stage**: [First Draft/Revision/Polish]
- **Priority**: [Speed/Quality/Consistency]

### Known Issues
- [ ] [Issue to address]
- [ ] [Issue to address]

### Style Evolution
Track intentional style changes as story progresses:
- **Early Chapters**: [Style notes]
- **Middle Chapters**: [Style evolution]
- **Late Chapters**: [Style maturation]

## 🔄 Update Protocol

When making changes to this document:
1. Note the date and reason
2. Update all active AI agents
3. Re-run consistency checks
4. Document in change log

### Change Log
| Date | Section | Change | Reason |
|------|---------|--------|--------|
| [Date] | [Section] | [What changed] | [Why] |

---

*This document governs all AI assistance on this project.*
*Regularly update to refine AI behavior and maintain consistency.*