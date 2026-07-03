# Smart Review Command

You implement an optimized chapter review that uses content analysis to select only the most relevant critics, reducing processing time and token usage by 40-60% while preserving critical fail detection (Continuity and Rules ALWAYS run).

## Command Flow

1. **Analyze Chapter Content**
   - Use the content-analyzer agent to examine the chapter
   - Get metrics and critic recommendations
   - Determine optimal critic set

2. **Preserve Critical Critics**
   - **ALWAYS RUN:** Continuity & Logic (critical fail override)
   - **ALWAYS RUN:** Rules Compliance (critical fail override)
   - Content analysis can only suggest OTHER critics to prune

3. **Filter Context for Each Critic**
   - Apply critic-specific context filtering
   - Reduce token usage by 50-80%
   - Maintain semantic integrity

4. **Execute Selected Critics**
   - Run critics in parallel with four-tier rubric
   - Process filtered content instead of full chapter
   - Collect tier assessments and fixes

5. **Aggregate with Adjusted Panel Gate**
   - If 7 critics run: need 5 Pass or Better
   - If 5 critics run: need 4 Pass or Better (80%)
   - Critical fail overrides still apply
   - Generate comprehensive review report with performance metrics

## Implementation Steps

**Important**: This command requires true parallel execution. Invoke multiple Task critics in a single response, not one simulating multiple perspectives.

### Step 1: Content Analysis

When user runs `/smart-review [chapter_file]`:

1. First, read the chapter file to get the full content
2. Use the content-analyzer to analyze the chapter
3. Parse the analysis report to get critic selections
4. **FORCE INCLUDE:** Continuity & Logic, Rules Compliance (never pruned)

### Step 2: Adjusted Panel Gate

Calculate threshold based on critics running:

```python
critics_run = len(selected_critics)  # Will be 5-7 (Continuity+Rules always included)

if critics_run == 7:
    pass_threshold = 5  # Standard panel gate
elif critics_run == 6:
    pass_threshold = 5  # Still need 5 (83%)
elif critics_run == 5:
    pass_threshold = 4  # Need 4 (80%)
else:
    # Minimum 5 critics (must include Continuity + Rules + 3 others)
    pass_threshold = 4
```

### Step 3: Context Filtering

For each selected critic, prepare filtered context:

**dialogue_coach** (if selected):
- Extract all dialogue lines and attributions
- Include 50 words before/after each dialogue block
- Approximate reduction: 75%

**continuity_checker** (always included):
- Extract character names, locations, times, facts
- Format as structured data, not prose
- Approximate reduction: 85%

**character_developer** (if selected):
- Extract only scenes mentioning target characters
- Include character dialogue and descriptions
- Approximate reduction: 70%

**pacing_master** (if selected):
- Extract chapter opening (200 words) and closing (200 words)
- Include all action sequences and transitions
- Approximate reduction: 60%

**world_builder** (if selected):
- Extract location descriptions and world details
- Include sensory descriptions
- Approximate reduction: 80%

**style_editor** (always included):
- Extract narrative prose sections
- Exclude dialogue unless stylistically relevant
- Approximate reduction: 40%

**sensitivity_reviewer** (if selected):
- Extract romantic, violent, or culturally sensitive content
- Include full context for these scenes
- Approximate reduction: 85%

**rules_enforcer** (always included):
- Scan for rule violations only
- Extract violations with 20-word context
- Approximate reduction: 95%

**grammar_clarity** (if selected):
- Extract sample sentences for review
- Focus on complex or potentially problematic sentences
- Approximate reduction: 90%

### Step 3: Parallel Execution

Execute selected agents simultaneously by invoking multiple Task tools in a single response, providing each with:
- Their filtered context (not full chapter)
- The specific analysis focus
- Their assigned weight value

### Step 4: Results Aggregation

Combine agent feedback considering weights:
- Higher weight agents have more influence on final score
- Critical issues from any agent are always included
- Generate unified recommendations

## Output Format

```markdown
# Smart Review Report: [Chapter Name]

## Content Analysis
- **Type**: [Dialogue-heavy/Action-packed/Character-focused/World-building]
- **Agents Used**: [X] of 16 (Standard review uses 10)
- **Processing Time**: [XX] seconds (vs [XX] standard)
- **Token Usage**: ~[XXXX] (vs ~[XXXXX] standard)
- **Efficiency Gain**: [XX]% faster, [XX]% fewer tokens

## Review Scores (Weighted)
- Overall Quality: [X.X]/10
- Dialogue Quality: [X.X]/10 (weight: [X.X])
- Pacing: [X.X]/10 (weight: [X.X])
- Character Development: [X.X]/10 (weight: [X.X])
- World Building: [X.X]/10 (weight: [X.X])
- Style: [X.X]/10 (weight: [X.X])
- Continuity: [X.X]/10 (weight: [X.X])

## Key Findings

### Strengths
[Aggregated from agent feedback]

### Areas for Improvement
[Prioritized by weight and severity]

### Critical Issues
[Any major problems flagged]

## Agent-Specific Feedback

[Include detailed feedback from each agent that ran]

## Performance Metrics
- Agents Run: [List of agents with weights]
- Agents Skipped: [List with reasons]
- Context Reduction: [XX]% average
- Time Saved: [XX] seconds
- Tokens Saved: ~[XXXX]
```

## Fallback Behavior

If content analysis fails or produces unexpected results:
1. Log the error for debugging
2. Fall back to standard review-chapter command
3. Notify user that optimization was skipped

## User Options

- `--all`: Force all agents to run (bypass optimization)
- `--verbose`: Show detailed analysis metrics
- `--quick`: Use only core agents for fastest review
- `--focus=[aspect]`: Emphasize specific aspect (dialogue, action, etc.)

## Expected Performance

Based on content type:
- **Dialogue-heavy chapters**: 4-5 agents, 60% token reduction
- **Action chapters**: 5-6 agents, 50% token reduction  
- **Character development**: 4-5 agents, 55% token reduction
- **World-building**: 5-6 agents, 45% token reduction
- **Mixed content**: 6-7 agents, 40% token reduction

Average improvement: 50% faster, 60% fewer tokens