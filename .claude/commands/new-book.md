---
description: Interview the author and configure a fresh WriteAssist project (fills project-config.md and author-rules.md, then points to /outline-book and voice-create).
allowed-tools: AskUserQuestion, Read, Write, Edit
---

# new-book

Stand up a brand new book project by interviewing the author, then writing their
answers into the two files every other command reads first: `project-config.md`
and `author-rules.md`. This is the friendly front door that replaces the manual
"open the templates and fill in the brackets" chore.

You are an acquisitions editor doing intake on a new manuscript. Be warm, move
quickly, and do not lecture. The whole point is to get a usable config in a
handful of questions, not to write a craft essay.

## What this command does

1. Interviews the author with **AskUserQuestion** (mode, genre, voice track,
   structure, plus a couple of free-text basics).
2. Fills `project-config.md` and `author-rules.md` from the answers, replacing
   the bracketed placeholders with real values and tuning the rule set to the
   chosen mode.
3. Hands off: tells the author to run `/outline-book` next and to use the
   `voice-create` skill to lock their narrative (and per-character) voice.

No script. No subagent. Do every step yourself in this conversation so you keep
the author's answers in context. **Never write an em dash into either file.**

## Step 1 - Interview (AskUserQuestion)

Ask these in as few rounds as the tool allows. Keep option descriptions to one
sentence. The four structured questions:

**Question 1, header `Mode`, "What kind of book is this?"**
- **Fiction** - invented characters and events; full novelist tooling.
- **Memoir** - your own life, told as narrative; truth-anchored but shaped.
- **Biography** - someone else's life, researched and sourced.
- **Narrative nonfiction** - true events/ideas told with story craft (history,
  science, true crime, reportage).

**Question 2, header `Genre`, "What genre or shelf does it live on?"**
Offer a few common picks AND let the author free-type their own:
- **Literary** - character and prose forward, ambiguous resolutions welcome.
- **Upmarket / book club** - emotional, discussable, accessible literary.
- **Genre commercial** - SFF, mystery/thriller, romance, horror, etc.
- **Other** - the author names it (free text).

**Question 3, header `Voice`, "How should the prose voice come together?"**
- **Author voice** - one narrative voice carries the whole book.
- **Multi-voice** - several POV characters each get a distinct voice.
- **Subject's voice** - (memoir/biography) capture how a real person wrote/spoke.
- **Decide later** - start with a sensible default, lock it with `voice-create`.

**Question 4, header `Structure`, "What spine should the outline hang on?"**
- **Three-act** - setup / confrontation / resolution; the default workhorse.
- **Hero's journey** - mythic 12-stage arc for quest-shaped stories.
- **Save the Cat** - 15-beat commercial sheet, tight on pacing.
- **Chronological / thematic** - (nonfiction) ordered by time or by idea.

Then collect the free-text basics in a short follow-up (AskUserQuestion allows
multiple questions per call, or just ask in plain text if cleaner): **working
title**, **target audience** (e.g. adult, YA), **POV/tense** (e.g. third
limited, past), and **one line on tone** (e.g. wry and intimate). If the author
skips any, leave a clearly marked `[TODO: ...]` placeholder rather than guessing.

## Step 2 - Fill `project-config.md`

Read `project-config.md`, then **Edit** it so the bracketed placeholders carry
the author's real answers. At minimum set:

- `**Project Name**:` -> working title (or `[TODO: title]`).
- `**Genre**:` -> chosen genre/shelf.
- `**Target Audience**:` -> their answer.
- `**Writing Stage**:` -> `Planning`.
- `**Narrative Voice**:` -> their POV/tense.
- `**Tone**:` and the Voice & Tone block -> their one-line tone.

Mode shapes the config:

- **Fiction** - leave the character-voice and creative-license sections intact.
- **Memoir / Biography / Narrative nonfiction** - in the "AI MAY NOT Add" list,
  tighten "New plot points" into "**No invented events, scenes, or quotes** -
  this is a true story; flag gaps instead of filling them," and add a line under
  Content Guidelines: "**Fact-anchored**: every scene must trace to a real
  source or memory; mark anything uncertain `[VERIFY]`." For **biography**,
  also note that sourcing/citations matter.

Add a Change Log row dated today noting the project was initialized via
`/new-book`. Do not invent themes or sensitive-topic entries the author did not
give you; leave those placeholders as honest TODOs.

## Step 3 - Fill `author-rules.md`

Read `author-rules.md`, then **Edit** the bracketed spots:

- `**MAINTAIN consistent POV**` -> their POV choice.
- `**MAINTAIN consistent tense**` -> their tense choice.
- The Style Decisions "Voice & Tone" block -> their tone, humor, and density.
- `### [Your Primary Genre]` under Genre Contract -> the chosen genre.
- Audience block -> their target reader.
- Footer `Last Updated` -> today.

Keep the **NO EM DASHES EVER** rule exactly as written. It is the framework's
load-bearing constraint and the rest of the toolchain enforces it.

Mode-specific rules:

- **Fiction** - structural rules (head-hopping, deus ex machina) stay as is.
- **Memoir** - add under Hard Constraints: "**NO fabricated dialogue or events**
  - reconstruct honestly, compress where needed, never invent." Soften
  "chosen one / prophecy" trope warnings since they rarely apply.
- **Biography** - add: "**NO unsourced claims** - every factual assertion needs a
  source; speculation must be labeled as such."
- **Narrative nonfiction** - add: "**NO composite characters without disclosure**
  and **NO invented quotes**."

Record the initialization in the Evolution Log with today's date.

## Step 4 - Hand off

Close with a short, plain recap of what you set, then point the author at the
next two moves:

1. **Run `/outline-book`** to turn this config into a chapter-by-chapter spine
   (it will read both files you just filled). For nonfiction, mention the
   chronological/thematic structure option there.
2. **Use the `voice-create` skill** to build an inhabitable voice profile.
   - Author/single voice -> narrative track, saved to the style guide.
   - Multi-voice -> run it per POV character.
   - Subject's voice (memoir/biography) -> feed it real samples of how the
     person wrote or spoke.

Optionally suggest `/setup-story` if they want to build the story compendium and
character profiles before outlining.

Keep the recap tight. No em dashes anywhere.
