#!/usr/bin/env bash
# SessionStart hook.
#
# Reads .claude/state/session-state.md (written by state-snapshot.sh on PreCompact
# /Stop) and injects it as additionalContext so a new session, especially one that
# resumes after compaction, starts oriented on book-length work. Also points the
# model at the orientation files: author-rules.md, the current chapter in
# 02-Manuscript, and 04-Project-Management/style-guide.md.
#
# Hook I/O contract: a JSON event arrives on STDIN (session_id, transcript_path,
# cwd, hook_event_name, source, ...). To inject startup context we print exactly:
#   {"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"<text>"}}
# then exit 0. If there is nothing useful to inject, or inputs are missing, we
# exit 0 quietly without printing so the session is never broken.

set -uo pipefail

# Drain STDIN JSON event (fields not required, but keep the contract clean).
hook_payload=""
if [[ ! -t 0 ]]; then
  hook_payload="$(cat 2>/dev/null || true)"
fi
: "${hook_payload:=}"

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MANUSCRIPT_DIR="$PROJECT_ROOT/02-Manuscript"
STATE_FILE="$PROJECT_ROOT/.claude/state/session-state.md"
AUTHOR_RULES="$PROJECT_ROOT/author-rules.md"
STYLE_GUIDE="$PROJECT_ROOT/04-Project-Management/style-guide.md"

# --- Gather the snapshot body, if present. -----------------------------------
snapshot_body=""
if [[ -f "$STATE_FILE" ]]; then
  snapshot_body="$(cat "$STATE_FILE" 2>/dev/null || true)"
fi

# --- Resolve the current chapter (most recently edited) for a direct pointer. -
current_chapter="(none yet)"
if [[ -d "$MANUSCRIPT_DIR" ]]; then
  found_ch="$(find "$MANUSCRIPT_DIR" -name '*.md' -printf '%T@ %f\n' 2>/dev/null \
    | sort -nr | head -1 | awk '{print $2}')"
  if [[ -n "$found_ch" ]]; then
    current_chapter="02-Manuscript/$found_ch"
  fi
fi

# --- Build the orientation pointers, only listing files that exist. ----------
pointers=""
[[ -f "$AUTHOR_RULES" ]] && pointers+="- Author rules: author-rules.md"$'\n'
[[ "$current_chapter" != "(none yet)" ]] && pointers+="- Current chapter: $current_chapter"$'\n'
[[ -f "$STYLE_GUIDE" ]] && pointers+="- Style guide: 04-Project-Management/style-guide.md"$'\n'

# --- Assemble the context text. ----------------------------------------------
context=""
if [[ -n "$snapshot_body" ]]; then
  context+="$snapshot_body"$'\n'
else
  context+="No prior session-state snapshot found (fresh project or first session)."$'\n'
fi
if [[ -n "$pointers" ]]; then
  context+=$'\n'"Orientation files to consult before continuing:"$'\n'"$pointers"
fi

# Nothing meaningful to inject? Exit quietly.
if [[ -z "${context//[$'\n\t ']/}" ]]; then
  exit 0
fi

# --- Emit as SessionStart additionalContext JSON. ----------------------------
# JSON-escape the text safely. Prefer python3; fall back to a minimal escaper.
if command -v python3 >/dev/null 2>&1; then
  printf '%s' "$context" | python3 -c '
import json, sys
text = sys.stdin.read()
out = {"hookSpecificOutput": {"hookEventName": "SessionStart", "additionalContext": text}}
sys.stdout.write(json.dumps(out))
' 2>/dev/null || exit 0
else
  # Minimal fallback: escape backslash, double-quote, newline, tab, CR.
  esc="$context"
  esc="${esc//\\/\\\\}"
  esc="${esc//\"/\\\"}"
  esc="${esc//$'\t'/\\t}"
  esc="${esc//$'\r'/\\r}"
  esc="${esc//$'\n'/\\n}"
  printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"%s"}}' "$esc"
fi

exit 0
