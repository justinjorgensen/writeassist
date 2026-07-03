---
description: Maintain the story timeline
argument-hint: "[event or chapter (optional)]"
---
# update-timeline

**Target:** $ARGUMENTS

**No-argument behavior:** If no argument is given: re-derive the timeline from the manuscript and report drift.

Manage and maintain your story's chronological timeline with automatic consistency checking.

## Command Purpose
Keep your timeline accurate and consistent throughout your book. Automatically updates character ages, checks for impossibilities, and maintains chronological logic.

## Timeline Components

### Event Types
- **Story Events**: What happens in the narrative
- **Backstory Events**: Historical/background events
- **Future Events**: Planned/prophesied events
- **Parallel Events**: Simultaneous occurrences

## Usage

```bash
"Update timeline: [event] on [date/time]"
"Add backstory event: [event] [time before story]"
"Check timeline consistency"
"Generate timeline from chapters"
```

## Timeline Formats

### Relative Timeline
- Day 1, Day 2, etc.
- Hours from inciting incident
- Chapters as time markers

### Absolute Timeline
- Specific dates
- Historical periods
- Character ages

### Hybrid Timeline
- Mix of specific and relative
- Seasonal markers
- Event-based markers

## Automatic Calculations

The system automatically:
- Updates all character ages
- Calculates travel times
- Checks pregnancy/growth timelines
- Validates seasonal descriptions
- Ensures cause-effect logic
- Flags impossibilities

## AI Agents Activated

- **timeline-keeper** (PRIMARY) - Chronology management
- **continuity-checker** - Logic validation
- **story-architect** - Pacing analysis

## Output Format

```markdown
# Story Timeline

## Pre-Story Events
- **[Date/Time]**: [Event] - [Impact on story]

## Main Story Timeline

### Act 1
- **Day 1 / [Date]**: 
  - Morning: [Event]
  - Afternoon: [Event]
  - Evening: [Event]
  - Character Ages: [Name: X years]

### Act 2
[Continued structure]

## Parallel Timelines
- **Character A**: [Their timeline]
- **Character B**: [Their timeline]

## Duration Summary
- Total story span: X days/months/years
- Reading time estimate: X hours
```

## Consistency Checks

### Automatic Validations
- Character age progression
- Pregnancy/child development
- Travel time between locations
- Seasonal consistency
- Day/night cycle accuracy
- Technology availability (historical)
- Cause before effect

### Warning Types
- 🔴 **Impossibility**: Cannot happen
- 🟡 **Unlikely**: Needs explanation
- 🟢 **Verified**: Logically consistent

## Integration Features

### Chapter Integration
```bash
"Extract timeline from Chapter 5"
# Pulls all time references from chapter
```

### Batch Operations
```bash
"Verify timeline for all chapters"
"Shift entire timeline by 3 months"
```

## Files Modified

- `01-Planning/timeline.md` - Master timeline
- `story-compendium.md` - Timeline section
- `01-Planning/timeline-验证.md` - Validation report
- Each chapter file - Time marker comments

## Advanced Features

### Timeline Visualization
- Generate visual timeline chart
- Show parallel character journeys
- Mark crucial intersection points

### What-If Scenarios
```bash
"What if [event] happened 3 days earlier?"
# Shows cascade effects
```

### Time Zone Management
- For global stories
- Automatic conversion
- Simultaneous event tracking

## Best Practices

1. Update after each chapter
2. Use specific times when possible
3. Track moon phases for night scenes
4. Note seasonal changes
5. Mark birthday/anniversaries
6. Consider travel logistics
7. Account for healing/recovery time
8. Track news/information spread speed

## Common Issues Detected

- Character in two places at once
- Impossible travel times
- Season/weather mismatches
- Age inconsistencies
- Event order problems
- Cause after effect
- Technology anachronisms