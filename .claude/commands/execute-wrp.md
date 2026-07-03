---
description: Write a chapter from its WRP with the automated review and revision pipeline
argument-hint: "[wrp-file-or-name]"
---
# Execute WRP (Write Chapter from Plan)

**No-argument behavior:** If no argument is given: list the WRPs in `05-wrp/` and stop.

**WRP File:** $ARGUMENTS

---

## START: File Operations

1. **Read WRP file**: `05-wrp/$ARGUMENTS`
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

## Automated Quality Pipeline (Four-Tier Panel)

After the draft is complete, `/execute-wrp` automatically fires the four-tier review panel. There is no numeric score threshold and no fixed iteration target: the chapter is done when the panel returns PASS.

### Phase 1: Write
Write the chapter from the WRP (sections 1 through 10 above).

### Phase 2: Auto-fire the panel
Run `/review-chapter` on the new chapter. This launches the **seven named gating critics in parallel**, each in its own clean context:
`continuity-checker`, `rule-enforcer`, `voice-consistency`, `pacing-master`, `dialogue-coach`, `character-critic`, `engagement-critic`. Applicable advisory critics also run unless pruned (see `/review-chapter`).

The panel aggregates through the dual gate:
- **Panel gate:** at least 5 of 7 gating critics return Pass or Strong Pass.
- **Weighted gate:** the weighted score is at least 7.0.
- **Critical-fail overrides:** any Continuity Fail, or a high-confidence Rules or Voice Fail, forces Revise regardless of the gates.

### Phase 3: Revise if needed
If the panel returns REVISE, run `/auto-revise-chapter` (no confirmation prompt in this pipeline). It applies confidence-ladder fixes in an isolated git worktree, commits the pass, and re-runs the panel. Repeat while the panel returns REVISE.

```python
# Pipeline control flow
write_chapter_from_wrp()
decision = run_review_panel()          # /review-chapter, seven named critics
while decision == "REVISE":
    auto_revise_in_worktree()          # /auto-revise-chapter, confidence ladder
    decision = run_review_panel()
deliver_chapter()                      # decision == "PASS"
```

If revision passes stop making progress (the same critics keep returning the same tiers), escalate to manual review rather than looping indefinitely.

### No user interaction required
In pipeline mode the steps run autonomously: write, fire the panel, auto-revise in a worktree, re-fire the panel, deliver on PASS.

### Output Summary

```markdown
# Chapter Completion Report

## Result
- Chapter: [Number - Title]
- Word Count: [actual]
- Final Decision: PASS
- Panel Gate: [pass_count]/7 Pass or better
- Weighted Gate: [weighted_score]/10.0
- Revision passes: [count] (each a separate worktree commit)

## Gating Critic Tiers
- Continuity & Logic: [tier]
- Rules Compliance: [tier]
- Voice & Prose: [tier]
- Characters & Arc: [tier]
- Pacing & Flow: [tier]
- Dialogue & Subtext: [tier]
- Engagement & Impact: [tier]

## Notes
- [Any remaining [AR-XXX] markers the author should review]
```

Scores and tiers are qualitative model judgments used as a stopping heuristic, not ground truth.

---

*Execute-wrp writes a chapter from a WRP, then auto-fires the four-tier review panel. See `.claude/docs/review-engine.md` for the full gating specification.*