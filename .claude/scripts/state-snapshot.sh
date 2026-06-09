#!/usr/bin/env bash
# PreCompact hook (also reusable on Stop).
#
# Writes a mechanical story-state snapshot to .claude/state/session-state.md so a
# fresh session (after compaction) starts oriented and goal drift is reduced on
# book-length work. This captures MECHANICAL state only (latest chapter, word
# count, last review decision, active WRP, timestamp). It does NOT inject context
# itself; state-restore.sh (SessionStart) does that.
#
# Hook I/O contract: a JSON event arrives on STDIN (session_id, transcript_path,
# cwd, hook_event_name, ...). We do not require any of it; if inputs are missing
# we still write what we can and exit 0 quietly so the session is never broken.
#
# Word-count logic is folded in from update-tracker.sh, but that script and
# writing-tracker.md are intentionally left untouched (writing-tracker.md remains
# the human-facing log).

# No `set -e`: grep/find returning non-zero on no-match is expected and must not
# abort the snapshot. We still guard against unset vars.
set -uo pipefail

# Drain any STDIN JSON event so the producer never blocks on a full pipe.
# We do not need its fields, but reading keeps the contract clean.
hook_payload=""
if [[ ! -t 0 ]]; then
  hook_payload="$(cat 2>/dev/null || true)"
fi
: "${hook_payload:=}"

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MANUSCRIPT_DIR="$PROJECT_ROOT/02-Manuscript"
WRP_DIR="$PROJECT_ROOT/05-wrp"
REVIEW_DIR="$PROJECT_ROOT/.claude/state/reviews"
STATE_DIR="$PROJECT_ROOT/.claude/state"
STATE_FILE="$STATE_DIR/session-state.md"

mkdir -p "$STATE_DIR" 2>/dev/null || true

timestamp="$(date '+%Y-%m-%d %H:%M:%S %Z')"

# --- Latest-edited chapter in 02-Manuscript (most recent mtime). -------------
latest_ch="none"
if [[ -d "$MANUSCRIPT_DIR" ]]; then
  found_ch="$(find "$MANUSCRIPT_DIR" -name '*.md' -printf '%T@ %f\n' 2>/dev/null \
    | sort -nr | head -1 | awk '{print $2}')"
  [[ -n "$found_ch" ]] && latest_ch="$found_ch"
fi

# --- Total manuscript word count (folded from update-tracker.sh). -----------
total_words="0"
if [[ -d "$MANUSCRIPT_DIR" ]]; then
  total_words="$(find "$MANUSCRIPT_DIR" -name '*.md' -exec cat {} + 2>/dev/null \
    | wc -w | tr -d ' ')"
  [[ -n "$total_words" ]] || total_words="0"
fi

# --- Most recent review decision (PASS|REVISE), if discoverable. ------------
# Reviews land in .claude/state/reviews/*.md with a "Decision: PASS|REVISE" line,
# matching the convention used by statusline.sh.
last_review="none recorded"
last_review_file=""
if [[ -d "$REVIEW_DIR" ]]; then
  latest_report="$(ls -t "$REVIEW_DIR"/*.md 2>/dev/null | head -1 || true)"
  if [[ -n "$latest_report" ]]; then
    last_review_file="$(basename "$latest_report")"
    decision="$(grep -oiE 'Decision:[[:space:]]*(PASS|REVISE)' "$latest_report" 2>/dev/null \
      | head -1 | grep -oiE 'PASS|REVISE' | tr 'a-z' 'A-Z' || true)"
    if [[ -n "$decision" ]]; then
      last_review="$decision (from $last_review_file)"
    else
      last_review="recorded in $last_review_file (no PASS/REVISE line found)"
    fi
  fi
fi

# --- Active WRP, if any (most recently edited plan in 05-wrp). ---------------
active_wrp="none"
if [[ -d "$WRP_DIR" ]]; then
  found_wrp="$(find "$WRP_DIR" -name '*.md' -printf '%T@ %f\n' 2>/dev/null \
    | sort -nr | head -1 | awk '{print $2}')"
  [[ -n "$found_wrp" ]] && active_wrp="$found_wrp"
fi

# --- Write the snapshot. Use a temp file + atomic move so a concurrent reader
#     never sees a half-written state file. ------------------------------------
tmp_file="$STATE_FILE.tmp.$$"
{
  echo "# Session State Snapshot"
  echo ""
  echo "Mechanical story state captured for cross-compaction continuity."
  echo "This file is machine-written by state-snapshot.sh. Do not hand-edit;"
  echo "the human-facing log is 04-Project-Management/writing-tracker.md."
  echo ""
  echo "- **Snapshot taken**: $timestamp"
  echo "- **Latest-edited chapter** (02-Manuscript): $latest_ch"
  echo "- **Total manuscript words**: $total_words"
  echo "- **Most recent review decision**: $last_review"
  echo "- **Active WRP** (05-wrp): $active_wrp"
} > "$tmp_file" 2>/dev/null || {
  # If even the temp write failed, do not break the session.
  rm -f "$tmp_file" 2>/dev/null || true
  exit 0
}

mv -f "$tmp_file" "$STATE_FILE" 2>/dev/null || {
  rm -f "$tmp_file" 2>/dev/null || true
  exit 0
}

exit 0
