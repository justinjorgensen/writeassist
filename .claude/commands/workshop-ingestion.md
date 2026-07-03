---
description: Import a workshop transcript into project documents
argument-hint: "[transcript-file]"
---
# Workshop Ingestion (Transcript to Project Pipeline)

**No-argument behavior:** If no argument is given: list transcript candidates in `03-Resources/` and stop.

**Input Transcript:** $ARGUMENTS

---

## Purpose
Transform raw workshop transcripts into fully-configured WriteAssist projects with all core files populated, WRPs generated, and ready for chapter execution. Processes structured questionnaire responses into actionable project components.

---

## Workshop Structure Expected

### Questionnaire Coverage
1. **Premise & Themes** - Core idea, genre, primary themes
2. **Characters & Relationships** - Cast, wants/wounds, relationship dynamics
3. **Setting & World Rules** - Time/place, laws of nature, power limits
4. **Plot Framework** - Inciting incident through climax, reader's final emotion
5. **Style & Boundaries** - POV, tense, tone, restrictions, chapter requirements
6. **Continuity & Naming** - Time systems, naming conventions
7. **Glossary & Canon** - Unique terms, recurring symbols
8. **Open Questions** - Undecided elements for later
9. **Metadata & Goals** - Publishing intent, market position, inspirations
10. **Quality Gates** - WRP acceptance criteria, success metrics

---

## Ingestion Pipeline

### Phase 1: Transcript Analysis
```markdown
## Reading Workshop Transcript
File: workshop-transcript-2024-03-15.txt
Word Count: 12,847
Sections Detected:
✓ Premise & Themes
✓ Characters (5 main, 8 supporting)
✓ Setting & World Rules
✓ Plot Framework
✓ Style & Boundaries
✓ Continuity & Naming
✓ Glossary (23 terms)
✓ Open Questions (7 items)
```

### Phase 2: Data Extraction
```markdown
## Extracting Story Elements

PREMISE:
"A neuroscientist discovers her memories aren't her own..."

GENRE: Psychological Thriller / Sci-Fi

THEMES:
- Identity and authenticity
- Memory as currency
- Corporate surveillance

PROTAGONIST:
- Name: Dr. Sarah Chen
- Want: To recover her true memories
- Wound: Betrayal by mentor
- Arc: Skeptic to revolutionary

RELATIONSHIP DYNAMICS:
- Sarah & Marcus: Mentor/betrayer, father figure turned enemy
- Sarah & Jake: Reluctant allies to trusted partners
- Sarah & Anna: Sisters questioning if bond is real
- Sarah & David: Complicated love built on false memories

READER'S FINAL EMOTION:
"Unsettled but hopeful - questioning their own reality"

PUBLISHING GOALS:
- Traditional publishing, psychological thriller market
- Positioned as "Black Mirror meets Bourne Identity"
- Series potential but standalone complete

INSPIRATIONS:
- Books: Philip K. Dick, Blake Crouch's "Recursion"
- Films: Eternal Sunshine, Inception, Total Recall
- Tone: Christopher Nolan meets Charlie Brooker

[Continue extraction for all sections...]
```

### Phase 3: File Population

#### A. Update author-rules.md
```markdown
## Processing Style & Boundaries

Adding to HARD CONSTRAINTS:
✓ NO head-hopping (workshop confirmed)
✓ NO deus ex machina (explicitly banned)
✓ NO dream sequences as reveals
✓ NO memory recovery through hypnosis
✓ NO evil corporation monologues

Adding to MANDATES:
✓ MAINTAIN first-person past tense
✓ USE unreliable narrator techniques
✓ GROUND each scene in sensory memory
✓ DISTINGUISH false vs true memories visually
✓ EVERY chapter must have minimum 3 scenes
✓ EVERY chapter ends with momentum/question
✓ CHECK: POV consistency, word count (3,800-4,200), conflict present

Adding to STYLE DECISIONS:
✓ Tone: Paranoid, questioning reality
✓ Description: Clinical precision with emotional undertow
✓ Dialogue: Professional but with subtext
```

