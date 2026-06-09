---
name: wrp-conformance
description: >-
  Check whether a written chapter actually satisfied the beats its WRP (Writing
  Requirements Plan) specified. Reach for this when an agent has just drafted or
  received a chapter and needs to confirm it hit its blueprint: which required
  beats are present, which are weak, which are missing. The story-architect uses
  it to gate a draft before approval, and the continuity-checker uses it to
  confirm a chapter delivered the elements the WRP promised. Use it any time you
  have both a chapter file and its matching WRP file and want an executable,
  beat-by-beat conformance report instead of a subjective read.
---

# wrp-conformance

Turns a WRP into an executable spec and scores a chapter against it.

A WRP lists required beats as markdown headers and bullet / numbered lists
(scene elements, characters to establish, theme references, success criteria).
This skill parses those beats, then heuristically judges each one as
`present`, `weak`, or `missing` by keyword and proper-noun overlap with the
chapter prose, attaching a short evidence snippet from the chapter.

## Command

```
python3 .claude/skills/wrp-conformance/conformance.py <chapter.md> <wrp.md>
```

- `argv[1]` = path to the written chapter markdown.
- `argv[2]` = path to the matching WRP markdown.

## Example

```
python3 .claude/skills/wrp-conformance/conformance.py \
  example/Chapter-01.md example/chapter_01_WRP.md
```

Output (JSON to stdout, abbreviated):

```json
{
  "beats": [
    {
      "beat": "The cold iron stair and counted steps",
      "status": "present",
      "evidence": "Forty-one to the lamp room, iron cold under his palm, each step answering the last."
    },
    {
      "beat": "A hint of who he tends it for, without naming it",
      "status": "missing",
      "evidence": "no strong match found in chapter"
    }
  ],
  "summary": { "present": 15, "weak": 4, "missing": 8 }
}
```

## How statuses are decided

- `present`: strong keyword coverage, or a matched named entity plus partial
  keyword overlap. The beat clearly landed on the page.
- `weak`: some overlap but thin. The beat may be implied or underdeveloped and
  is worth a human read of the evidence snippet.
- `missing`: a required named entity is absent and keyword overlap is low, or
  there is effectively no overlap at all. The beat does not appear to be served.

Abstract beats (emotional arcs, theme statements, "reader feels X without being
told") frequently score `weak` or `missing` because the chapter delivers them
by implication, not by restating the WRP's vocabulary. Treat those rows as a
prompt to read the evidence and judge, not as an automatic failure.

## Consuming the output

- `summary` gives a quick pass/fail signal: a chapter with several concrete
  scene-element beats `missing` did not satisfy its blueprint.
- Each `evidence` snippet is the chapter sentence with the highest overlap, so
  an agent can quote it directly when reporting a gap back to the writer.

## Notes

- Python 3 standard library only. No dependencies.
- Reads files from the paths given; prints a single JSON object to stdout.
- On bad usage or unreadable files it prints `{"error": "..."}` and exits
  non-zero.
