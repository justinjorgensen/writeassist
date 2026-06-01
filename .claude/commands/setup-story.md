# setup-story

Set up, maintain, and grow your story's canonical reference. This single command covers three jobs: initialize the story compendium, manage and update it as canon evolves, and add character profiles.

## Command Purpose
Create and curate the master `story-compendium.md` as the single source of truth for plot, timeline, world, and characters; keep it internally consistent; and generate detailed character profiles that slot into it cleanly.

## Modes

The command picks a mode from your phrasing (or the first argument):

- **init** (default on first run): scaffold a fresh `story-compendium.md` with all core sections.
- **manage**: audit and update an existing compendium, resolve contradictions, log amendments.
- **character**: generate a character profile and fold it into the compendium.

```bash
"Set up the story compendium for a [genre] novel"     # init
"Update the compendium: the mentor had a prior student" # manage
"Add major character: Sarah, the estranged sister"      # character
```

---

## Mode: init

### What Gets Created

#### Core Sections of `story-compendium.md`
1. **Project Metadata** - title, genre, target audience, word-count goals, tone and style
2. **Characters** - protagonist, antagonist, supporting cast, relationship map
3. **World Building** - settings and locations, rules and systems, culture, technology/magic level
4. **Plot Structure** - premise and logline, three-act breakdown, major plot points, subplots
5. **Timeline** - chronological events, character ages at key points, historical backdrop
6. **Themes & Symbols** - core themes, recurring symbols, motifs, message

### Interactive Setup
The command prompts for: book title, genre and subgenre, target audience, estimated length, number of POV characters, setting (time/place), and core conflict.

### Output Files
- `story-compendium.md` - master reference
- `01-Planning/initial-concept.md` - original vision
- `04-Project-Management/style-guide.md` - writing style rules

### Tips
- Be thorough but not rigid; this document evolves.
- Leave "Unknown" placeholders for elements you will develop later.
- Update after each writing session.

---

## Mode: manage

Maintain and protect the integrity of your story universe. The compendium is the hierarchical source of truth: `STORY_COMPENDIUM > all other sources`.

### Core Responsibilities
1. **Compendium integrity** - monitor new content for consistency with canon; flag and resolve contradictions before they propagate.
2. **Timeline vigilance** - verify every date and age progression; compute character ages at different story points; keep travel times and distances consistent.
3. **Character registry** - maintain complete profiles for every named character; track relationships; verify presence or absence during events.
4. **World consistency** - validate locations and distances; keep settings stable unless explicitly changed; track world rules.
5. **Proactive integration** - review new chapters before finalization; suggest compendium additions during active writing; keep a change log.

### Workflow
1. Check `story-compendium.md` for relevant existing information.
2. Flag any proposed content that contradicts established canon.
3. Suggest specific additions with exact references.
4. Calculate ripple effects of any proposed change.
5. Record the change in the amendment log.

### Examples
**Timeline verification**
Writer: "In Chapter 9 the protagonist mentions visiting the city in spring 2019."
Response: "Timeline error. Chapter 3 established they were abroad all of 2019. Suggested correction: spring 2020, which aligns with their return."

**Character age calculation**
Writer: "How old would Sarah be during the wedding scene?"
Response: "Sarah was born June 15, 1995 (Ch. 2). The wedding is September 2022 (Ch. 8), making her 27."

**New element integration**
Writer: "I want to add that the mentor had a previous student."
Response: "Compatible with canon. Add under 'Character Backstories' with timeline. Consider how it affects the mentor's approach with the current protagonist."

### Amendment Log Template
```markdown
## Story Compendium Amendment - [DATE]

### Change Summary
[What was added or modified]

### Affected Sections
- [Section name]: [Specific change]

### Ripple Effects
- [Other story elements affected]
- [Required consistency checks in other chapters]

### Authority
- Source: [Chapter/Scene that prompted change]
- Verified against: [Existing canon checked]
```

---

## Mode: character

Generate a comprehensive character profile and add it to the compendium. Depth scales with the character's importance.

### Character Types
- **Major (protagonist/antagonist)**: full psychological profile, complete backstory, mapped arc, voice and speech patterns, physical description, relationship web, internal/external conflicts, skills and limitations.
- **Supporting**: role, key relationships, relevant backstory, distinguishing features, speech patterns, story function.
- **Minor**: name and role, brief description, story function, key scenes.

```bash
"Add major character: [name], [role]"
"Add supporting character: [name]"
"Add minor character: [name]"
```

### Interactive Prompts (major characters)
Basic info (name, age, occupation), physical description, personality type, core motivation, greatest fear, character arc (start to end), key relationships, backstory highlights, speech patterns, skills.

### Arc Integration
Maps development across Act 1 (introduction state), Act 2 (challenges and growth), and Act 3 (transformation/resolution).

### Output Structure
```markdown
## [Character Name]

### Basic Information
- **Full Name**:
- **Age**:
- **Role**:
- **First Appears**: Chapter X

### Physical Description
[Detailed description]

### Personality Profile
- **Type**: [e.g., INTJ, Enneagram]
- **Core Traits**:
- **Quirks**:
- **Habits**:

### Character Arc
- **Starting Point**:
- **Catalyst**:
- **Journey**:
- **Ending Point**:

### Relationships
- **[Other Character]**: [Relationship type]

### Voice & Dialogue
- **Speech Patterns**:
- **Vocabulary Level**:
- **Catchphrases**:
- **Internal Voice**:

### Backstory
[Relevant history]

### Story Function
[Why this character exists]

### Key Scenes
- Chapter X: [Scene purpose]

### Development Notes
[Evolution tracking]
```

### Files Updated
- `story-compendium.md` - adds to the character section
- `01-Planning/character-profiles/[name].md` - detailed profile
- `01-Planning/character-arcs.md` - arc tracking
- `03-Resources/character-relationships.md` - relationship web

### Batch Operations
```bash
"Create character ensemble from outline"
# Generates all characters mentioned in the outline
```

---

## AI Agents Activated
- **story-architect** - structure and arc integration
- **world-builder** - setting creation
- **character-developer** - profile creation
- **dialogue-coach** - voice development
- **continuity-checker** - consistency validation
- **thematic-guide** - theme integration (init mode)

## Next Steps
After setup:
1. Add characters with this command's `character` mode for each major player.
2. Run `/outline-book` to structure chapters.
3. Run `/update-timeline` to refine chronology.

## Best Practices
1. Create the protagonist first; build the antagonist as a mirror or foil.
2. Every character needs a want.
3. Maintain distinct voices.
4. Date-stamp significant compendium additions and keep sections in logical order.
5. Never let momentary convenience override established canon.
