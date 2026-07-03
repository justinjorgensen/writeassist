---
description: Create a detailed chapter blueprint (WRP), gated by plan mode
argument-hint: "[chapter-number]"
---
# Generate WRP (Writing Requirements Plan)

**No-argument behavior:** If no argument is given: list outline chapters lacking WRPs and stop.

**Chapter/Section:** $ARGUMENTS

---

## Plan-Mode Gate

A WRP is a 5-10 page chapter blueprint, getting it wrong wastes the entire chapter-write that follows. This command MUST enter plan mode after gathering context and present the proposed WRP for approval before writing it to `05-wrp/`.

Flow:
1. Read author-rules.md, story-compendium.md, project-config.md, and the outline entry for the target chapter.
2. **Enter plan mode** with: chapter goals → POV/voice → key beats → required setups/payoffs → continuity hooks from previous chapter.
3. Wait for `ExitPlanMode` approval.
4. Write the finalized WRP to `05-wrp/chapter_XX_WRP.md`.

Skip with `--no-plan` only when batch-generating from an already-approved outline.

---

## Purpose
Create a comprehensive Writing Requirements Plan that ensures:
- Story consistency across chapters
- Character development tracking
- Plot thread management
- Theme integration
- Pacing guidelines

---

## File Operations

### START: Setup
1. **Read author-rules.md** FIRST for:
   - Hard constraints to never break
   - Soft constraints to avoid
   - Mandates to always follow
   - Thematic guardrails
2. **Read story-compendium.md** to understand:
   - Character profiles
   - Timeline position
   - Plot structure
   - Theme development
3. **Check writing-tracker.md** for:
   - Previous chapter status
   - Word count targets
   - Completion timeline
4. **Determine output**: `05-wrp/chapter_XX_[title]_WRP.md`

---

## Pre-WRP Analysis

### 1. **Transition Context Check**
- **CRITICAL**: Read the LAST 300 words of the previous chapter
- Note the ending state:
  - Where each character is
  - What just happened (events, revelations, actions)
  - Environmental conditions (time, weather, location)
  - Emotional temperature
  - Any cliffhangers or unresolved immediate issues
- This becomes the REQUIRED STARTING POINT for the new chapter

### 2. **Story Context Review**
- Read previous 2-3 chapters for broader continuity
- Check character arcs and development
- Review timeline for accuracy
- Note unresolved plot threads

### 2. **Chapter Positioning**
- Where this chapter fits in story arc
- What must be accomplished
- Character emotional states
- Plot advancement needed

---

## WRP Structure

### Chapter Overview
- **Title**: [Chapter title]
- **Opening Hook**: *[First line/scene concept]*
- **Word Target**: [Target word count]
- **Purpose**: [What this chapter accomplishes]
- **Emotional Arc**: [Beginning emotion → End emotion]
- **Key Question**: [What readers should wonder]

---

### Transition Context (FROM PREVIOUS CHAPTER)
- **Previous Chapter Ending State**: [Last 300 words summary]
  - Final Event: [What happened]
  - Character Positions: [Where everyone is]
  - Environmental State: [Time, weather, location]
  - Unresolved Immediate Issues: [What needs eventual resolution]
- **Transition Strategy**: 
  - Type: [Direct continuation / Time jump / POV switch / Location change]
  - Approach: [How to handle - immediate pickup / subtle acknowledgment / save for later / show consequences]
- **When returning to this thread**: [If POV switching, note when/how to resume]

### Previous Chapter Summary
- **What Happened**: [Brief summary]
- **Characters Present**: [Who appeared]
- **Plot Progress**: [What advanced]
- **Unresolved**: [What's hanging]

---

### Content Planning

#### What NOT to Repeat
- [Already established facts]
- [Character traits shown]
- [Settings described]

#### What to Develop
- [Character growth areas]
- [Plot advancement]
- [Theme exploration]

---

### Core Elements

#### Characters in This Chapter
- **Primary Focus**: [Main character(s)]
- **Supporting Cast**: [Who else appears]
- **Character Goals**: [What each wants]
- **Character Obstacles**: [What stops them]

#### Setting Details
- **Location(s)**: [Where scenes occur]
- **Atmosphere**: [Mood and tone]
- **Time**: [When this happens]
- **Sensory Details**: [What to emphasize]

#### Plot Points
- **Must Happen**: [Essential events]
- **Can Happen**: [Optional elements]
- **Setup for Later**: [Foreshadowing]

---

### Scene Structure

#### Opening Scene
- **Purpose**: [Hook reader, establish stakes]
- **POV**: [Whose perspective]
- **Conflict**: [Immediate tension]

#### Middle Scenes
1. **Scene A** – [Development]
   - Purpose: [Why include]
   - Conflict: [Tension point]
   
2. **Scene B** – [Complication]
   - Purpose: [Why include]
   - Conflict: [Tension point]

#### Closing Scene
- **Cliffhanger/Resolution**: [How to end]
- **Emotional Note**: [Reader feeling]
- **Setup**: [What comes next]

---

### Dialogue Requirements
- **Character Voice Notes**: [How each speaks]
- **Information to Convey**: [Through natural dialogue]
- **Subtext**: [What's not being said]
- **Conflict in Conversation**: [Tension points]

---

### Description Balance
- **Action**: [X%]
- **Dialogue**: [X%]
- **Description**: [X%]
- **Internal Thought**: [X%]

---

### Theme Integration
- **Primary Theme**: [How it appears]
- **Subtle References**: [Background elements]
- **Character Embodiment**: [Who represents what]

---

### Pacing Notes
- **Opening Pace**: [Fast/Moderate/Slow]
- **Middle Pace**: [Build/Maintain/Vary]
- **Ending Pace**: [Accelerate/Pause/Shock]

---

### Key Lines/Moments
- **Must Include**: [Specific dialogue or action]
- **Memorable Moment**: [What readers remember]
- **Emotional Peak**: [Highest intensity point]

---

### Continuity Checklist
□ Character motivations consistent
□ Timeline accurate
□ Setting details match
□ Plot threads connected
□ Theme naturally integrated
□ Voice appropriate
□ Pacing balanced

---

### Research Needed
- [ ] [Fact to verify]
- [ ] [Detail to research]
- [ ] [Consistency check]

---

### Success Criteria
This chapter succeeds if:
1. [Reader feels X]
2. [Character progresses Y]
3. [Plot advances Z]
4. [Theme emerges naturally]
5. [Pages turn themselves]

---

### Notes for Execution
- [Special attention areas]
- [Potential challenges]
- [Creative opportunities]

---

*WRP Generated: [Date]*
*Ready for execution phase*