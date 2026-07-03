# CRITICAL: Parallel Agent Execution Guide

## ⚠️ MANDATORY READING FOR ALL AI ASSISTANTS

---

## The Problem We're Solving

Previously, we were SIMULATING parallel agents by having one Task pretend to be multiple agents. This is:
- **Slow** - Sequential execution
- **Opaque** - User can't see what's happening  
- **Inefficient** - Wastes context windows
- **Deceptive** - Claims parallelism but isn't

---

## The Correct Approach - TRUE Parallel Execution

### Claude Code's Actual Capability:
```python
# Claude Code can run MULTIPLE agents simultaneously
# Each gets its own context window
# All execute in parallel
# User sees them running
```

### How to Implement Parallel Reviews:

```python
# CORRECT - Real parallel execution
def review_chapter_properly(chapter):
    agents = []
    
    # Create 10 separate agent tasks
    agents.append(Task(
        subagent_type="general-purpose",
        description="Style Review",
        prompt=f"Review {chapter} for prose quality and em dashes..."
    ))
    
    agents.append(Task(
        subagent_type="general-purpose", 
        description="Pacing Review",
        prompt=f"Review {chapter} for pacing and momentum..."
    ))
    
    agents.append(Task(
        subagent_type="general-purpose",
        description="Character Review", 
        prompt=f"Review {chapter} for character consistency..."
    ))
    
    # ... add all 10 agents
    
    # Launch them ALL AT ONCE
    return run_parallel(agents)  # All 10 run simultaneously
```

### What the User Sees:
```
🤖 Running 10 agents...
├─ Style Review [████████░░] 80%
├─ Pacing Review [██████████] 100% ✓
├─ Character Review [███████░░░] 70%
├─ Dialogue Review [██████████] 100% ✓
└─ ... (all visible and running)
```

---

## Benefits We Get:

### 1. **10x Speed Improvement**
- All agents run at the same time
- Chapter review in 30 seconds, not 5 minutes

### 2. **Clean Context Windows**
- Each agent only loads what it needs
- No contamination between analyses
- More accurate results

### 3. **User Visibility**
- Users see exactly what's running
- Know which agent is processing
- Can track progress

### 4. **True Independence**
- Agents can't influence each other
- Pure scoring from each perspective
- More reliable results

### 5. **Proper Resource Usage**
- Claude Code is DESIGNED for this
- More efficient than sequential
- Better token management

---

## Rules for All WriteAssist Commands:

### 🚫 NEVER DO THIS:
```python
# WRONG - Fake parallelism
Task(
    subagent_type="general-purpose",
    prompt="Act as 10 different agents and review..."
)
```

### ✅ ALWAYS DO THIS:
```python
# RIGHT - Real parallelism
agents = [
    Task("Style Review", style_prompt),
    Task("Pacing Review", pacing_prompt),
    Task("Character Review", character_prompt),
    # ... etc
]
run_parallel(agents)
```

---

## Commands That MUST Use Parallel:

### review-chapter
- **Current:** 1 Task pretending to be 10 agents
- **Fixed:** 10 Tasks running in parallel
- **User sees:** All 10 agents running

### batch-review-and-fix
- **Current:** Sequential simulation
- **Fixed:** 10 parallel agents per chapter
- **User sees:** Progress for each chapter's agents

### workshop-ingestion (WRP review phase)
- **Current:** 1 Task reviewing all WRPs
- **Fixed:** 1 agent per WRP, all parallel
- **User sees:** Each WRP being reviewed

### execute-wrp (review phase)
- **Current:** Hidden review process
- **Fixed:** 10 visible parallel agents
- **User sees:** Complete review happening

---

## Implementation Checklist:

When implementing any multi-agent review:

- [ ] Create separate Task for each agent
- [ ] Give each agent focused prompt
- [ ] Launch all Tasks in single call
- [ ] Let Claude Code handle parallelism
- [ ] Aggregate results after completion
- [ ] Show user what's happening

---

## Example: Fixing review-chapter

### Before (WRONG):
```python
def review_chapter(chapter):
    return Task(
        description="Multi-Agent Review",
        prompt="Simulate 10 agents reviewing chapter"
    )
```

### After (RIGHT):
```python
def review_chapter(chapter):
    return [
        Task(description="Style", prompt="Review style..."),
        Task(description="Pacing", prompt="Review pacing..."),
        Task(description="Character", prompt="Review character..."),
        Task(description="Dialogue", prompt="Review dialogue..."),
        Task(description="Continuity", prompt="Review continuity..."),
        Task(description="Emotion", prompt="Review emotion..."),
        Task(description="Theme", prompt="Review theme..."),
        Task(description="Plot", prompt="Review plot..."),
        Task(description="Sensory", prompt="Review sensory..."),
        Task(description="Rules", prompt="Check rules...")
    ]
```

---

## Performance Guidelines:

### Parallel is FASTER for:
- 3+ agents: Always parallel
- 2 agents: Usually parallel
- 1 agent: Obviously sequential

### Parallel Limits:
- Claude Code handles 20+ agents fine
- User's system might limit to 10-15
- Start with 10 for reviews

### Memory Usage:
- Each agent: ~2-5MB context
- 10 agents: ~20-50MB total
- Well within limits

---

## User Communication:

### Tell users what's happening:
```markdown
"Deploying 10 specialist agents in parallel to review your chapter..."
"Each agent analyzes independently with fresh context..."
"You'll see all agents running simultaneously..."
```

### Show progress:
```markdown
Style Review: Complete ✓ (Score: 8.3)
Pacing Analysis: Complete ✓ (Score: 7.9)
Character Review: Running... [70%]
[etc...]
```

---

## CRITICAL REMINDER:

**Claude Code's Task tool with multiple agents is DESIGNED for parallel execution.**
**Not using it properly wastes its power and deceives users.**
**Every multi-agent operation should be VISIBLY parallel.**

---

## Migration Path:

1. **Immediate:** Update review-chapter to use parallel
2. **Next:** Fix batch operations
3. **Then:** Update all quality checks
4. **Finally:** Document in all commands

---

*This guide ensures WriteAssist uses Claude Code's true capabilities instead of simulating them.*