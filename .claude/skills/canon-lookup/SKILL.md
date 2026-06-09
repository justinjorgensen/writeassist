---
name: canon-lookup
description: Deterministic continuity fact lookup over a WriteAssist story bible. Reach for this whenever you need to verify a canonical fact (a character trait, timeline date, location, world rule) with an exact, citable source before writing or reviewing prose. Use it to arm the continuity-checker with provenance ("story-compendium.md line N says X, but the chapter says Y") and to give every fan-out agent one shared canon source instead of re-reading the bible. Use it when a draft makes a claim about an established entity and you must confirm whether canon agrees.
---

# Canon Lookup

A no-LLM, stdlib-only continuity lookup over the project's story bible. It reads
`story-compendium.md`, everything under `03-Resources/`, and the character files,
then returns matching lines with exact `{file, line, text}` provenance. Same input
always gives the same output, so two fan-out agents asking the same question get the
same citable answer.

## When to use this skill

- A chapter or draft asserts a fact about an established entity (a character's age,
  a place name, an event date) and you need to confirm it against canon.
- You are running continuity-checker and want findings that cite an exact source
  line, not a vibe.
- Any fan-out agent needs to ground itself in canon without re-reading the whole
  bible.

## The script

`canon.py` lives next to this file. It is executable and uses only the Python 3
standard library. It prints JSON to stdout.

Run it from the skill directory (or give an absolute path). To point it at a
different WriteAssist project, set `WA_PROJECT_ROOT`; otherwise it auto-detects the
project root three levels above the script.

### query: find every line matching ALL keywords

Case-insensitive AND match across the compendium, `03-Resources/`, and character
files. Use it to hunt for whatever the draft is claiming.

```
./canon.py query theme central
```

Returns (trimmed):

```json
{
  "command": "query",
  "keywords": ["theme", "central"],
  "count": 1,
  "results": [
    { "file": "story-compendium.md", "line": 96, "text": "### Central Theme" }
  ]
}
```

Each result is a `{file, line, text}` object. `file` is relative to the project
root, so a finding reads as: `story-compendium.md:96 says "### Central Theme"`.
With no matches, `count` is `0` and `results` is `[]`. With no keywords you get
`{"error": "no keywords given", ...}`.

### get: return a whole compendium section by entity

Finds the first compendium heading whose title contains the entity, then returns
every line of that section (up to the next heading of equal or shallower depth).

```
./canon.py get Timeline
```

Returns (trimmed):

```json
{
  "command": "get",
  "entity": "Timeline",
  "found": true,
  "section": "📅 Timeline",
  "section_line": 17,
  "count": 12,
  "results": [
    { "file": "story-compendium.md", "line": 17, "text": "## 📅 Timeline" },
    { "file": "story-compendium.md", "line": 18, "text": "" }
  ]
}
```

If no heading matches you get `{"found": false, "count": 0, "results": []}`.

## How to cite a finding

`query` and `get` both hand back exact source coordinates. A continuity finding
should pin both sides:

> Continuity conflict: `story-compendium.md:33` establishes the main character as
> "[Character Name]", but `02-Manuscript/Chapter-01.md:7` names him "Aldous".
> Update one to match.

## Constraints

- No network, no LLM, no pip dependencies. Deterministic.
- Searches text files only (`.md`, `.txt`).
- `get` searches the compendium only (the single source of truth for sections);
  `query` fans out across compendium, resources, and character files.
- This framework bans em dashes. This skill never emits them.
