---
name: voice-audit
description: Quality-check an existing voice profile (narrative voice or a per-character voice profile) before using it to generate prose. Reach for this skill when the author asks "is my voice profile good enough?", before a long drafting batch, after editing a character or narrator voice doc, periodically to confirm a profile still holds up, or whenever generated prose feels generic and you suspect the underlying profile is thin. This is a periodic confidence check, NOT a line-edit of the manuscript.
---

# Voice Audit

A prompt-driven audit. It grades an existing voice profile against what a STRONG profile looks like, then reports which sections are strong, thin, or missing, with concrete recommendations to fix the weak ones.

This skill does not write prose and does not change the profile. It produces a report the author can act on. Run it periodically, or before any batch that will lean hard on the profile.

## When to use

- The author asks whether a voice profile is "good enough" to generate from.
- Before `/batch-execute-wrp` or any long drafting run that will reuse a profile many times.
- Right after a profile was created or edited.
- Generated prose feels generic, samey, or off-voice and you suspect the profile, not the prompt.

It handles two profile kinds:
1. **Narrative voice profile** is the narrator/prose voice for the whole manuscript. Usually lives in `project-config.md` (the "Voice & Tone" / "Prose Preferences" sections) or a dedicated voice guide.
2. **Per-character voice profile** is one character's speech and interiority. Usually lives in a character doc under `03-Resources/` or `04-Project-Management/`, in the "Voice & Dialogue" section, or inline in `story-compendium.md`.

## First: read the inputs

Before auditing, read in this order:
1. `author-rules.md`. Hard/soft constraints. Em dashes are banned. Note any rule the profile must respect (banned words, register limits).
2. The profile being audited (the file/section the author named, or all voice sections if they did not name one).
3. One or two real prose samples that the profile is supposed to describe (e.g. `example/Chapter-01.md`, or the latest drafted chapter). A profile is only "strong" if it is grounded in how the prose actually reads. If no prose exists yet, say so and grade the profile on its own terms, flagged as unverified.

## What a STRONG profile looks like

Grade against this. A strong profile is a portrait an actor could perform from, not a rule checklist a machine could lint. It covers four dimensions, and every claim is grounded in a concrete example or quoted line.

### 1. Register and persona
- A specific, opinionated description of WHO is speaking/narrating and HOW they relate to the reader (intimate, wry, guarded, formal, confiding).
- Emotional default and range: where the voice sits at rest and how far it swings.
- Strong: "Aldous narrates at one remove, patient and unsentimental; grief never gets named, it leaks through objects and routine."
- Thin: "Third person, serious tone." (a label, not a persona)

### 2. Rhythm and syntax
- Sentence-length behavior with EXAMPLES, not just "varied." Where does it run long, where does it snap short?
- Paragraph cadence, use of fragments, comma-splicing, repetition/anaphora.
- Strong: "Long accreting sentences that pile clause on clause ('and the channel had taken the traffic, and the traffic had never come back'), then one short line to land the turn."
- Thin: "Mixed sentence lengths."

### 3. Signature moves
- The 2 to 5 recognizable habits that make THIS voice itself: a recurring image, a way of handling interiority, a structural tic (open on action, close on a held image), a tonal move (understatement, deflection through habit).
- Each move should name where it shows up.
- Strong: "Closes scenes on a physical object that carries the unspoken feeling (the empty second cup, the banked lamp)."
- Thin: nothing here at all, or generic craft advice ("show don't tell").

### 4. Vocabulary and diction
- Word-level texture: education level, era, register, domain-specific words it reaches for, words/constructions it never uses.
- For characters: catchphrases, verbal tics, contraction habits, what they say when stressed vs calm.
- Strong: "Plain Anglo-Saxon diction, weather and stone and oil; abstractions only when earned; never modern slang."
- Thin: "Normal vocabulary."

### A strong profile also:
- Is **evidence-grounded**: claims point to quotable lines, not adjectives.
- Is **discriminating**: tells this voice apart from a neighboring one (this narrator vs a generic literary narrator; this character vs another character).
- Respects `author-rules.md` (does not, for example, prescribe em dashes or banned words).
- Covers **interiority/internal voice**, not just spoken dialogue (for characters) or surface style (for narration).

## How to run the audit

For each of the four dimensions (Register/persona, Rhythm/syntax, Signature moves, Vocabulary/diction), rate the profile:

