---
description: Write an individual scene
argument-hint: "[scene-description]"
---
# write-scene

**Target:** $ARGUMENTS

**No-argument behavior:** If no argument is given: ask which chapter and scene to write.

Quickly write or revise individual scenes without requiring a full WRP structure.

## Command Purpose
Flexible scene writing for when inspiration strikes, quick revisions, or experimental writing. Perfect for non-linear writers or fixing specific scenes.

## Usage

```bash
"Write scene: [description]"
"Write dialogue between [character] and [character]"
"Write action scene: [description]"
"Write flashback: [memory/event]"
"Revise scene in Chapter 5 starting at line 234"
```

## Scene Types

### Quick Scenes
- **Dialogue Exchange**: Fast character conversations
- **Action Beat**: Quick action sequence
- **Description Block**: Setting/atmosphere
- **Internal Monologue**: Character thoughts
- **Transition**: Bridge between scenes

### Full Scenes
- **Complete Scene**: Beginning, middle, end
- **Chapter Opening**: Hook scenes
- **Chapter Ending**: Cliffhanger/resolution
- **Flashback**: Memory sequences
- **Dream Sequence**: Subconscious scenes

## Writing Modes

### Discovery Mode
```bash
"Free-write scene about [topic]"
```
- No outline required
- Explore character voice
- Find story direction
- Experiment with tone

### Targeted Mode
```bash
"Write missing scene between chapters 4 and 5"
```
- Fill specific gaps
- Address editor notes
- Add requested content
- Fix pacing issues

### Revision Mode
```bash
"Revise restaurant scene for more tension"
```
- Enhance existing scenes
- Change tone/mood
- Add/remove elements
- Adjust pacing

## AI Agent Support

### Optional Agents
- **dialogue-coach** - For conversations
- **pacing-master** - For action scenes
- **voice-consistency** - For tone consistency
- **sensitivity-reviewer** - For difficult content

### Minimal Mode
```bash
"Write raw scene: [description]"
```
- No agent intervention
- Pure creative flow
- Edit later approach

## Output Options

### Inline Addition
- Adds directly to chapter file
- Marks with [SCENE ADDED]
- Updates word count

### Standalone File
- Creates `scenes/[descriptor].md`
- Can be integrated later
- Useful for experiments

### Alternative Versions
- Creates `Chapter-X-alt-scene.md`
- Compare different approaches
- A/B testing scenes

## Scene Library

### Save Scenes for Reuse
```bash
"Save scene as template: first meeting"
```

### Common Scene Templates
- First meeting
- Confession/revelation
- Chase sequence
- Quiet moment
- Argument/conflict
- Discovery/realization
- Death/loss
- Victory/celebration

## Integration Workflow

### Step 1: Write Scene
```bash
"Write scene: Sarah discovers the truth"
```

### Step 2: Review Fit
```bash
"Check scene consistency with Chapter 7"
```

### Step 3: Integrate
```bash
"Insert scene into Chapter 7 after line 445"
```

### Step 4: Update Tracking
```bash
"Update story compendium with new scene"
```

## Batch Operations

```bash
"Generate all missing dialogue scenes"
"Write all action sequences for Act 2"
"Create alternative endings (3 versions)"
```

## Scene Analysis

After writing, automatically provides:
- Word count
- Dialogue percentage
- Pacing score
- Tension level
- Character appearances
- Consistency warnings

## Best Practices

### Do:
- Write when inspired
- Experiment freely
- Save multiple versions
- Mark scenes as draft/final
- Update continuity after

### Don't:
- Worry about perfection
- Force WRP structure
- Skip consistency check
- Forget to integrate
- Lose track of versions

## Quick Templates

### Dialogue Scene
```markdown
[Location, Time]

"[Opening line]" [Character] said.

[Action beat]

"[Response]" [Character] replied.

[Continue...]
```

### Action Scene
```markdown
[Setup the stakes]

[Character] [action verb] [specific detail].

[Escalation]

[Resolution/cliffhanger]
```

### Description Scene
```markdown
[Wide shot - setting]

[Medium shot - details]

[Close up - specific focus]

[Sensory details]

[Mood/atmosphere]
```