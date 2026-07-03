---
description: Write a chapter directly without a WRP
argument-hint: "[chapter-number]"
---
# write-chapter

**Target:** $ARGUMENTS

**No-argument behavior:** If no argument is given: list outline chapters and stop.

Write a complete chapter based on the outline and the project's configured voice. This is the direct path (no WRP); for the blueprint-driven path use `generate-wrp` then `execute-wrp`.

## Project Structure
- Planning documents: `01-Planning/`
- Manuscript location: `02-Manuscript/Chapter-NN-Title.md` (flat, per `.claude/docs/artifact-contract.md`)
- Reference the outline: `01-Planning/outline.md`
- Follow style guide: `04-Project-Management/style-guide.md`
- Check story compendium: `story-compendium.md` - PRIMARY CANON SOURCE
- Verify against story-compendium.md (use the /story-compendium-manager command) before finalizing any dates, ages, or timeline references

## Writing Parameters

Do NOT invent voice or style. Load them, in this order, before writing a word:

1. **author-rules.md** - hard constraints, soft constraints, mandates (MANDATORY first read)
2. **project-config.md** - POV, tone, language level, pacing, genre, themes, dialogue style
3. **04-Project-Management/style-guide.md** - voice patterns, phrasing, description density
4. **story-compendium.md** - characters, timeline, world facts for this chapter

If project-config.md or the style guide is still an unfilled template, STOP and tell the author to fill it in (or run `/initialize-story-compendium`) before writing chapters.

## Chapter Structure Requirements

### Length
Use the word-count target from project-config.md; if unset, ask the author once and suggest recording it there.

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
Opening (10-15%)      - establish setting, hook, tone
Development (35-40%)  - build tension, develop conflict, reveal
Turning Point (10%)   - shift, revelation, raised stakes
Escalation (30-35%)   - intensify toward climax
Resolution/Hook (10-15%) - resolve or withhold, set up next chapter
```

## Quality Standards

### Must Include
- Consistent POV
- Active voice (primarily)
- Sensory details
- Emotional depth
- Natural dialogue
- Scene transitions

### Must Avoid
- Em dashes (ZERO TOLERANCE; the hook will block them)
- Info dumps
- Telling instead of showing
- Excessive passive constructions
- Repetitive phrases
- Inconsistent voice
- Plot contradictions

## Workflow

1. **Review Phase**
   - Check outline for chapter goals
   - Review previous chapter ending (last 300 words = your starting point)
   - Consult story compendium for consistency
   - Note required plot points

2. **Writing Phase**
   - Maintain voice consistency per the loaded config
   - Hit word count target
   - Include all required elements

3. **Verification Phase**
   - **CRITICAL**: Run the /story-compendium-manager command to verify facts, check timeline consistency, and record new canon
   - Run `review-chapter` (the same quality pipeline execute-wrp uses; gating per `.claude/docs/review-engine.md`)

4. **Polish Phase**
   - Apply review fixes via `auto-revise-chapter`
   - Commit the chapter to git (versioning is git; no backup files)

## File Naming Convention
```
02-Manuscript/Chapter-NN-Title.md
Example: 02-Manuscript/Chapter-01-The-Beginning.md
```

## Integration with Other Commands
- Prefer `generate-wrp` + `execute-wrp` for the structured approach
- Follow with `review-chapter` (or `curate-chapters` across many chapters)
- Update `04-Project-Management/writing-tracker.md` after completion
- Add new canon to `story-compendium.md`

## Success Metrics
- Advances plot
- Develops character
- Maintains voice
- Engages reader
- Meets word count
- No continuity errors
- Passes the review-engine gates