- **STRONG**. Specific, evidence-grounded, would let a writer reproduce the voice. Cite the line in the profile that earns it.
- **THIN**. Present but generic, labels instead of portrait, or no grounding example. Say exactly what is missing.
- **MISSING**. The dimension is absent.

Then cross-check the profile against the prose sample(s): does the profile actually describe how the prose reads? Flag any claim the prose contradicts (profile says "clipped and terse," prose runs long and lyrical), and any strong prose habit the profile fails to mention.

## Output format

Produce this report (markdown). Keep it concrete. Quote lines.

```
# Voice Audit: <profile name> (<narrative | character: NAME>)

Source: <path/section audited>
Prose checked against: <file(s), or "none available, graded unverified">

## Verdict: READY | NEEDS WORK | NOT READY
<one sentence: can this profile reliably produce on-voice content right now?>

## Dimension scorecard
| Dimension          | Rating | Evidence / gap |
|--------------------|--------|----------------|
| Register & persona | STRONG/THIN/MISSING | <quoted line or what's missing> |
| Rhythm & syntax    | ...    | ... |
| Signature moves    | ...    | ... |
| Vocabulary & diction | ...  | ... |

## Profile vs prose
- Contradictions: <profile claim that the prose does not support, or "none">
- Unprofiled habits: <strong prose move the profile never names, or "none">

## Recommendations (priority order)
1. <THIN/MISSING section>: <concrete fix: what to add, with a model example drawn from the actual prose>
2. ...

## Verdict rule applied
READY = all four STRONG, or three STRONG + one THIN with no contradictions.
NEEDS WORK = any MISSING, two or more THIN, or any profile/prose contradiction.
NOT READY = persona MISSING, or three or more dimensions THIN/MISSING.
```

## Example command and result

The author runs:

```
/voice-audit project-config.md          # audit the narrative voice
/voice-audit "character: Aldous"         # audit one character's voice profile
/voice-audit                             # audit every voice section it can find
```

A typical result for the demo project, auditing the narrative voice in `project-config.md` against `example/Chapter-01.md`:

```
# Voice Audit: narrative voice (narrative)

Source: project-config.md, "Voice & Tone" / "Prose Preferences"
Prose checked against: example/Chapter-01.md

## Verdict: NOT READY
The config holds template placeholders ([First/Third person], [Serious/Light/...]);
the actual narrator in Chapter 01 is far richer than anything written down.

## Dimension scorecard
| Dimension            | Rating  | Evidence / gap |
|----------------------|---------|----------------|
| Register & persona   | MISSING | Only "[Tone]" placeholders; the prose's patient, unsentimental remove is undocumented. |
| Rhythm & syntax      | THIN    | "Sentence Variety: [...]" unfilled; prose actually accretes long clauses then snaps short ("Still the lamp turned. Still he climbed."). |
| Signature moves      | MISSING | Prose closes scenes on a held object (the empty second cup, the banked lamp); profile names none of this. |
| Vocabulary & diction | THIN    | No diction notes; prose is plain Anglo-Saxon (stone, oil, salt), abstraction only when earned. |

## Profile vs prose
- Contradictions: none (profile is too empty to contradict anything).
- Unprofiled habits: grief carried by objects, never named; anaphora ("Still... Still...").

## Recommendations (priority order)
1. Register & persona (MISSING): Add a persona line: "Patient narrator at one remove;
   never names emotion, lets it surface through routine and objects." Ground it in the
   second-cup paragraph.
2. Signature moves (MISSING): Document the scene-closing-on-an-object move and the
   "promise to the dark" register; cite the lamp-winding paragraph.
3. Rhythm & syntax (THIN): Replace the placeholder with: "Long accreting sentences,
   then a short line to land the turn," with the "Still the lamp turned" example.
4. Vocabulary & diction (THIN): Note the plain, weather-and-stone diction and the ban
   on modern slang; reaffirm author-rules.md em-dash ban applies to the voice guide too.

## Verdict rule applied: NOT READY (persona MISSING, three dimensions THIN/MISSING).
```

## What this skill does NOT do

- Does not rewrite the profile or the manuscript. It recommends; the author edits.
- Does not score prose quality or gate a chapter. That is `/review-chapter` and the four-tier panel.
- Does not invent voice traits the prose does not support. Every STRONG rating must cite real evidence.
- Does not relax `author-rules.md`. A profile that prescribes a banned construction (em dashes, banned words) is an automatic NEEDS WORK with that flagged.
