#!/usr/bin/env bash
# Stop hook: appends a session summary to 04-Project-Management/writing-tracker.md.
# Counts new words across 02-Manuscript/ since the session started.

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
TRACKER="$PROJECT_ROOT/04-Project-Management/writing-tracker.md"
MANUSCRIPT_DIR="$PROJECT_ROOT/02-Manuscript"

[[ -d "$MANUSCRIPT_DIR" ]] || exit 0
[[ -f "$TRACKER" ]] || exit 0

# Total current word count
total_words="$(find "$MANUSCRIPT_DIR" -name '*.md' -exec cat {} + 2>/dev/null | wc -w)"
date_now="$(date '+%Y-%m-%d %H:%M')"

# Recently modified chapters (last hour)
recent="$(find "$MANUSCRIPT_DIR" -name '*.md' -mmin -60 -printf '%f ' 2>/dev/null)"

{
  echo ""
  echo "### $date_now"
  echo "- Total manuscript words: **$total_words**"
  [[ -n "$recent" ]] && echo "- Touched this session: $recent"
} >> "$TRACKER"

exit 0
