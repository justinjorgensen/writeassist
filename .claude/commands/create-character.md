# create-character

Generate a comprehensive character profile and add them to your story compendium.

## Command Purpose
Create detailed character profiles with consistency across all story elements. Handles both major and minor characters with appropriate depth.

## Character Types

### Major Character (Protagonist/Antagonist)
- Full psychological profile
- Complete backstory
- Character arc mapped
- Voice and speech patterns
- Physical description
- Relationships web
- Internal/external conflicts
- Skills and limitations

### Supporting Character
- Role in story
- Key relationships
- Relevant backstory
- Distinguishing features
- Speech patterns
- Character function

### Minor Character
- Name and role
- Brief description
- Story function
- Key scenes

## Usage

```bash
"Create major character: [name], [role]"
"Create supporting character: [name]"
"Create minor character: [name]"
```

## Interactive Prompts

### For Major Characters:
1. Basic Info (name, age, occupation)
2. Physical Description
3. Personality Type
4. Core Motivation
5. Greatest Fear
6. Character Arc (start → end)
7. Key Relationships
8. Backstory Highlights
9. Speech Patterns/Voice
10. Skills/Talents

## Character Arc Integration

Automatically maps character development across:
- **Act 1**: Character introduction state
- **Act 2**: Challenges and growth
- **Act 3**: Transformation/resolution

## AI Agents Activated

- **character-developer** - Profile creation
- **dialogue-coach** - Voice development
- **continuity-checker** - Consistency validation
- **story-architect** - Arc integration

## Output Structure

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

## Files Updated

- `story-compendium.md` - Adds to character section
- `01-Planning/character-profiles/[name].md` - Detailed profile
- `01-Planning/character-arcs.md` - Arc tracking
- `03-Resources/character-relationships.md` - Relationship web

## Batch Operations

```bash
"Create character ensemble from outline"
# Generates all characters mentioned in outline
```

## Best Practices

1. Create protagonist first
2. Build antagonist as mirror/foil
3. Supporting cast should challenge/assist protagonist
4. Every character needs a want
5. Track character changes per chapter
6. Maintain distinct voices
7. Update after major story events