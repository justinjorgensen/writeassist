---
description: Deep consistency analysis across a chapter range
argument-hint: "[range | all]"
allowed-tools: Read, Grep, Glob, Task
---
# Curate Chapters

**Target:** $ARGUMENTS

**No-argument behavior:** If no argument is given: default to all chapters in `02-Manuscript/`.

Comprehensive quality control and consistency check for book chapters using specialized agent expertise.

## Command Purpose
Deep analysis of completed chapters for consistency, quality, and market readiness using multiple specialized agents.

## Agent Integration

### Phase 1: Consistency Check
[continuity_checker | curate-chapters]
- First pass for factual consistency
- Tracks all details mentioned
- Identifies contradictions
- Flags plot holes
- Outputs: Error log, quick fixes

[timeline_keeper | curate-chapters]  
- Triggered by continuity issues
- Verifies all dates and durations
- Checks age progressions
- Validates chronology
- Outputs: Timeline verification report

### Phase 2: Quality Review
[style_editor | curate-chapters]
- Voice consistency check
- Prose rhythm analysis
- Style guide compliance
- Genre appropriateness
- Outputs: Style report, suggested revisions

[grammar_clarity | curate-chapters]
- Grammar and punctuation
- Sentence clarity
- Readability optimization
- Word choice precision
- Outputs: Grammar fixes, clarity improvements

[dialogue_coach | curate-chapters]
- Character voice distinction
- Natural speech patterns
- Subtext effectiveness
- Age-appropriate language
- Outputs: Dialogue revisions, voice notes

### Phase 3: Content Review
[sensitivity_reviewer | curate-chapters]
- Triggered by flags or request
- Cultural representation check
- Harmful stereotype scan
- Content warning identification
- Outputs: Sensitivity report, alternatives

[thematic_guide | curate-chapters]
- Theme emergence check
- Symbol consistency
- Meaning layer coherence
- Avoiding heavy-handedness
- Outputs: Theme tracking, subtlety suggestions

### Phase 4: Market Readiness
[reader_analyst | curate-chapters]
- Genre expectation compliance
- Engagement prediction
- Pacing for target audience
- Hook effectiveness
- Outputs: Reader engagement report

## Curation Checklist

### Consistency Elements
- [ ] All facts align with Story Compendium
- [ ] Character descriptions consistent
- [ ] Timeline makes logical sense
- [ ] Settings match established details
- [ ] Objects/props tracked properly
- [ ] Plot threads connected

### Quality Elements
- [ ] Voice remains consistent
- [ ] Dialogue sounds natural
- [ ] Pacing appropriate for genre
- [ ] Prose rhythm varies
- [ ] Grammar correct
- [ ] Clarity maintained

### Story Elements
- [ ] Characters act consistently
- [ ] Motivations clear
- [ ] Conflicts escalate properly
- [ ] Themes emerge naturally
- [ ] Emotional beats land
- [ ] Scenes serve purpose

### Market Elements
- [ ] Genre conventions met
- [ ] Target audience considered
- [ ] Hooks effective
- [ ] Chapter endings compel
- [ ] Length appropriate
- [ ] Content warnings noted

## Output Format

### Curation Report Structure
```markdown
# Chapter [X] Curation Report

## Agent Findings

### Continuity Issues (continuity_checker)
- Issue 1: [Description]
- Issue 2: [Description]

### Timeline Verification (timeline_keeper)
- All dates verified: [Yes/No]
- Issues found: [List]

### Style Consistency (style_editor)
- Voice maintained: [Yes/No]
- Style notes: [Findings]

### Grammar & Clarity (grammar_clarity)
- Grammar issues: [Count]
- Clarity improvements: [Count]

### Dialogue Review (dialogue_coach)
- Voices distinct: [Yes/No]
- Natural flow: [Yes/No]

### Sensitivity Check (sensitivity_reviewer)
- Flags raised: [List or None]
- Recommendations: [If any]

### Theme Tracking (thematic_guide)
- Themes present: [List]
- Effectiveness: [Assessment]

### Reader Engagement (reader_analyst)
- Predicted engagement: [High/Medium/Low]
- Genre compliance: [Yes/No]

## Priority Fixes
1. [Most important issue]
2. [Second priority]
3. [Third priority]

## Additional Considerations
- [Consideration 1]
- [Consideration 2]

## Overall Assessment
[Summary paragraph of chapter quality]
```

## Usage Examples

### Basic Curation
```
"Curate Chapter 5"
```

### Specific Focus
```
"Curate Chapter 5 focusing on dialogue"
"Curate Chapters 1-3 for timeline consistency"
```

### Triggered Reviews
```
"Curate Chapter 10 with sensitivity review"
"Curate full manuscript for market readiness"
```

## Agent Collaboration Flow

1. **continuity_checker** runs first, creates master list
2. **timeline_keeper** triggered for any date issues
3. **style_editor** and **grammar_clarity** run in parallel
4. **dialogue_coach** focuses on conversation scenes
5. **sensitivity_reviewer** activated by flags or request
6. **thematic_guide** tracks theme development
7. **reader_analyst** predicts audience response

## Integration with Workflow

### After Writing
- Run after completing each chapter
- Address priority fixes before moving on

### Before Submission  
- Full manuscript curation
- All agents activated
- Market readiness focus

### During Revision
- Target specific issues
- Use relevant agents only
- Track improvements

## Success Criteria

Chapter passes curation when:
- No continuity errors remain
- Timeline verified accurate
- Style consistently maintained
- Grammar and clarity optimized
- Dialogue authentic and distinct
- Themes naturally integrated
- Reader engagement predicted strong

---

*Curation uses specialized agents to ensure professional quality before readers see your work.*