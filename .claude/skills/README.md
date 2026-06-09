# WriteAssist Skills

Skills available to WriteAssist agents and commands. The workflow guide routes
authors through the framework; the capability skills give critics and builders
deterministic evidence (scripts) or structured drafting procedures (prompts) so
verdicts cite numbers and sources instead of impressions.

All skills are Python 3 standard library only (no pip installs), emit zero em
dashes (the framework bans U+2014), and avoid `grep -P`.

## Guide

| Skill | Kind | Purpose |
|-------|------|---------|
| [writeassist-workflow](writeassist-workflow/SKILL.md) | prompt | User-facing guide to the WriteAssist framework: routes the author to the right command for their current stage and explains the hard constraints (em-dash ban, four-tier review gate). |

## Capability skills

| Skill | Kind | Purpose |
|-------|------|---------|
| [prose-metrics](prose-metrics/SKILL.md) | script | Deterministic per-chapter prose analyzer: sentence-length variety, filter-word and adverb density, passive voice, dialogue ratio, echo/repetition, reading grade, em-dash count. Shared evidence for the prose critics. |
| [canon-lookup](canon-lookup/SKILL.md) | script | Deterministic continuity fact lookup over the story bible (`story-compendium.md`, `03-Resources/`, character files) returning exact `{file, line, text}` provenance for citable continuity findings. |
| [wrp-conformance](wrp-conformance/SKILL.md) | script | Scores a written chapter against its WRP (Writing Requirements Plan) beat by beat, marking each required beat present / weak / missing with an evidence snippet. |
| [manuscript-compile](manuscript-compile/SKILL.md) | script | Zero-dependency, no-auth manuscript export: concatenates `02-Manuscript/*.md` in numeric chapter order into one file. The local alternative to the parked Drive sync. |
| [improv-story-form](improv-story-form/SKILL.md) | prompt | Optional, no-auth premise builder for short stories, RPG one-shots, and writing-prompt warm-ups, from prompted constraints (arc, genres, setting, characters, spark). Not wired into the core flow. |
| [voice-create](voice-create/SKILL.md) | prompt | Builds an evidence-derived, inhabitable voice profile (narrative voice or per-character) from real writing samples, grounded by a bundled stdlib extractor. |
| [voice-audit](voice-audit/SKILL.md) | prompt | Quality-checks an existing voice profile against what a strong profile looks like (register, rhythm, signature moves, diction) and reports strong/thin/missing with fixes. Periodic confidence check, not a line edit. |
| [voice-update](voice-update/SKILL.md) | prompt | Refreshes the voice profile from newly APPROVED chapters plus author feedback, replacing placeholder sections with on-page evidence so the profile compounds over the book. |

## How they fit together

- **Scripts produce the shared evidence; agents interpret it.** Two fan-out
  critics running the same script on the same chapter get the same numbers, so
  their verdicts agree on the facts and differ only in judgment.
- **The voice trio is a lifecycle**: `voice-create` builds a profile from
  samples, `voice-audit` grades whether it is strong enough to generate from,
  and `voice-update` refreshes it from chapters that cleared the review panel.
  All three target the framework's narrative-voice doc
  (`04-Project-Management/style-guide.md`) and per-character profiles in
  `story-compendium.md` / `03-Resources/`.
