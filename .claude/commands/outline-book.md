---
description: Generate a comprehensive book outline, gated by plan mode
argument-hint: "[premise (optional)]"
---
# outline-book

**Target:** $ARGUMENTS

**No-argument behavior:** If no argument is given: build the outline from project-config.md and the author interview.

Generate a comprehensive outline for your book project.

## Plan-Mode Gate

Before writing **any** outline file to disk, this command MUST enter plan mode so the author can approve the structure first. The outline is a load-bearing artifact and getting it wrong cascades into every chapter.

Flow:
1. Read `project-config.md`, `author-rules.md`, `story-compendium.md`.
2. **Enter plan mode** with a draft of: overall structure → chapter list → key beats per chapter → character-arc allocation.
3. Wait for `ExitPlanMode` approval.
4. Only then write to `01-Planning/outline.md` and the supporting files.

Skip the gate ONLY when the user explicitly passes `--no-plan` as the first argument.

---

## Command Purpose
Create a detailed outline that serves as the roadmap for your entire book, breaking down:
- Overall structure (books/parts if applicable)
- Chapter-by-chapter progression
- Scene-level planning
- Character arc integration
- Theme development
- Pacing management

## Essential Planning Documents

After outlining, these documents should be created/maintained:
- Full outline: `01-Planning/outline.md`
- Character arcs: `01-Planning/character-arcs.md`
- Timeline: `01-Planning/timeline.md`
- Themes: `01-Planning/themes.md`
- Master reference: `story-compendium.md` (keep current with any new elements)

## AI Agent Activation

This command activates specialized agents in sequence:

1. **story-architect** (leads)
   - Designs overall structure
   - Plans chapter progression
   - Manages pacing
   
2. **world-builder**
   - Establishes settings
   - Creates consistent world rules
   
3. **character-developer**
   - Maps character journeys
   - Plans relationship dynamics
   
4. **thematic-guide**
   - Weaves themes throughout
   - Ensures meaningful resonance

## Book Structure Options

### Single Volume
- 70,000-120,000 words typical
- 15-30 chapters
- Clear three-act structure

### Multi-Book Series
- Plan overall series arc
- Individual book arcs within
- Leave threads for sequels
- Maintain series momentum

### Structure Templates

#### Three-Act Structure
**Act I (25%)**
- Setup and world introduction
- Character establishment
- Inciting incident
- First plot point

**Act II (50%)**
- Rising action
- Midpoint reversal
- Complications multiply
- Second plot point

**Act III (25%)**
- Climax preparation
- Final confrontation
- Resolution
- Denouement

#### Hero's Journey
1. Ordinary World
2. Call to Adventure
3. Refusal of Call
4. Meeting the Mentor
5. Crossing Threshold
6. Tests, Allies, Enemies
7. Approach to Cave
8. Ordeal
9. Reward
10. Road Back
11. Resurrection
12. Return with Elixir

#### Save the Cat Structure
1. Opening Image
2. Setup
3. Theme Stated
4. Catalyst
5. Debate
6. Break into Two
7. B Story
8. Fun and Games
9. Midpoint
10. Bad Guys Close In
11. All Is Lost
12. Dark Night of Soul
13. Break into Three
14. Finale
15. Final Image

## Chapter Planning Framework

### For Each Chapter Define:
- **Purpose**: What must this chapter accomplish?
- **POV**: Whose perspective? 
- **Location**: Where does it take place?
- **Timeline**: When in the story?
- **Conflict**: What tension drives it?
- **Resolution**: What changes?
- **Hook**: What pulls reader forward?

### Scene-Level Breakdown:
- Scene goal
- Conflict source
- Emotional trajectory
- Plot advancement
- Character revelation

## Pacing Considerations

### Rhythm Variety:
- Action scenes
- Quiet moments
- Revelation beats
- Emotional processing
- World building
- Relationship development

### Tension Management:
- Rising overall trajectory
- Strategic releases
- False victories
- Unexpected reversals
- Escalating stakes

## Integration Points

### Character Arcs:
- Map each character's journey
- Identify transformation points
- Plan relationship evolutions
- Track emotional development

### Theme Weaving:
- Identify core themes
- Plan thematic moments
- Layer symbolic elements
- Build toward thematic climax

### World Building:
- Introduce world gradually
- Avoid info dumps
- Use action to reveal
- Make setting active

## Output Format

The outline should include:

```markdown
# Book Outline: [Title]

## Overview
- Genre: 
- Target Word Count:
- Target Audience:
- Core Premise:
- Central Theme:

## Structure
[Three-act, Hero's Journey, etc.]

## Part One: [Title]
### Chapter 1: [Title]
**Word Target**: [X,XXX]
**POV**: [Character]
**Timeline**: [Date/Time]
**Location**: [Setting]

**Purpose**:
- Plot: [What happens]
- Character: [What develops]
- Theme: [What resonates]

**Scenes**:
1. [Scene description]
   - Goal:
   - Conflict:
   - Resolution:
2. [Scene description]
   - Goal:
   - Conflict:
   - Resolution:

**Opening Hook**: [First line/paragraph concept]
**Closing Hook**: [Chapter ending]

[Repeat for all chapters]
```

## Quality Checklist

Before finalizing outline:
- [ ] Clear story progression
- [ ] Logical cause and effect
- [ ] Character arcs complete
- [ ] Themes naturally integrated
- [ ] Pacing variety
- [ ] Stakes escalation
- [ ] Satisfying conclusion
- [ ] Series potential (if applicable)

## Common Pitfalls to Avoid

- Starting story too early
- Sagging middle syndrome
- Rushed endings
- Passive protagonists
- Unearned victories
- Disconnected subplots
- Theme preaching
- Convenience plotting

## Next Steps

After outline completion:
1. Review with all agents
2. Create character profiles
3. Develop timeline
4. Begin chapter writing
5. Generate WRPs as needed

## Remember

The outline is a living document. As you write:
- Adjust as discoveries emerge
- Track changes in story compendium
- Maintain consistency
- Trust creative evolution