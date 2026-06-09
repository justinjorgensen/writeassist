#!/usr/bin/env python3
"""compile.py - zero-dependency manuscript export for WriteAssist.

Concatenates the chapter Markdown files in 02-Manuscript/ into a single
manuscript file, in chapter order. No MCP server, no network, no auth, no pip
installs (Python 3 standard library only). This is the LOCAL export path: it
works on the first run of a fresh clone.

Chapter ordering:
  Files are ordered by the FIRST integer found in the filename (so
  Chapter-2.md sorts before Chapter-10.md, unlike plain lexical sort). Files
  with no number fall to the end, ordered lexically among themselves. Ties
  break on the lowercased filename for determinism.

Usage:
  python3 .claude/skills/manuscript-compile/compile.py [options]

Options:
  --src DIR        Source directory of chapter .md files
                   (default: <project root>/02-Manuscript)
  --out FILE       Write the compiled manuscript here
                   (default: print to stdout)
  --title TEXT     Prepend a top-level "# TEXT" title heading
  --sep TEXT       Separator placed between chapters
                   (default: a blank line, a Markdown rule, a blank line)
  --include-template
                   Include files that look like blank templates. By default a
                   file is skipped when it contains an unfilled placeholder such
                   as "[Chapter Title]" so the stock 02-Manuscript template does
                   not leak into an export.
  --list           List the resolved chapter order and exit (no compile).

Project root is resolved relative to this script
(<root>/.claude/skills/manuscript-compile/compile.py -> <root>) and can be
overridden with the WA_PROJECT_ROOT environment variable.

Exit codes:
  0  success
  1  no chapter files found to compile
  2  source directory missing or unreadable
"""

import argparse
import os
import re
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
# <root>/.claude/skills/manuscript-compile/compile.py -> <root>
DEFAULT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", "..", ".."))
PROJECT_ROOT = os.environ.get("WA_PROJECT_ROOT", DEFAULT_ROOT)

DEFAULT_SRC = os.path.join(PROJECT_ROOT, "02-Manuscript")
DEFAULT_SEP = "\n\n---\n\n"

# A file that still carries one of these bracketed placeholders is treated as an
# unfilled template and skipped unless --include-template is passed.
PLACEHOLDER_RE = re.compile(
    r"\[(?:chapter title|opening line[^\]]*|first paragraph[^\]]*|"
    r"continue narrative[^\]]*|update after writing|any notes[^\]]*)\]",
    re.IGNORECASE,
)

FIRST_INT_RE = re.compile(r"\d+")


def first_int(name):
    """Return the first integer in a filename, or None if there is none."""
    m = FIRST_INT_RE.search(name)
    return int(m.group()) if m else None


def sort_key(name):
    """Order by first embedded integer (numeric, not lexical); unnumbered last.

    Returns a tuple so unnumbered files sort after numbered ones, with a
    lowercased-name tiebreaker for full determinism.
    """
    n = first_int(name)
    if n is None:
        return (1, 0, name.lower())
    return (0, n, name.lower())


def looks_like_template(text):
    """True if the text still contains an unfilled WriteAssist placeholder."""
    return PLACEHOLDER_RE.search(text) is not None


def gather_chapters(src, include_template):
    """Return (chapters, skipped) where chapters is a list of (path, text)."""
    names = [
        n for n in os.listdir(src)
        if n.lower().endswith(".md") and os.path.isfile(os.path.join(src, n))
    ]
    names.sort(key=sort_key)

    chapters = []
    skipped = []
    for name in names:
        path = os.path.join(src, name)
        with open(path, "r", encoding="utf-8") as fh:
            text = fh.read()
        if not include_template and looks_like_template(text):
            skipped.append(name)
            continue
        chapters.append((path, text))
    return chapters, skipped


def compile_manuscript(chapters, title, sep):
    """Join chapter texts into one manuscript string."""
    parts = []
    if title:
        parts.append("# " + title + "\n")
    bodies = [text.rstrip("\n") for _, text in chapters]
    parts.append(sep.join(bodies))
    out = "\n".join(parts)
    if not out.endswith("\n"):
        out += "\n"
    return out


def main(argv=None):
    parser = argparse.ArgumentParser(
        description="Concatenate 02-Manuscript/*.md into one manuscript file."
    )
    parser.add_argument("--src", default=DEFAULT_SRC,
                        help="source directory of chapter .md files")
    parser.add_argument("--out", default=None,
                        help="output file (default: stdout)")
    parser.add_argument("--title", default=None,
                        help="prepend a top-level title heading")
    parser.add_argument("--sep", default=DEFAULT_SEP,
                        help="separator between chapters")
    parser.add_argument("--include-template", action="store_true",
                        help="include blank/placeholder template files")
    parser.add_argument("--list", action="store_true",
                        help="list the resolved chapter order and exit")
    args = parser.parse_args(argv)

    if not os.path.isdir(args.src):
        sys.stderr.write(
            "error: source directory not found: {}\n".format(args.src)
        )
        return 2

    try:
        chapters, skipped = gather_chapters(args.src, args.include_template)
    except OSError as exc:
        sys.stderr.write("error: {}\n".format(exc))
        return 2

    if args.list:
        for path, _ in chapters:
            print(os.path.basename(path))
        for name in skipped:
            print("(skipped template) " + name)
        return 0 if chapters else 1

    if not chapters:
        hint = ""
        if skipped:
            hint = (
                " ({} file(s) skipped as unfilled templates; pass "
                "--include-template to include them)".format(len(skipped))
            )
        sys.stderr.write(
            "error: no chapter files to compile in {}{}\n".format(args.src, hint)
        )
        return 1

    manuscript = compile_manuscript(chapters, args.title, args.sep)

    if args.out:
        out_dir = os.path.dirname(os.path.abspath(args.out))
        if out_dir and not os.path.isdir(out_dir):
            os.makedirs(out_dir, exist_ok=True)
        with open(args.out, "w", encoding="utf-8") as fh:
            fh.write(manuscript)
        words = len(manuscript.split())
        sys.stderr.write(
            "compiled {} chapter(s), {} words -> {}\n".format(
                len(chapters), words, args.out
            )
        )
        if skipped:
            sys.stderr.write(
                "skipped {} template file(s): {}\n".format(
                    len(skipped), ", ".join(skipped)
                )
            )
    else:
        sys.stdout.write(manuscript)

    return 0


if __name__ == "__main__":
    sys.exit(main())
