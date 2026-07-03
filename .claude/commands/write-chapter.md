---
description: Write a chapter directly without a WRP
argument-hint: "[chapter-number]"
---
# write-chapter

**Target:** $ARGUMENTS

**No-argument behavior:** If no argument is given: list outline chapters and stop.

Write a complete chapter based on the outline and parameters provided.

## Project Structure
- Planning documents: `01-Planning/`
- Manuscript location: `02-Manuscript/Book-[Number]/`
- Reference the outline: `01-Planning/outline.md`
- Follow style guide: `04-Project-Management/style-guide.md`
- Check story compendium: `story-compendium.md` - PRIMARY CANON SOURCE
- Verify with Story Compendium Manager agent before finalizing any dates, ages, or timeline references

## Writing Parameters

### Core Voice
- **POV**: [Define based on your story - first person, third limited, omniscient, etc.]
- **Tone**: [Define your tone - literary, commercial, genre-specific]
- **Language**: [Define language level and style]
- **Pacing**: [Define pacing preferences]

### Narrative Characteristics

**Voice Patterns**:
- [List specific voice characteristics]
- [Unique phrasings or patterns]
- [Dialogue style notes]
- [Internal monologue approach]

**Stylistic Elements**:
- [Metaphor preferences]
- [Description density]
- [Action vs introspection balance]
- [Sensory detail priorities]

## Chapter Structure Requirements

### Length
- **Target**: [Your target word count]
- **Acceptable range**: [Minimum-Maximum words]

### Essential Elements
1. **Opening Hook**: Engage reader immediately
2. **Scene Goals**: Clear objectives for POV character
3. **Conflict/Tension**: What opposes the goals?
4. **Character Development**: Show growth or reveal
5. **Plot Advancement**: Move story forward
6. **Thematic Resonance**: Connect to larger themes
7. **Closing Hook**: Propel reader to next chapter

### Chapter Components
```
Opening (10-15%)
- Establish setting/situation
- Hook reader
- Set chapter tone

Development (35-40%)
- Build tension
- Develop conflict
- Reveal information

Turning Point (10%)
- Shift or revelation
- Change direction
- Raise stakes

Escalation (30-35%)
- Intensify conflict
- Deepen consequences
- Build to climax

Resolution/Hook (10-15%)
- Resolve immediate conflict (or not)
- Set up next chapter
- Leave compelling question
```

## Style Examples

### Example Opening:
*[Provide an example opening that matches your desired style]*

### Example Character Voice:
*[Provide dialogue or internal monologue examples]*

### Example Description:
*[Provide a descriptive passage example]*

## Quality Standards

### Must Include
- Consistent POV
- Active voice (primarily)
- Sensory details
- Emotional depth
- Natural dialogue
- Scene transitions

### Must Avoid
- Info dumps
- Telling instead of showing
- Passive constructions (excessive)
- Repetitive phrases
- Inconsistent voice
- Plot contradictions

## Genre-Specific Requirements

### [Your Genre] Conventions
- [List genre expectations]
- [Required elements]
- [Pacing requirements]
- [Reader expectations]

## Workflow

1. **Review Phase**
   - Check outline for chapter goals
   - Review previous chapter ending
   - Consult story compendium for consistency
   - Note required plot points

2. **Writing Phase**
   - Follow WRP if available
   - Maintain voice consistency
   - Hit word count target
   - Include all required elements

3. **Verification Phase**
   - **CRITICAL**: Invoke Story Compendium Manager agent to:
     - Verify all facts against canon
     - Check timeline consistency
     - Maintain story compendium with any new information
   - Run continuity check
   - Verify voice consistency

4. **Polish Phase**
   - Strengthen opening/closing
   - Enhance sensory details
   - Tighten dialogue
   - Check transitions

## File Naming Convention
```
Chapter_[##]_[Title].md
Example: Chapter_01_The_Beginning.md
```

## Integration with Other Commands
- Use after `generate-wrp` for structured approach
- Follow with `curate-chapters` for quality check
- Update `writing-tracker.md` after completion
- Add new canon to `story-compendium.md`

## Success Metrics
- Advances plot ✓
- Develops character ✓
- Maintains voice ✓
- Engages reader ✓
- Meets word count ✓
- No continuity errors ✓