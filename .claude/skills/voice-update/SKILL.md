---
name: voice-update
description: >-
  Refresh an existing WriteAssist voice profile from newly APPROVED chapters
  (the ones that passed the four-tier review panel) plus author feedback. Reach
  for this skill when an author says the voice has drifted, characters sound
  alike, a critic flagged a weak voice section, or simply "update the voice
  profile / style guide from the latest chapters." It compounds the profile over
  the life of the book: fixes weak sections, folds in new on-page evidence, and
  updates BOTH the narrative voice and the per-character voice profiles. Do NOT
  use it to draft prose or to run the review panel; it only updates the profile.
---

# voice-update

A prompt-driven skill that keeps the project's voice profile current as the book
grows. It treats **approved chapters as the evidence base** and rewrites the
voice profile so every later chapter is written against a sharper, book-tested
target.

## Why this exists

In WriteAssist a chapter is only "done" when the four-tier review panel returns
PASS (at least 5 of 7 gating critics Pass/Strong Pass, weighted score >= 7.0, no
critical-fail from Continuity, Rules, or Voice). Those approved chapters are the
truest record of how the book actually sounds. The voice profile that ships with
a fresh project (`04-Project-Management/style-guide.md`, `project-config.md`) is
full of `[placeholder]` slots and early guesses. This skill replaces those weak
sections with evidence pulled from chapters that already cleared the panel, so
the profile compounds instead of going stale.

## When to use

- A `voice-consistency` critic note said the narrator or a character drifted.
- The author gives feedback ("Aldous sounds too modern", "Mara and Aldous read
  the same").
- A batch of chapters just passed the panel and the profile should absorb them.
- The style-guide still has unfilled `[...]` placeholders this far into the book.

## Tie-in to the WRP / review pipeline

```
/generate-wrp -> /execute-wrp -> /review-chapter (panel) -> PASS = APPROVED
                                                              |
                                                              v
                                            voice-update reads APPROVED chapters
                                                              |
                                                              v
                          refreshed style-guide.md + character voice profiles
                                                              |
                                                              v
                              next /generate-wrp + /execute-wrp write to it
```

Only chapters whose `**Status**:` reads as Approved / Pass / Final count as
evidence. Pending or in-progress chapters are reported but never used to rewrite
the profile.

## Step 1: gather the evidence (run the helper)

The helper is stdlib-only and makes no creative judgments. It finds approved
chapters, harvests per-character dialogue, locates the voice-profile target
files, flags weak (placeholder) sections, scans for banned em dashes, and echoes
any author feedback you pipe in on stdin.

Run it from the project root, passing the author's feedback on stdin:

```bash
echo "Aldous and Mara are starting to sound alike; sharpen Mara's voice." \
  | python3 .claude/skills/voice-update/gather_voice_evidence.py .
```

(Run with `</dev/null` if you have no feedback text.)

### What you get back (JSON on stdout)

```json
{
  "project_root": "/path/to/book",
  "approved_chapters": [
    {
      "path": "02-Manuscript/Chapter-02.md",
      "status": "Approved (panel PASS, weighted 8.1)",
      "em_dash_count": 0,
      "dialogue_by_character": [
        { "character": "Aldous", "lines": 1 },
        { "character": "Mara", "lines": 1 }
      ]
    }
  ],
  "approved_count": 1,
  "pending_chapters": [
    { "path": "02-Manuscript/Chapter-03.md", "status": "In Progress", "em_dash_count": 0 }
  ],
  "voice_profile_targets": [
    {
      "path": "04-Project-Management/style-guide.md",
      "exists": true,
      "unfilled_placeholders": 80,
      "weak_section_samples": ["[First/Third/Multiple]", "[Past/Present]"],
      "em_dash_count": 0
    }
  ],
  "weak_profile_files": ["04-Project-Management/style-guide.md", "project-config.md"],
  "characters_with_new_evidence": [
    { "character": "Aldous", "approved_dialogue_lines": 1 },
    { "character": "Mara", "approved_dialogue_lines": 1 }
  ],
  "author_feedback": "Aldous and Mara are starting to sound alike; sharpen Mara's voice.",
  "ready_to_refresh": true,
  "notes": "approved_chapters are the ONLY valid voice evidence ..."
}
```

Read the fields like this:

- `ready_to_refresh: false` (or `approved_count: 0`) means there is no panel
  evidence yet. Stop and tell the author to get a chapter through the panel
  first; do not invent a voice from pending drafts.
- `weak_profile_files` and each target's `weak_section_samples` are the sections
  to fix first.
- `characters_with_new_evidence` tells you which characters now have enough
  on-page dialogue to justify a refreshed profile.
- Any nonzero `em_dash_count` is a defect to remove, never to copy forward.

## Step 2: refresh the profile (the prompt)

Open each path in `voice_profile_targets`, then read the approved chapters in
full (the helper only counts; you judge). Rewrite the profile so it is true to
the book as it now reads:

1. **Narrative voice** (`style-guide.md` "Voice & Tone", "Prose Style", plus the
   `project-config.md` voice section): replace placeholder slots and early
   guesses with what the approved chapters actually do. POV, tense, narrative
   distance, sentence rhythm, description density, metaphor sourcing. Quote one
   short approved line as the anchor example for each major claim.
2. **Character voice profiles**: for every character in
   `characters_with_new_evidence`, update or create a profile block (speech
   patterns, vocabulary level, signature phrasing, what they never say, internal
   voice). Make distinct characters read distinctly; if the feedback says two
   voices have merged, sharpen the contrast and note the differentiator.
3. **Weak-section repair**: resolve every entry in `weak_section_samples` to a
   concrete decision drawn from the page, not a guess.
4. **Author feedback**: fold `author_feedback` in as a binding constraint. If it
   conflicts with the chapters, surface the conflict to the author instead of
   silently picking one.
5. **Evolution, not erasure**: when a character has grown, record the change as a
   tracked evolution (book-start vs current, with the chapter where it turned),
   so the profile compounds rather than overwrites its own history.

## Hard rules

- Approved chapters only. If `ready_to_refresh` is false, do not rewrite.
- ZERO em dashes (U+2014). The framework bans them and a hook blocks writes that
  contain one. Use commas, colons, semicolons, or parentheses.
- This skill edits the **profile**, never the manuscript. It does not run the
  panel and does not draft chapters.
- Do not delete tracked voice-evolution history; append to it.

## Files this skill touches

- Reads: approved chapters under `02-Manuscript/` (and `example/` in the demo),
  `04-Project-Management/style-guide.md`, `project-config.md`, plus
  `author-rules.md` and `story-compendium.md` for constraints.
- Writes: `04-Project-Management/style-guide.md` and the character voice profiles
  (and `project-config.md` voice section if it still carries placeholders).