#### B. Update story-compendium.md
```markdown
## Populating Story Canon

PROJECT: Memory Thief
GENRE: Psychological Thriller / Sci-Fi
PREMISE: [Full premise from transcript]

CHARACTERS:
[Complete character profiles with all details]

SETTING:
- Location: Neo-Boston, 2045
- Key Locations: Memory Corp HQ, Underground Labs
- Technology Level: Memory extraction/implantation common
- Social Structure: Memory-based economy

PLOT STRUCTURE:
- Inciting Incident: Sarah finds evidence of tampering
- Point of No Return: Confronts her mentor
- Midpoint: Discovers she IS the experiment
- Darkest Moment: All memories questioned
- Climax: Choice between truth and safety
- Resolution: [From transcript]

WORLD RULES:
- Memories can be extracted but degrade
- False memories leave trace signatures
- Memory theft is capital crime
- Neural implants universal by age 16

GLOSSARY:
- Mnemonic Drift: Memory degradation over time
- Trace Pattern: Signature of implanted memory
[All terms from transcript]

OPEN QUESTIONS:
1. Sarah's original identity?
2. The mentor's true motivation?
[All questions logged]

---
LOG ENTRY: [Date] - Ingested workshop-transcript-2024-03-15.txt
```

#### C. Update project-config.md
```markdown
## Project Configuration

PROJECT: Memory Thief
GENRE: Psychological Thriller / Sci-Fi
TONE: Paranoid, clinical, questioning reality

KEY DIRECTIVES:
- Maintain unreliable narrator throughout
- Every memory scene needs doubt element
- Technical accuracy for neuroscience
- No info-dumps about memory technology
- Subtext in all dialogue

QUALITY GATES:
- All chapters: gating is defined in `.claude/docs/review-engine.md` (panel 5/7 Pass+, weighted >= 7.0, critical-fail overrides, max 5 revision iterations)
- WRP must include: 3+ scenes, clear conflict, emotional arc
- Auto-reject if: POV break, em dash found, <3,500 words

MARKET POSITIONING:
- Comp titles: Dark Matter, Recursion, The Silent Patient
- Target: Readers of smart psychological thrillers
- Publishing: Aim for Big 5, thriller imprint

STYLE NOTES:
- First-person past tense ONLY
- Clinical language with emotional undertones
- Short, sharp sentences in panic moments
- Longer, questioning passages in memory scenes
```

---

### Phase 4: Outline Generation
```markdown
## Auto-Generating Chapter Outline from Plot Framework

Based on plot structure, creating 01-Planning/outline.md:

ACT 1 (25%)
Chapter 1: The Anomaly - Sarah notices first discrepancy
Chapter 2: Denial - Attempts to rationalize
Chapter 3: Evidence - Undeniable proof emerges
Chapter 4: Confrontation - Faces mentor
Chapter 5: The Truth - Learns of experiment

ACT 2A (25%)
Chapter 6: Going Underground - Joins resistance
[Continue based on plot points...]

Total Chapters: 20
Word Count Target: 80,000
```

---

### Phase 5: WRP Generation
```markdown
## Batch Generating WRPs

Creating WRPs for all 20 chapters based on:
- Plot framework from transcript
- Character profiles and arcs
- World rules and limitations
- Style mandates

Generating Chapter 1 WRP...
- Title: "The Anomaly"
- POV: Sarah Chen
- Word Target: 4,000
- Opening: Sarah in lab, memory glitch
- Scenes: 3 (Lab discovery, Home doubt, Database search)
- Ending: Finds first evidence
✓ Complete

[Continue for all chapters...]

Output: 20 WRP files in 05-wrp/
```

---

### Phase 6: Multi-Agent WRP Review
```markdown
## Deploying Review Agents on Generated WRPs

story-architect reviewing structure...
✓ Plot progression logical
✓ Pacing curve appropriate
⚠ Chapter 7 needs stronger midpoint

character-developer reviewing arcs...
✓ Sarah's progression tracked
✓ Mentor's presence balanced
⚠ Supporting character Jane needs more setup

continuity-checker reviewing timeline...
✓ Timeline consistent
✓ Technology rules maintained
⚠ Memory extraction timing unclear in Ch 12

world-builder reviewing settings...
✓ Neo-Boston consistently portrayed
✓ Technology limitations respected
⚠ Lab layout needs mapping

pacing-master reviewing flow...
✓ Act breaks properly placed
⚠ Act 2B might drag, consider combining Ch 15-16

thematic-guide reviewing depth...
✓ Identity theme woven throughout
✓ Memory-as-currency explored
⚠ Surveillance theme needs more presence

rule-enforcer reviewing compliance...
✓ NO head-hopping detected
✓ NO deus ex machina found
✓ First-person past maintained
✓ NO EM DASHES (zero tolerance maintained!)

OVERALL WRP SCORE: 8.7/10
Ready for execution with minor adjustments
```

