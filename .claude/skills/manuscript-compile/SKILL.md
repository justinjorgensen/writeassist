---
name: manuscript-compile
description: >-
  Concatenate the chapters in 02-Manuscript/ into one manuscript file, in
  chapter order, with zero dependencies and zero auth. Reach for it whenever the
  author says "compile the manuscript," "export the book," "stitch the chapters
  together," "give me one file to send out," or wants a single Markdown document
  for a beta reader, an editor, a word count, or a Pandoc/ebook conversion. This
  is the LOCAL export path: no MCP server, no network, no API keys, so it works
  on the first run of a fresh clone. Use it instead of the parked Drive sync when
  the author just wants a file on disk.
---

# manuscript-compile

A deterministic, dependency-free manuscript exporter for WriteAssist. It reads
the chapter Markdown files in `02-Manuscript/` and writes a single combined
manuscript, in chapter order. Python 3 standard library only: no pip installs,
no MCP server, no network, no credentials. It is the zero-dependency counterpart
to the parked, opt-in `sync-to-drive` integration.

## When to use it

- The author wants the whole book as one file to hand to a beta reader or editor.
- They want a single document to run a word count on, or to feed to Pandoc / an
  ebook converter.
- They want a local export and do not want to set up any MCP server or auth.

If the author specifically wants the manuscript pushed to Google Drive for
inline comments, that is the parked `integrations/sync-to-drive.md` command,
which needs the Drive MCP server. This skill is the path that always works.

## Chapter ordering

Files are ordered by the first integer in the filename, numerically. So
`Chapter-2.md` comes before `Chapter-10.md` (a plain alphabetical sort would get
that wrong). Files with no number in the name fall to the end, ordered among
themselves alphabetically. The order is fully deterministic, so two runs produce
identical output.

Use `--list` to preview the resolved order before compiling.

## Template handling

By default the script skips any file that still contains an unfilled bracketed
placeholder such as `[Chapter Title]`, so the stock `02-Manuscript/` template
file does not leak into an export. Pass `--include-template` to include them
anyway.

## How to run it

From the project root:

```bash
# Print the compiled manuscript to stdout
python3 .claude/skills/manuscript-compile/compile.py

# Write it to a file (parent directories are created if needed)
python3 .claude/skills/manuscript-compile/compile.py --out dist/manuscript.md

# Add a title page heading
python3 .claude/skills/manuscript-compile/compile.py \
  --title "The Lighthouse Keeper" --out dist/manuscript.md

# Preview chapter order without compiling
python3 .claude/skills/manuscript-compile/compile.py --list

# Compile a different folder (for example the bundled demo)
python3 .claude/skills/manuscript-compile/compile.py --src example --list
```

## Options

| Option | Effect |
|--------|--------|
| `--src DIR` | Source directory of chapter `.md` files. Default: `02-Manuscript/`. |
| `--out FILE` | Write the manuscript here. Default: print to stdout. |
| `--title TEXT` | Prepend a top-level `# TEXT` heading. |
| `--sep TEXT` | Separator between chapters. Default: a blank line, a Markdown rule, a blank line. |
| `--include-template` | Include blank/placeholder template files instead of skipping them. |
| `--list` | List the resolved chapter order and exit (no compile). |

The project root is found relative to the script and can be overridden with the
`WA_PROJECT_ROOT` environment variable, so the skill is portable to any
WriteAssist project.

## Output

The combined Markdown manuscript: each chapter's body, trimmed of trailing blank
lines, joined by the separator, with an optional title heading on top. When you
pass `--out`, a one-line summary (chapter count and word count) is printed to
stderr so stdout stays clean. The script preserves every chapter's em-dash-free
prose verbatim; it never rewrites content.

## Exit codes

- `0` success
- `1` no chapter files found to compile (for example, an empty `02-Manuscript/`
  or only template files with `--include-template` omitted)
- `2` source directory missing or unreadable

## Notes

- This skill only reads and concatenates. It does no formatting cleanup and adds
  no em dashes (the framework bans U+2014); whatever the chapters contain is what
  the manuscript contains.
- Pairs naturally with `prose-metrics`: compile to one file, then measure it.
