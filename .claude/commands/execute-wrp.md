---
description: Write a chapter from its WRP with the automated review and revision pipeline
argument-hint: "[wrp-file-or-name]"
---
# Execute WRP (Write Chapter from Plan)

**No-argument behavior:** If no argument is given: list the WRPs in `05-wrp/` and stop.

**WRP File:** $ARGUMENTS

---

## START: File Operations

1. **Resolve and read the WRP file**: `$ARGUMENTS` may be a full path (use as-is if it exists) or a bare name (resolve against `05-wrp/`, adding `.md` if missing). If neither resolves, list the files in `05-wrp/` and stop.
2. **Extract from WRP**:
   - Chapter number and title
   - Word count target
   - Scene structure
   - Key elements to include
3. **Check writing-tracker.md**:
   - Update status to "In Progress"
   - Note start time
4. **Prepare output**: `02-Manuscript/[Book]/Chapter-XX-[Title].md`
   - If exists, create backup first

---

## Execution Process

### 1. **Pre-Writing Review**

#### Transition Context (CRITICAL)
- **Read LAST 300 words of previous chapter** - THIS IS YOUR STARTING POINT
- **Verify WRP transition requirements** - Check that WRP captured the ending state
- **If mismatch**: Update understanding with actual previous chapter ending
- **Plan opening**: Must acknowledge/continue from previous chapter's final state

#### Load Context
- **Read author-rules.md** - understand all constraints and mandates
- **Read WRP thoroughly** - understand all requirements (especially transition requirements)
- **Review previous chapters** - maintain continuity
- **Check story-compendium.md** - verify facts
- **Note style guide** - match established voice
- **Flag potential rule violations** - prepare to handle carefully

#### Mental Preparation
- Visualize opening scene
- Hear character voices
- Feel chapter rhythm
- Know ending target

---

### 2. **Opening Execution**

#### Transition Continuity Check
- Assess the transition type and respond appropriately:
  - **Direct continuation** (same POV, immediate): Pick up naturally from the action
  - **Time jump** (same POV, later): Brief acknowledgment ("The EMP had knocked out..." or just show consequences)
  - **POV switch** (different character/location): No immediate acknowledgment needed, but when returning to original POV, show aftermath
  - **Return to cliffhanger** (after POV switches): Subtle reminder if recent, natural continuation if immediate
- The key: Readers shouldn't be confused about cause-and-effect or timeline

#### First Line Strategy
- Hook immediately (while maintaining continuity)
- Establish POV
- Set tone
- Create questions

#### Opening Paragraphs
- Ground in setting
- Introduce conflict
- Establish stakes
- Voice clarity

---

### 3. **Scene Development**

### For Each Scene in WRP:

#### Scene Setup
- Transition smoothly from previous
- Establish location/time quickly
- Position characters clearly
- Set atmosphere

#### Dialogue Execution
- Natural conversation flow
- Character-specific voice
- Subtext and tension
- Information through conflict
- Avoid exposition dumps

#### Action Sequences
- Clear spatial awareness
- Varied sentence length
- Sensory details
- Emotional undertone
- Forward momentum

#### Description Balance
- Just enough setting
- Character observations
- Mood through details
- Show don't tell
- Leave room for imagination

---

### 4. **Chapter Flow Management**

#### Pacing Techniques
- **Accelerate**: Short sentences, active verbs, cut description
- **Slow Down**: Longer sentences, internal thought, sensory detail
- **Vary**: Mix paragraph lengths, alternate scene types

#### Transition Craft
- Scene breaks when needed
- Time jumps clearly marked
- POV shifts (if multiple)
- Smooth connections

---

### 5. **Character Development**

#### Voice Consistency
- Check against story-compendium.md
- Maintain speech patterns
- Age-appropriate language
- Education level reflected
- Emotional state influences

#### Growth Moments
- Show change through action
- Reveal through dialogue
- Internal realization
- Relationship evolution

---

### 6. **Theme Integration**

#### Subtle Weaving
- Through character choices
- In setting details
- Via dialogue subtext
- Through plot events
- Never preachy

---

### 7. **Ending Execution**

#### Chapter Conclusion Types
- **Cliffhanger**: Stop at peak tension
- **Resolution**: Complete scene arc
- **Revelation**: New information
- **Emotional**: Character moment
- **Question**: Plant mystery

#### Last Line Impact
- Memorable phrase
- Emotional punch
- Plot propulsion
- Theme echo

---

### 8. **Quality Checks**

#### During Writing
```
□ Following WRP structure
□ Maintaining voice consistency
□ Hitting emotional beats
□ Advancing plot appropriately
□ Natural dialogue flow
```

#### After Draft Completion
```
□ Word count within range
□ All WRP elements included
□ Character arcs progressed
□ Timeline accurate
□ Setting consistent
□ Theme present but subtle
```

#### Continuity Verification
```
□ Facts match STORY_COMPENDIUM
□ Character details consistent
□ Timeline logical
□ Setting details align
□ Plot threads connected
```

---

### 9. **Revision Pass**

#### First Pass - Structure
- Scene order optimal?
- Pacing appropriate?
- Transitions smooth?
- Beginning hooks?
- Ending satisfies?

#### Second Pass - Character
- Voices distinct?
- Actions motivated?
- Growth shown?
- Relationships clear?

#### Third Pass - Polish
- Vary sentence structure
- Remove filter words
- Strengthen verbs
- Cut redundancy
- Fix grammar

---

### 10. **Final Integration**

