#!/usr/bin/env bash
# PostToolUse hook: blocks any Write/Edit that introduces em dashes to manuscript files.
# Enforces author-rules.md "ABSOLUTE ZERO TOLERANCE" at the harness level.
#
# Receives JSON on stdin from Claude Code (PostToolUse event). We pull the
# tool name and the file_path / new_string from the payload. Exit code 2 with
# stderr message tells Claude the tool call failed and surfaces the reason.

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

# Check the file as it now stands on disk (PostToolUse runs after the write).
if [[ ! -f "$file_path" ]]; then
  exit 0
fi

# Grep for em dash (—) or double-hyphen (--) used as em-dash substitute.
# Excludes markdown horizontal rules / frontmatter delimiters (---), so we
# only flag `--` that isn't part of a run of 3+ dashes.
PATTERN='—|(?<!-)--(?!-)'
if grep -nP "$PATTERN" "$file_path" >/dev/null; then
  matches="$(grep -nP "$PATTERN" "$file_path" | head -5)"
  cat >&2 <<EOF
[EM-DASH GUARD] Blocked: em-dash or double-hyphen detected in $file_path

$matches

WriteAssist enforces ABSOLUTE ZERO TOLERANCE for em dashes (author-rules.md).
Replace with: comma, colon, semicolon, parentheses, or full stop.
EOF
  exit 2
fi

exit 0
