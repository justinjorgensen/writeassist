---
description: Content-aware review running only the relevant critics (Continuity and Rules always run)
argument-hint: "[chapter-file]"
allowed-tools: Read, Grep, Glob, Task, Write
---
# Smart Review Command

**Target:** $ARGUMENTS

**No-argument behavior:** If no argument is given: list chapters in `02-Manuscript/` and stop. (Write access is only for saving the report to `.claude/state/reviews/`.)

You implement an optimized chapter review that uses content analysis to select only the most relevant critics, reducing processing time and token usage while preserving critical fail detection (Continuity and Rules ALWAYS run).

## Command Flow

1. **Analyze Chapter Content**
   - Use the content-analyzer agent to examine the chapter
   - Get metrics and critic recommendations
   - Determine optimal critic set

2. **Preserve Critical Critics**
   - **ALWAYS RUN:** Continuity (continuity-checker) and Rules (rule-enforcer), the two critical-fail dimensions
   - Content analysis can only suggest OTHER critics to prune

3. **Filter Context for Each Critic**
   - Apply critic-specific context filtering
   - Maintain semantic integrity

4. **Execute Selected Critics**
   - Run critics in parallel with the four-tier rubric
   - Process filtered content instead of full chapter
   - Collect tier assessments and fixes

5. **Aggregate with the Pruned Panel Gate**
   - Gating with a pruned panel is defined in `.claude/docs/review-engine.md` (see "Panel gate with pruning"); critical-fail overrides still apply
   - Generate the review report

## Critic Roster (named read-only agents only)

Critics are spawned as NAMED agents from `.claude/agents/`, never as generic agents. All hold only `Read, Grep, Glob` and carry the shared Output Contract. Creator agents (character-developer, world-builder, etc.) are NEVER used as reviewers.

| Dimension | subagent_type | Selection |
|-----------|---------------|-----------|
| Continuity | `continuity-checker` | ALWAYS |
| Rules | `rule-enforcer` | ALWAYS |
| Prose | `style-editor` | if selected |
| Pacing | `pacing-master` | if selected |
| Character | `beta-reader-sim` (character/arc lens) | if selected |
| Dialogue | `dialogue-coach` | if selected |
| Engagement | `critic-sim` | if selected |
| Grammar | `grammar-clarity` | if selected |
| Sensitivity | `sensitivity-reviewer` | if selected |

World-building and lore consistency concerns are covered by `continuity-checker`; reader-experience concerns by `beta-reader-sim`.

## Implementation Steps

**Important**: This command requires true parallel execution. Invoke multiple Task critics in a single response, not one simulating multiple perspectives.

### Step 1: Content Analysis

When user runs `/smart-review [chapter_file]`:

1. First, read the chapter file to get the full content
2. Use the content-analyzer to analyze the chapter
3. Parse the analysis report to get critic selections
4. **FORCE INCLUDE:** Continuity (continuity-checker), Rules (rule-enforcer); these are never pruned

### Step 2: Pruned Panel Gate

The pass threshold for a reduced critic set is defined in `.claude/docs/review-engine.md` ("Panel gate with pruning"). Run a minimum of 5 critics (Continuity + Rules + 3 selected).

### Step 3: Context Filtering

For each selected critic, prepare filtered context:

**dialogue-coach** (if selected):
- Extract all dialogue lines and attributions
- Include 50 words before/after each dialogue block

**continuity-checker** (always included):
- Extract character names, locations, times, facts
- Format as structured data, not prose

**beta-reader-sim** (if selected):
- Extract only scenes mentioning target characters
- Include character dialogue and descriptions

**pacing-master** (if selected):
- Extract chapter opening (200 words) and closing (200 words)
- Include all action sequences and transitions

**style-editor** (if selected):
- Extract narrative prose sections
- Exclude dialogue unless stylistically relevant

**sensitivity-reviewer** (if selected):
- Extract romantic, violent, or culturally sensitive content
- Include full context for these scenes

**rule-enforcer** (always included):
- Scan for rule violations only
- Extract violations with 20-word context

**grammar-clarity** (if selected):
- Extract sample sentences for review
- Focus on complex or potentially problematic sentences

**critic-sim** (if selected):
- Provide the full chapter opening and closing plus scene summaries
- Focus on engagement, stakes, and reader pull-through

### Step 4: Parallel Execution

Execute selected critics simultaneously by invoking multiple Task tools in a single response, using each critic's named subagent_type from the roster table, providing each with:
- Their filtered context (not full chapter)
- The specific analysis focus
- The instruction to follow their Output Contract (shared JSON schema)

### Step 5: Results Aggregation

Combine critic verdicts per `.claude/docs/review-engine.md`:
- Apply the pruned panel gate and critical-fail overrides
- Critical issues from any critic are always included
- Generate unified recommendations

## Output Format

```markdown
# Smart Review Report: [Chapter Name]

## Content Analysis
- **Type**: [Dialogue-heavy/Action-packed/Character-focused/World-building]
- **Critics Run**: [list] ([X] of the core panel)
- **Critics Skipped**: [list with reasons]

## Critic Verdicts (four-tier rubric)
- Continuity: [tier]
- Rules: [tier]
- [Dimension]: [tier]
- ...

## Decision
[PASS / REVISE] per the pruned panel gate and critical-fail overrides in `.claude/docs/review-engine.md`

## Key Findings

### Strengths
[Aggregated from critic feedback]

### Areas for Improvement
[Prioritized by severity]

### Critical Issues
[Any critical fails flagged]

## Critic-Specific Feedback

[Include the JSON verdict and fixes from each critic that ran]
```

Write the final report to `.claude/state/reviews/` (same contract as review-chapter).

## Fallback Behavior

If content analysis fails or produces unexpected results:
1. Log the error for debugging
2. Fall back to standard review-chapter command
3. Notify user that optimization was skipped

## User Options

- `--all`: Force all critics to run (bypass optimization)
- `--verbose`: Show detailed analysis metrics
- `--quick`: Use only Continuity + Rules + Prose for the fastest check
- `--focus=[aspect]`: Emphasize specific aspect (dialogue, action, etc.)