#### Update Tracking
- Mark chapter complete in writing-tracker.md
- Record actual word count
- Note completion time
- Add revision notes

#### Update Story Compendium
- New character details
- Setting descriptions
- Plot developments
- Timeline events

#### Archive Version
- Save draft version
- Note revision history
- Backup current state

---

## Output Format

```markdown
# Chapter [Number]: [Title]

[Opening line that hooks immediately]

[First scene following WRP structure...]

***

[Scene break if needed]

[Continue following WRP...]

---

**Word Count**: [Actual count]
**Status**: First Draft Complete
**Notes**: [Any important notes]
```

---

## Success Criteria

Chapter succeeds when:
- ✓ All WRP requirements met
- ✓ Reads naturally despite planning
- ✓ Characters feel authentic
- ✓ Plot advances meaningfully
- ✓ Reader wants next chapter
- ✓ Theme emerges organically
- ✓ Voice remains consistent

---

## Common Pitfalls to Avoid

### Don't:
- Force WRP elements unnaturally
- Info-dump background
- Break character voice
- Repeat previous chapters
- Rush through scenes
- Overwrite descriptions

### Do:
- Trust the WRP structure
- Let characters breathe
- Show through action
- Maintain momentum
- End strongly
- Edit later

---

## Automated Quality Pipeline

### Automatic Review & Fix Process (TRUE PARALLEL EXECUTION)

After draft completion, execute-wrp automatically triggers:

```markdown
## Quality Assurance Pipeline Initiated
═══════════════════════════════════════
Phase 1: Writing from WRP ✓ Complete

Phase 2: PARALLEL Review & Analysis → Starting...
🤖 Running the critic panel in parallel (see review-chapter)...
├─ Prose (style-editor)
├─ Pacing (pacing-master)
├─ Character (beta-reader-sim)
├─ Dialogue (dialogue-coach)
├─ Continuity (continuity-checker)
├─ Engagement (critic-sim)
└─ Rules (rule-enforcer)

NOTE: All critics run in PARALLEL with separate contexts
      Each critic focuses purely on their specialty

Phase 3: Auto-Fix if needed
Phase 4: Verification Loop
Target: review-engine gates pass. Gating is defined in `.claude/docs/review-engine.md` (panel 5/7 Pass+, weighted >= 7.0, critical-fail overrides, max 5 revision iterations).
```

### Execution Flow:

```python
1. WRITE chapter from WRP
2. AUTOMATICALLY run review-chapter
3. IF decision == "REVISE" (per review-engine.md gating):
      → run auto-revise-chapter
      → run review-chapter again
      → REPEAT until decision == "PASS" or iteration cap reached
4. DELIVER publication-ready chapter
```

### Iterative Improvement Loop

```markdown
## Iteration 1
- Initial Draft Complete
- Running review-chapter...
- Panel: 3/7 Pass+ (Prose: Needs Work, Dialogue: Fail, Pacing: Needs Work)
- Triggering auto-revise-chapter...
- Applied 156 fixes

## Iteration 2
- Running review-chapter...
- Panel: 5/7 Pass+, but Pacing still Needs Work and weighted gate short
- Triggering auto-revise for Pacing...
- Applied 23 fixes

## Iteration 3
- Running review-chapter...
- Panel and weighted gates pass, no critical fails
✓ REVIEW-ENGINE GATES PASS

## Final Report
Chapter: [Title]
Status: PUBLICATION READY
Iterations: 3
Total Fixes: 179
Decision: PASS (per .claude/docs/review-engine.md)
```

### Safety Mechanisms

```markdown
MAX_ITERATIONS = 5

IF iteration_count > MAX_ITERATIONS:
    FLAG for manual review
    PROVIDE detailed report on stubborn issues
    SUGGEST specific manual interventions
ELSE:
    CONTINUE automated improvement
```

### No User Interaction Required

The entire pipeline runs autonomously:
- ✓ Writes chapter from WRP
- ✓ Reviews with the parallel critic panel
- ✓ Applies fixes automatically
- ✓ Re-reviews after each fix cycle
- ✓ Iterates until the review-engine gates pass
- ✓ Delivers polished, publication-ready chapter

### Success Criteria

Chapter is complete when:
- ✓ The review-engine gates pass (see `.claude/docs/review-engine.md`)
- ✓ No critical fails remain
- ✓ Character voices consistent
- ✓ Pacing optimized
- ✓ Grammar and style polished
- ✓ Backup saved of each iteration

### Output Summary

```markdown
# Chapter Completion Report

## Executive Summary
✅ Chapter successfully completed and polished
📊 Final Decision: PASS (per .claude/docs/review-engine.md)
🔄 Iterations Required: X
📝 Word Count: X,XXX

## Quality Metrics
| Dimension | Initial Tier | Final Tier |
|-----------|--------------|------------|
| Prose | Needs Work | Pass |
| Pacing | Needs Work | Pass |
| Dialogue | Fail | Pass |
| Character | Pass | Strong Pass |
| [etc...] | ... | ... |

## Automated Improvements
- Grammar fixes: XX
- Style improvements: XX
- Pacing adjustments: XX
- Dialogue enhancements: XX
- Total changes: XXX

## Ready For
✓ Beta readers
✓ Professional editing
✓ Publishing submission

## Backup Versions
- Draft v1: Chapter-XX-draft.md
- Post-fix v1: Chapter-XX-iteration-1.md
- Post-fix v2: Chapter-XX-iteration-2.md
- Final: Chapter-XX-final.md
```

---

*Execute-wrp now includes full automated quality assurance - from WRP to publication-ready in one command*