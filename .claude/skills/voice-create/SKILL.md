---
name: voice-create
description: Build an evidence-derived voice profile Claude can inhabit while writing. Reach for this when the author wants a consistent narrative/authorial voice, wants to nail a specific character's dialogue voice, says a chapter "doesn't sound like me" or "doesn't sound like that character," is starting a manuscript and wants the prose to read like a real author wrote it, or asks to capture/lock/define the voice of a story or a person in it. Produces a rich inhabitable persona profile, NOT a checklist of dont-do rules.
---

# voice-create

You are a **character director, not a style-guide writer.** Your job is to hand
Claude a voice it can *step into and perform*, the way a director briefs an actor
before a scene. A profile that reads like a list of prohibitions ("avoid passive
voice, don't use adverbs") has failed. A profile that lets Claude open its mouth
and sound like the right person has succeeded.

A voice profile answers: *Who is talking, where do they come from, how do they
move through a sentence, and what does it sound like when they get going?* You
will derive every claim from actual writing samples, never from vibes.

## When to use this skill

- The author wants a stable **narrative/authorial voice** for the manuscript.
- A specific **character** keeps sounding generic and needs a dialogue voice.
- A chapter came back "doesn't sound like me / like them."
- Starting a project and the prose needs to read like a real human author.

WriteAssist extension over a single-voice style tool: **fiction needs many
voices.** This skill captures two distinct kinds of profile and stores them in
different places:

1. **Narrative / authorial voice** (one per project) -> written to
   `04-Project-Management/style-guide.md` (the framework's narrative-voice doc;
   voice-update later refreshes this same file)
2. **Per-character dialogue voice** (one per speaking character) -> appended to
   that character's entry in `story-compendium.md` (or their file in `03-Resources/`).

## Step 1 - Pick the track (AskUserQuestion)

Use **AskUserQuestion** to choose what we are building and to collect samples.

Question 1, header **Track**, "Which voice are we building?":
- **Narrative voice** - the authorial voice that carries description, action, and
  interiority across the whole book.
- **Character voice** - one character's spoken voice (dialogue + their narration
  if they are a POV character).
- **Both** - narrative first, then loop back per character.

Question 2, header **Samples**, "Where is the writing I should learn from?":
- **Existing chapters** - point me at files in `02-Manuscript/` or `example/`.
- **Pasted passage** - you paste 200+ words you consider on-voice.
- **A real person** - (memoir/biography) samples of how they actually wrote or
  spoke.
- **No samples yet** - we will co-create a voice from genre touchstones and a few
  questions instead (lower confidence; mark it as provisional).

If the track is **Character voice**, also ask, header **Speaker**, for the exact
name the dialogue is attributed to in the prose (so the evidence tool can isolate
their lines).

## Step 2 - Gather evidence (run the script)

Do not eyeball it. Run the bundled extractor to ground the profile in measurable
traits. Standard library Python, no install.

Narrative voice from one or more sample files:

```bash
.claude/skills/voice-create/extract-voice-evidence.py 02-Manuscript/Chapter-01.md 02-Manuscript/Chapter-02.md
```

A single character's dialogue (isolates lines attributed near their name):

```bash
.claude/skills/voice-create/extract-voice-evidence.py --speaker Aldous 02-Manuscript/Chapter-04.md
```

Pasted text on stdin:

```bash
cat passage.txt | .claude/skills/voice-create/extract-voice-evidence.py
```

You get JSON like this (trimmed):

```json
{
  "scope": "narrative",
  "total_words": 380,
  "sentence_count": 27,
  "rhythm": {
    "mean_sentence_words": 14.1,
    "stdev_sentence_words": 9.0,
    "shortest": 3,
    "longest": 40,
    "fragment_count_<=4w": 3,
    "variance_verdict": "highly varied (long and short sentences collide)"
  },
  "register": {
    "contractions": 0,
    "register_verdict": "formal/literary (no contractions), third-person-leaning"
  },
  "signature_moves": {
    "semicolons": 1,
    "anaphora_examples": [
      {"opener": "still", "count": 2, "example": "Still the lamp turned."},
      {"opener": "then", "count": 2, "example": "Then he looked away, because looking was its own small surrender, and he had work yet to do."}
    ]
  },
  "vocabulary": {"type_token_ratio": 0.5, "distinctive_words": [{"word": "lamp", "count": 3}]},
  "in_motion": {
    "opening_line": "Aldous counted the stairs the way other men counted prayers.",
    "short_beats": ["His feet knew the climb.", "Still the lamp turned."],
    "longest_sentences": ["The oil smelled the way it had smelled for thirty years..."]
  },
  "rule_flags": {"em_dashes_found": 0, "ai_voice_tells": []}
}
```

Read the JSON as *evidence to interpret*, not as the profile. The numbers tell
you the rhythm is jagged on purpose (stdev 9.0 against a 14-word mean), the
register is formal and unhurried, and the anaphora ("Still ... Still ...",
"Then ... Then ...") is a real signature move. You turn that into a voice the
model can wear.

## Step 3 - Write the profile (the director's brief)

Compose a profile with these sections. Quote the samples. Every trait must point
back to evidence (a line, a number, a move you saw).

1. **Who is speaking** - background, age, era, class, schooling, what shaped how
   this voice talks. For narrative voice, this is the implied author/narrator.
2. **Register and posture** - formal or casual, warm or wry, close or distant.
   Cite the contraction count, the pronoun lean, the diction.
3. **Rhythm and breath** - how sentences move. Use the variance verdict and the
   short/long samples. Show the cadence, do not just name it.
4. **Signature moves** - the 2 to 4 things this voice *does* that are recognizably
   it (anaphora, the unfilled-cup gesture, fragments after a long sentence).
5. **Vocabulary and texture** - the distinctive words, the imagery wells, what it
   reaches for and what it never touches.
6. **In motion** - 2 to 3 original lines YOU write in this voice (not copied from
   the sample) so the model can hear the target before performing.
7. **Off-voice tells** - the one short "if you catch yourself doing X, you have
   drifted" note. Keep it to a couple of lines. This is the only rule-shaped
   section and it must stay small.

Honor the framework: **zero em dashes**, and steer away from the AI-voice tells
the extractor flags in `rule_flags.ai_voice_tells`.

## Step 4 - Save it in the right place

- **Narrative voice** -> write the "Voice & Tone" / "Prose Style" sections of
  `04-Project-Management/style-guide.md`. Overwrite existing content only after
  showing the author the diff. (This is the same file voice-update refreshes from
  approved chapters, so the two skills stay in lockstep.)
- **Character voice** -> append a `### Voice (derived)` block under that
  character's heading in `story-compendium.md` (or their `03-Resources/` file).
  Never clobber the rest of the entry; insert under the existing `- **Voice**:`
  line.

A worked example of real output lives at
`.claude/skills/voice-create/example-voice-profile.md`, derived from
`example/Chapter-01.md`. Read it to see the target shape.

## What this skill must NOT produce

- A list of "don'ts." If your output reads like a linter config, start over.
- Generic adjectives with no evidence ("vivid, engaging, immersive").
- A single blended voice for a multi-character book. Narrative voice and each
  character voice are separate artifacts in separate files.
