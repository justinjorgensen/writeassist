#!/usr/bin/env bash
# PostToolUse hook: blocks any Write/Edit that introduces em dashes to manuscript files.
# Enforces author-rules.md "ABSOLUTE ZERO TOLERANCE" at the harness level.
#
# Receives JSON on stdin from Claude Code (PostToolUse event). We pull the
# tool name and the file_path / new_string from the payload. Exit code 2 with
# stderr message tells Claude the tool call failed and surfaces the reason.
#
# Portability: the matcher runs in python3 (ubiquitous on macOS and Linux,
# and its regex engine supports lookbehind), NOT "grep -P". BSD grep on macOS
# has no PCRE support, so a "grep -P" matcher would silently no-op the headline
# demo on a reviewer's Mac. python3 keeps the behavior identical everywhere.

set -euo pipefail

payload="$(cat)"

# Only act on the prose files where em dashes are banned. Anything else is allowed.
# Scope is deliberately narrow: 02-Manuscript/, 05-wrp/, and story-compendium.md.
# Config files (author-rules.md) and planning notes (01-Planning) are excluded so
# that legitimate CLI flag examples (--limit) or punctuation rules cannot false-block.
file_path="$(printf '%s' "$payload" | jq -r '.tool_input.file_path // empty')"
if [[ -z "$file_path" ]]; then
  exit 0
fi

case "$file_path" in
  */02-Manuscript/*|*/05-wrp/*|*/story-compendium.md)
    ;;
  *)
    exit 0
    ;;
esac

# Check the file as it now stands on disk (PostToolUse runs after the write).
if [[ ! -f "$file_path" ]]; then
  exit 0
fi

# Match an em dash (U+2014) OR a double hyphen used as an em-dash substitute.
# We spare:
#   - "---" or longer runs of hyphens (markdown horizontal rules, frontmatter)
#   - "--flag" style CLI options: a "--" at a token boundary (preceded by
#     whitespace or start-of-line) and followed by a letter, e.g. "--limit"
# A "--" that attaches to a word, like "word--word" or "word -- word" used as an
# em-dash substitute, is still caught. The regex uses lookbehind/lookahead so a
# "--" only trips when it is NOT part of a 3+ dash run and NOT a CLI flag token.
matches="$(
  python3 - "$file_path" <<'PY'
import re, sys

path = sys.argv[1]

# An em dash always counts.
EM_DASH = re.compile(r'—')

# A bare double hyphen (exactly two, not part of "---" or longer) is the
# em-dash substitute we want to catch, e.g. "word--word" or "word -- word".
DOUBLE = re.compile(r'(?<!-)--(?!-)')

# A CLI flag token to spare: start-of-line or whitespace, then "--", then a
# letter, e.g. "--limit". We use this to exclude flag matches.
FLAG = re.compile(r'(?:^|(?<=\s))--(?=[A-Za-z])')

def offending(line):
    if EM_DASH.search(line):
        return True
    flag_spans = {m.start() for m in FLAG.finditer(line)}
    for m in DOUBLE.finditer(line):
        if m.start() not in flag_spans:
            return True
    return False

hits = []
with open(path, encoding="utf-8", errors="replace") as fh:
    for n, line in enumerate(fh, 1):
        if offending(line):
            hits.append(f"{n}:{line.rstrip()}")
            if len(hits) >= 5:
                break
sys.stdout.write("\n".join(hits))
PY
)"

if [[ -n "$matches" ]]; then
  cat >&2 <<EOF
[EM-DASH GUARD] Blocked: em-dash or double-hyphen detected in $file_path

$matches

WriteAssist enforces ABSOLUTE ZERO TOLERANCE for em dashes (author-rules.md).
Replace with: comma, colon, semicolon, parentheses, or full stop.
EOF
  exit 2
fi

exit 0
