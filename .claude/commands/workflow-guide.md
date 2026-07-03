---
description: Display the WriteAssist workflow documentation
allowed-tools: Read
---
# Book Writing Command Workflow Guide

**No-argument behavior:** Takes no arguments.

## 📚 Overview

This guide explains how to use the AI commands to write your book efficiently from start to finish.

---

## 🛠️ Available Commands

### Planning Phase Commands

#### 1. `outline-book`
**Purpose**: Generate comprehensive book outline  
**When to Use**: At the very beginning of your project  
**Creates**:
- Chapter-by-chapter breakdown
- Plot structure
- Character arc planning
- Theme integration

**Usage**: `"Create book outline for [Your Book Title]"`

#### 2. `story-compendium-manager`
**Purpose**: Create and maintain your story compendium  
**When to Use**: After outline, before writing  
**Manages**:
- Character profiles
- Setting descriptions
- Timeline tracking
- Important details

**Usage**: `"Set up story compendium"` or `"Update story compendium with [details]"`

---

### Writing Phase Commands

#### 3. `generate-wrp`
**Purpose**: Create detailed chapter blueprint  
**When to Use**: Before writing each chapter  
**Creates**:
- Scene-by-scene breakdown
- Character goals and conflicts
- Dialogue purposes
- Pacing guidelines

**Usage**: `"Generate WRP for Chapter [X]"`

#### 4. `execute-wrp`
**Purpose**: Write chapter from WRP blueprint  
**When to Use**: After generating and reviewing WRP  
**Process**:
- Reads WRP requirements
- Writes complete chapter
- Maintains consistency
- Follows style guide

**Usage**: `"Execute WRP chapter-NN-wrp.md"`

#### 5. `write-chapter`
**Purpose**: Write chapter without WRP (direct method)  
**When to Use**: For simpler chapters or discovery writing  
**Process**:
- Uses outline as guide
- Maintains voice and style
- Creates complete chapter

**Usage**: `"Write Chapter [X]"`

---

### Quality Control Commands

#### 6. `review-chapter`
**Purpose**: Comprehensive quality analysis with the parallel critic panel  
**When to Use**: Automatically after each chapter via execute-wrp  
**Analyzes**:
- Prose quality and style
- Pacing and structure
- Character consistency
- Dialogue authenticity
- Continuity and logic
- Emotional engineering
- Theme integration
- Plot development
- Sensory immersion
- Rule compliance

**Assessment**: Four-tier rubric (Strong Pass, Pass, Needs Work, Fail)
**Gating**: Defined in `.claude/docs/review-engine.md` (panel 5/7 Pass+, weighted >= 7.0, critical-fail overrides, max 5 revision iterations)
**Usage**: `"Review Chapter [X]"` (usually automatic)

#### 7. `smart-review`
**Purpose**: Content-aware review using only relevant agents  
**When to Use**: For focused review of specific aspects  
**Benefits**:
- Runs only the critics relevant to the chapter's content
- Targeted feedback

**Usage**: `"Smart review Chapter [X]"`

#### 8. `validate-transitions`
**Purpose**: Ensure chapter-to-chapter continuity  
**When to Use**: After writing consecutive chapters  
**Checks**:
- Event acknowledgment
- Timeline consistency
- Character positions
- Environmental continuity
- Emotional progression

**Usage**: `"Validate transitions between Chapters [X] and [Y]"`

#### 9. `curate-chapters`
**Purpose**: Deep consistency and quality analysis  
**When to Use**:
- After each chapter
- After completing sections
- Before final revision

**Checks**:
- Character consistency
- Timeline accuracy
- Plot continuity
- Voice maintenance
- Theme integration

**Usage**: `"Curate chapters [X-Y]"`

#### 10. `dialogue-specialist`
**Purpose**: Review and improve dialogue  
**When to Use**: When dialogue needs work  
**Improves**:
- Character voice distinction
- Natural conversation flow
- Subtext and tension
- Age/education appropriateness

**Usage**: `"Review dialogue in Chapter [X]"`

---

### Organization Commands

#### 8. `book-cleanup`
**Purpose**: Organize files and archive old versions  
**When to Use**:
- Weekly maintenance
- After major revisions
- Before sharing project

**Actions**:
- Archives old drafts
- Organizes chapters
- Updates tracking
- Cleans redundant files

