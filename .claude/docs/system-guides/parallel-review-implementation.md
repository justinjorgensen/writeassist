# Review Chapter - TRUE Parallel Multi-Agent Analysis

**Target Chapter:** $ARGUMENTS

---

## Purpose
Deploy 10 ACTUAL parallel agents with separate context windows to comprehensively analyze chapters. Each agent runs independently and simultaneously for maximum speed and accuracy.

---

## CORRECT Implementation - Real Parallel Execution

### How to Run Parallel Agents Properly:

```python
# THIS IS THE RIGHT WAY - All agents run simultaneously
agents_to_run = [
    Task(subagent_type="general-purpose", 
         description="Style Review", 
         prompt="Review Chapter X for prose quality, voice consistency, em dash violations..."),
    
    Task(subagent_type="general-purpose", 
         description="Pacing Analysis", 
         prompt="Review Chapter X for pacing, scene tempo, momentum..."),
    
    Task(subagent_type="general-purpose", 
         description="Character Review", 
         prompt="Review Chapter X for character consistency, voice, development..."),
    
    Task(subagent_type="general-purpose", 
         description="Dialogue Analysis", 
         prompt="Review Chapter X dialogue for naturalness, voice distinction..."),
    
    Task(subagent_type="general-purpose", 
         description="Continuity Check", 
         prompt="Review Chapter X for timeline, facts, consistency..."),
    
    Task(subagent_type="general-purpose", 
         description="Emotion Engineering", 
         prompt="Review Chapter X emotional beats, reader engagement..."),
    
    Task(subagent_type="general-purpose", 
         description="Theme Analysis", 
         prompt="Review Chapter X theme integration, subtlety..."),
    
    Task(subagent_type="general-purpose", 
         description="Plot Development", 
         prompt="Review Chapter X plot advancement, foreshadowing..."),
    
    Task(subagent_type="general-purpose", 
         description="Sensory Immersion", 
         prompt="Review Chapter X sensory details, setting, atmosphere..."),
    
    Task(subagent_type="general-purpose", 
         description="Rules Enforcement", 
         prompt="Review Chapter X for author-rules.md compliance, ZERO em dashes...")
]

# Launch all 10 agents AT THE SAME TIME
# Each gets its own context window
# All run in parallel
# You see "Running 10 agents..." in the UI
```

---

## What You'll See in Claude Code:

```
🤖 Running 10 agents...
├─ Style Review
├─ Pacing Analysis  
├─ Character Review
├─ Dialogue Analysis
├─ Continuity Check
├─ Emotion Engineering
├─ Theme Analysis
├─ Plot Development
├─ Sensory Immersion
└─ Rules Enforcement

[All executing simultaneously with progress indicators]
```

---

## Benefits of TRUE Parallel Execution:

### 1. **Real Speed Improvement**
- 10 agents running simultaneously = 10x faster
- Not sequential simulation
- True parallel processing

### 2. **Separate Context Windows**
- Each agent gets fresh context
- No pollution between analyses
- Focused, clean evaluation

### 3. **Visible Progress**
- See all agents running
- Know which is processing
- Transparent operation

### 4. **Independent Scoring**
- No influence between agents
- Pure assessment from each
- More accurate scoring

### 5. **Better Resource Usage**
- Claude Code handles parallel execution
- Optimized token usage
- Efficient processing

---

## Detailed Agent Prompts for Parallel Execution:

### Agent 1: Style & Prose Review
```
Task(
    subagent_type="general-purpose",
    description="Style and Prose Analysis",
    prompt="""
    Review [Chapter X] for prose quality:
    
    1. CRITICAL: Check for ANY em dashes (—). Even ONE is a violation.
    2. Evaluate prose rhythm and flow
    3. Check voice consistency with established style
    4. Identify filter words (felt, saw, heard)
    5. Find passive voice in action scenes
    6. Assess sentence variety
    7. Check paragraph structure
    
    Score 1-10 with detailed breakdown.
    List ALL issues with line numbers.
    Provide specific fix suggestions.
    """
)
```

### Agent 2: Pacing Master
```
Task(
    subagent_type="general-purpose",
    description="Pacing and Momentum Analysis",
    prompt="""
    Review [Chapter X] for pacing:
    
    1. Evaluate scene-by-scene tempo
    2. Check opening hook effectiveness
    3. Assess middle momentum
    4. Verify ending propulsion
    5. Identify any drag points
    6. Check action/reflection balance
    
    Score 1-10 with pacing curve analysis.
    Identify specific slow sections.
    Suggest tempo adjustments.
    """
)
```

[Continue with all 10 agents...]

---

## Aggregating Results:

After all agents complete IN PARALLEL:

```python
# Collect all results
results = await all_agents_complete()

# Aggregate scores
overall_score = weighted_average(results)

# Identify consensus issues
consensus = find_issues_flagged_by_multiple_agents(results)

# Generate fix queue
fix_queue = prioritize_all_issues(results)
```

---

## The WRONG Way (What Not To Do):

```python
# DON'T DO THIS - Single task pretending to be multiple agents
Task(
    subagent_type="general-purpose",
    description="Multi-Agent Review",
    prompt="Pretend to be 10 agents and review everything..."
)
# This is sequential, slow, and opaque
```

---

## Implementation in Commands:

### For review-chapter:
- Launch 10 parallel Tasks
- Each focuses on one aspect
- All run simultaneously
- Aggregate results after

### For batch-review-and-revise:
- For EACH chapter, launch 10 parallel agents
- Can process multiple chapters in sequence
- Each chapter gets full parallel review

### For execute-wrp:
- Write chapter first
- Then launch 10 parallel review agents
- Then run auto-fix based on results
- Loop until 8.0+

---

## Memory and Performance:

### Parallel Execution Limits:
- Claude Code can handle 10+ agents easily
- Each gets separate memory allocation
- No context pollution
- Better than sequential for 3+ agents

### When to Use Parallel:
- Always for review-chapter (10 agents)
- Always for quality checks
- Any time you need multiple perspectives
- When speed matters

### When Sequential Might Be OK:
- Single focused task
- Dependencies between steps
- Very small operations

---

## Updated Review Process:

1. **User runs:** `"Review Chapter 7"`

2. **System launches:** 10 parallel Task agents

3. **User sees:** All 10 agents running simultaneously

4. **Agents complete:** Each returns independent analysis

5. **System aggregates:** Combines scores and issues

6. **Auto-fix triggers:** If any score <8.0

7. **Result:** Complete analysis in 1/10th the time

---

## Critical Rule for All Commands:

**NEVER simulate parallel agents in a single Task**
**ALWAYS use multiple Task calls for true parallelism**
**USERS should see agents running**
**Each agent gets clean context**

---

*This is how review-chapter SHOULD work - with real parallel execution visible to users*