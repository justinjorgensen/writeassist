#!/usr/bin/env bash
# PreToolUse hook: DENIES any Write/Edit that would introduce em dashes to
# manuscript files, BEFORE the content reaches disk. Exit code 2 on
# PreToolUse blocks the tool call entirely.
#
# Receives JSON on stdin from Claude Code (PreToolUse event). We inspect the
# proposed content (tool_input.content for Write, tool_input.new_string for
# Edit) rather than the file on disk. The companion PostToolUse script
# (em-dash-guard.sh) remains as a backstop scan of the file as written.

set -euo pipefail

payload="$(cat)"

# Only act on manuscript/planning/wrp files. Anything outside the writing dirs is allowed.
file_path="$(printf '%s' "$payload" | jq -r '.tool_input.file_path // empty')"
if [[ -z "$file_path" ]]; then
  exit 0
fi

case "$file_path" in
  */02-Manuscript/*|*/01-Planning/*|*/05-wrp/*|*/story-compendium.md|*/author-rules.md)
    ;;
  *)
    exit 0
    ;;
esac

# Proposed text: Write sends .content, Edit sends .new_string.
proposed="$(printf '%s' "$payload" | jq -r '(.tool_input.content // "") + "\n" + (.tool_input.new_string // "")')"

# Em dash (U+2014) or double-hyphen (--) used as em-dash substitute.
# Excludes runs of 3+ dashes (markdown rules / frontmatter delimiters).
PATTERN='\x{2014}|(?<!-)--(?!-)'
if printf '%s' "$proposed" | grep -nP "$PATTERN" >/dev/null; then
  matches="$(printf '%s' "$proposed" | grep -nP "$PATTERN" | head -5)"
  cat >&2 <<EOF
[EM-DASH GUARD / PRE] Denied: the proposed edit to $file_path contains an em dash or double-hyphen.

$matches

WriteAssist enforces ABSOLUTE ZERO TOLERANCE for em dashes (author-rules.md).
Replace with: comma, colon, semicolon, parentheses, or full stop. Nothing was written to disk.
EOF
  exit 2
fi

exit 0