**Usage**: `"Clean up book project"`

---

## 🤖 Automated Quality Pipeline

### How It Works
When you use `execute-wrp`, an automated quality pipeline runs:

1. **Chapter Written** from WRP
2. **Automatic Review** via `review-chapter` (parallel critic panel, four-tier rubric)
3. **Gate Check**: per `.claude/docs/review-engine.md` (panel AND weighted gates, no critical fails)
4. **Auto-Revise**: If REVISE, `auto-revise-chapter` applies fixes using confidence ladder
5. **Re-Review**: Re-runs the same critic panel
6. **Loop**: Continues until the review-engine gates pass (max 5 iterations)
7. **Delivery**: Quality-gated chapter

### What This Means
- You write once, system polishes automatically using clear quality tiers
- Panel gate provides defensible quality standards (not arbitrary numbers)
- Critical fail detection prevents continuity breaks and rule violations
- Saves hours of editing time with transparent decision logic

---

## 📋 Recommended Workflows

### Starting a New Book

1. **Week 1: Foundation**
   ```
   Day 1-2: "Create book outline"
   Day 3-4: "Set up story compendium"
   Day 5-6: "Generate WRP for Chapter 1"
   Day 7: Review and refine
   ```

2. **Week 2+: Writing Rhythm**
   ```
   Monday: Generate WRP for next chapter
   Tue-Thu: Execute WRP (write chapter)
   Friday: Curate completed chapter
   ```

### Daily Writing Workflow

**Morning (15 min)**
1. Review writing tracker
2. Generate WRP if needed
3. Set daily goal

**Writing Session (2-4 hours)**
1. Execute WRP or write directly
2. Focus on progress, not perfection
3. Update word count

**Evening (10 min)**
1. Quick consistency check
2. Update story compendium if needed
3. Plan tomorrow

### Weekly Maintenance

**Monday**: Plan week's chapters
**Wednesday**: Curate recent writing
**Friday**: Clean up project, archive drafts
**Sunday**: Review progress, adjust plans

---

## 🎯 Command Combinations

### Fast Draft Mode
```
1. "Generate WRP for Chapter X"
2. "Execute WRP chapter-NN-wrp.md"
3. Move to next chapter immediately
4. Curate all at end of week
```

### Quality Mode
```
1. "Generate WRP for Chapter X"
2. Review and refine WRP
3. "Execute WRP chapter-NN-wrp.md"
4. "Curate Chapter X"
5. Address issues before moving on
```

### Discovery Mode
```
1. "Write Chapter X" (no WRP)
2. "Curate Chapter X"
3. "Update story compendium with new discoveries"
4. Adjust outline if needed
```

---

## 💡 Pro Tips

### Maximize Efficiency
- Batch similar tasks (all WRPs on Monday)
- Use keyboard shortcuts for common commands
- Keep story compendium open while writing
- Don't edit while drafting

### Maintain Quality
- Curate every 3-5 chapters minimum
- Update story compendium immediately
- Use dialogue specialist for important conversations
- Archive everything before major changes

### Stay Motivated
- Celebrate completed chapters
- Track progress visually
- Set realistic daily goals
- Use WRP to prevent blank page paralysis

---

## 🔄 Iterative Process

### First Draft
Focus on: Completion over perfection
Commands: `generate-wrp`, `execute-wrp`
Goal: Get story down

### Second Pass
Focus on: Consistency and continuity
Commands: `curate-chapters`, `dialogue-specialist`
Goal: Fix major issues

### Final Polish
Focus on: Voice and style
Commands: `curate-chapters` with style focus
Goal: Ready for readers

---

## 🆘 Troubleshooting

### "I don't know what to write"
→ Use `generate-wrp` for structure
→ Review outline and story compendium
→ Skip to exciting scene

### "Chapter doesn't feel right"
→ Run `curate-chapters` for analysis
→ Check character voices with `dialogue-specialist`
→ Verify against story compendium

### "Lost track of plot"
→ Review outline
→ Update story compendium
→ Run `book-cleanup` to organize

### "Overwhelmed by scope"
→ Focus on one chapter at a time
→ Use WRP for structure
→ Celebrate small wins

---

*Remember: The commands are tools to support your creativity, not replace it.*
*Use what helps, adapt what doesn't, and keep writing!*