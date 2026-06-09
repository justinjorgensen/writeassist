#!/usr/bin/env python3
"""canon.py - deterministic continuity fact lookup over the WriteAssist story bible.

Subcommands:
  query <keywords...>   Search the compendium, 03-Resources, and character files.
                        Returns every line matching ALL keywords (case-insensitive),
                        each carrying an exact {file, line, text} source.
  get <entity>          Find the compendium section heading that names <entity> and
                        return that whole section's lines (until the next heading of
                        the same or shallower depth), each as {file, line, text}.

No network, no LLM, stdlib only. Output is JSON on stdout. Deterministic:
files are scanned in a fixed sorted order and results preserve file+line order.

Why this exists: it arms the continuity-checker (and every fan-out agent) with one
shared, citable canon source. A finding can say "compendium line N says X" against
"chapter says Y" with exact provenance.
"""

import json
import os
import re
import sys

# Resolve the project root relative to this script:
#   <root>/.claude/skills/canon-lookup/canon.py  ->  <root>
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", "..", ".."))

# Allow override so the script is portable to any WriteAssist project.
PROJECT_ROOT = os.environ.get("WA_PROJECT_ROOT", PROJECT_ROOT)

COMPENDIUM = os.path.join(PROJECT_ROOT, "story-compendium.md")
RESOURCES_DIR = os.path.join(PROJECT_ROOT, "03-Resources")

# Heading detector for markdown ("#", "##", ...). Used by `get`.
HEADING_RE = re.compile(r"^(#{1,6})\s+(.*\S)\s*$")

# Directories scanned by `query` for character files, in addition to the
# compendium and 03-Resources. These hold canon-relevant prose/notes.
CHARACTER_DIRS = [
    os.path.join(PROJECT_ROOT, ".claude", "agents"),
    os.path.join(PROJECT_ROOT, "04-Project-Management", "templates"),
]


def _is_text_file(path):
    return path.lower().endswith((".md", ".txt"))


def _gather_files():
    """Return the deterministic, de-duplicated list of canon source files."""
    files = []
    seen = set()

    def add(path):
        ap = os.path.abspath(path)
        if ap in seen:
            return
        if os.path.isfile(ap) and _is_text_file(ap):
            seen.add(ap)
            files.append(ap)

    # 1. The compendium is the primary source of truth.
    add(COMPENDIUM)

    # 2. Everything under 03-Resources.
    if os.path.isdir(RESOURCES_DIR):
        for name in sorted(os.listdir(RESOURCES_DIR)):
            add(os.path.join(RESOURCES_DIR, name))

    # 3. Character / template files that describe canon entities.
    for d in CHARACTER_DIRS:
        if not os.path.isdir(d):
            continue
        for name in sorted(os.listdir(d)):
            lower = name.lower()
            if "character" in lower or "char" in lower:
                add(os.path.join(d, name))

    return files


def _rel(path):
    """File path relative to PROJECT_ROOT for clean, citable provenance."""
    try:
        return os.path.relpath(path, PROJECT_ROOT)
    except ValueError:
        return path


def _read_lines(path):
    with open(path, "r", encoding="utf-8", errors="replace") as fh:
        return fh.read().splitlines()


def cmd_query(keywords):
    if not keywords:
        return {"command": "query", "error": "no keywords given", "results": []}

    needles = [k.lower() for k in keywords]
    results = []

    for path in _gather_files():
        lines = _read_lines(path)
        rel = _rel(path)
        for idx, text in enumerate(lines, start=1):
            haystack = text.lower()
            if all(n in haystack for n in needles):
                results.append({"file": rel, "line": idx, "text": text.rstrip()})

    return {"command": "query", "keywords": keywords, "count": len(results),
            "results": results}


def cmd_get(entity):
    if not entity:
        return {"command": "get", "error": "no entity given", "results": []}

    needle = entity.lower()
    if not os.path.isfile(COMPENDIUM):
        return {"command": "get", "entity": entity,
                "error": "story-compendium.md not found at %s" % COMPENDIUM,
                "results": []}

    lines = _read_lines(COMPENDIUM)
    rel = _rel(COMPENDIUM)

    # Index every heading: (line_index_0based, depth, title).
    headings = []
    for i, text in enumerate(lines):
        m = HEADING_RE.match(text)
        if m:
            headings.append((i, len(m.group(1)), m.group(2)))

    # Find the first heading whose title contains the entity.
    match = None
    for pos, (i, depth, title) in enumerate(headings):
        if needle in title.lower():
            match = (pos, i, depth, title)
            break

    if match is None:
        return {"command": "get", "entity": entity, "found": False,
                "count": 0, "results": []}

    pos, start_i, depth, title = match

    # Section ends at the next heading of equal-or-shallower depth.
    end_i = len(lines)
    for (i, d, _t) in headings[pos + 1:]:
        if d <= depth:
            end_i = i
            break

    results = []
    for offset in range(start_i, end_i):
        results.append({"file": rel, "line": offset + 1,
                        "text": lines[offset].rstrip()})

    return {"command": "get", "entity": entity, "found": True,
            "section": title, "section_line": start_i + 1,
            "count": len(results), "results": results}


def main(argv):
    if len(argv) < 2:
        print(json.dumps({"error": "usage: canon.py query <keywords...> | "
                                   "get <entity>"}))
        return 2

    cmd = argv[1]
    rest = argv[2:]

    if cmd == "query":
        out = cmd_query(rest)
    elif cmd == "get":
        out = cmd_get(" ".join(rest).strip())
    else:
        out = {"error": "unknown command %r; use 'query' or 'get'" % cmd}

    print(json.dumps(out, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
