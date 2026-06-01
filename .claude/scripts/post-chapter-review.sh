#!/usr/bin/env bash
# PostToolUse hook (optional, opt-in via WRITEASSIST_AUTO_REVIEW=1):
# When a manuscript chapter file is saved, drop a marker file that the next
# user turn can pick up and run /review-chapter against.
#
# We deliberately do NOT call Claude here (no recursive invocations). Instead
# we leave a breadcrumb in .claude/.pending-review that Claude can read.

set -euo pipefail

[[ "${WRITEASSIST_AUTO_REVIEW:-0}" = "1" ]] || exit 0

payload="$(cat)"
file_path="$(printf '%s' "$payload" | jq -r '.tool_input.file_path // empty')"

case "$file_path" in
  */02-Manuscript/Chapter-*.md|*/02-Manuscript/Scene-*.md)
    PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
    mkdir -p "$PROJECT_ROOT/.claude/state"
    echo "$file_path" >> "$PROJECT_ROOT/.claude/state/pending-review.txt"
    ;;
esac

exit 0
