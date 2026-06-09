---
name: improv-story-form
description: Build a short story or RPG one-shot premise from improv-style inputs (arc, genres, setting, characters, spark). Use when the user wants to brainstorm a story from scratch using prompted constraints rather than a blank page.
---

# Improv Story Form

A structured premise-builder for short stories, RPG one-shots, and writing-prompt warm-ups. Modeled after the WriteAssist `improv_story_form.html` form, but works in any project, not just inside the framework.

## When to use this skill

- User says "give me a story prompt" / "help me come up with a story idea" / "I want to write something but don't know what."
- User mentions improv, one-shot, RPG, writing warm-up, or short fiction brainstorming.
- They want a *premise*, not a full chapter.

Do NOT use this skill if the user is already deep in a WriteAssist manuscript and just wants to plan the next chapter, use `writeassist-workflow` instead.

## The seven inputs

Walk the user through these in order. Use `AskUserQuestion` if you have it; otherwise ask conversationally. **Skip any input the user already named**, don't be rigid.

1. **Story Arc**, what shape? Pick one:
   - *Rising / falling / cyclical / fragmented / mystery-driven*
2. **Genres** (1-3), pick from or accept free-form:
   - Mystery, horror, romance, sci-fi, fantasy, literary, comedy, thriller, noir, slipstream
3. **Setting**, where + when + one vivid detail. (Example: *"Coastal Maine, 1994, a payphone that only takes Canadian quarters."*)
4. **Characters**, 1-5 lines, each with name/role/quirk-or-secret.
5. **Story Spark**, the inciting event. Offer these defaults but accept anything:
   - A mysterious message appears / Something valuable is stolen / A strange visitor arrives / A disaster begins / Someone vanishes
6. **Extras / Wildcards** (optional), constraints, twist ideas, tone notes.
7. **Output preferences**, length (logline / synopsis / opening scene) and tone (matching genre, or deliberately mismatched).

## Producing the output

Once you have the inputs, generate **exactly what they asked for** in #7. Default if unspecified: a 200-300 word synopsis.

Format:
```
# <Title>

**Logline:** <one sentence>

**Premise:** <2-3 paragraph synopsis>

**The spark:** <how the inciting event triggers the story>

**Wildcards in play:** <how the extras shape it>
```

If they asked for an opening scene, write the scene in their requested tone (~400-600 words). **Apply the same em-dash rule WriteAssist uses if you're inside a WriteAssist project**: replace `,` with commas/colons/parentheses.

## Variant: dice mode

If the user says "roll for it" or "surprise me," randomly pick from the option lists yourself and produce the premise without asking. Use this when their energy says "I want a kick, not a survey."

## What this skill does NOT do

- Doesn't write a full chapter or short story (that's a separate ask).
- Doesn't replace `outline-book` for novel-length projects.
- Doesn't promise originality, every premise is a remix. Cite influences if you spot a strong one (e.g., "this is basically *Annihilation* with the gender flipped, lean in or pivot?").