---

### Phase 7: Final Report & Recommendations
```markdown
# Workshop Ingestion Complete

## Project Configuration Summary
✓ Project: Memory Thief
✓ Genre: Psychological Thriller / Sci-Fi
✓ Chapters Planned: 20
✓ Word Count Target: 80,000
✓ POV: First-person past (Sarah Chen)

## Files Updated
✓ author-rules.md - 12 new constraints, 8 mandates added
✓ story-compendium.md - Fully populated with canon
✓ project-config.md - Project-specific configuration
✓ 01-Planning/outline.md - 20-chapter structure created

## WRPs Generated
✓ 20 chapter WRPs created in 05-wrp/
✓ Multi-agent review score: 8.7/10
✓ Minor adjustments recommended for 3 chapters
✓ All WRPs meet acceptance criteria
✓ Relationship dynamics mapped across chapters
✓ Final reader emotion targeting confirmed

## Next Steps - User Decision Required

### Option 1: Execute Single Chapter Test
"Execute Chapter 1 WRP as test"
- Validates voice and tone
- Confirms style rules working
- Tests pacing

### Option 2: Revise Flagged WRPs
"Revise Chapters 7, 12, 15-16 based on agent feedback"
- Strengthen midpoint
- Clarify timing
- Improve pacing

### Option 3: Full Batch Execution
"Execute all 20 chapters with auto-quality pipeline"
- Complete first draft in ~2 hours
- All chapters pass the review-engine gates
- Zero em dashes guaranteed

### Option 4: Progressive Execution
"Execute Act 1 (Chapters 1-5) first"
- Establish voice firmly
- Allow for course correction
- Build momentum

## Quality Metrics
- Setup Completeness: 100%
- Canon Consistency: 100%
- WRP Quality: 8.7/10
- Ready for Execution: YES

## Workshop Data Preserved
Original transcript backed up to:
03-Resources/workshop-transcripts/workshop-2024-03-15-original.txt

---
AWAITING USER DECISION
```

---

## Advanced Features

### Intelligent Parsing
- Handles various transcript formats
- Identifies speakers (facilitator vs participant)
- Extracts decisions from discussions
- Resolves contradictions with timestamps

### Validation Loops
```markdown
If contradiction detected:
"At 00:15:23 you said first-person"
"At 00:47:12 you said third-person"
Flagging for clarification...
```

### Canon Conflict Resolution
```markdown
If world rule conflicts:
"Memory extraction takes 2 hours" (00:23:45)
"Quick extraction in climax" (01:15:30)
Suggested resolution: Emergency extraction possible but damaging
```

### Theme Weighting
Based on frequency of mention:
- Primary theme: Identity (mentioned 17 times)
- Secondary: Memory-as-currency (mentioned 11 times)
- Tertiary: Surveillance (mentioned 6 times)

---

## Integration Commands

### Complete Workshop to Book Pipeline
```bash
"Ingest workshop and create full book"
```
1. Ingests transcript
2. Populates all files
3. Generates outline
4. Creates all WRPs
5. Reviews WRPs
6. Executes all chapters
7. Delivers manuscript with all chapters passing the review gates

### Workshop to Beta Pipeline
```bash
"Ingest workshop and prepare for beta readers"
```
1. Ingests transcript
2. Generates first 3 chapters
3. Creates style guide
4. Prepares feedback forms

---

## Error Handling

### Missing Sections
```markdown
WARNING: No antagonist defined in transcript
Options:
1. Proceed without (not recommended)
2. Generate placeholder for later
3. Abort and request information
```

### Ambiguous Responses
```markdown
CLARIFICATION NEEDED:
Q: "What POV?"
A: "Whatever feels right"

Suggested: First-person limited (based on thriller genre)
Confirm? [Y/N]
```

---

## Success Metrics

Workshop ingestion succeeds when:
- ✓ All questionnaire sections processed
- ✓ Core files populated completely
- ✓ No contradictions remain
- ✓ WRPs generated successfully
- ✓ Critic panel review passed (per review-engine.md)
- ✓ Project ready for execution

---

*Workshop ingestion: From recorded conversation to ready-to-write project in minutes.*