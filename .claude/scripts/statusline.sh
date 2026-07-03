#!/usr/bin/env bash
# Custom statusline for WriteAssist.
# Receives JSON on stdin from Claude Code with session info; outputs a one-line
# status to stdout.
#
# Displays:  [model] | proj-name | chapter-active | words today/total | em-dashes | review-score
set -uo pipefail
# Note: no `set -e`. Grep returning 1 on no-match is expected here and we
# want the script to keep running so it always emits a status line.

payload="$(cat || true)"

# Pull model + cwd from the payload; fall back to env if jq missing.
if command -v jq >/dev/null 2>&1; then
  model="$(printf '%s' "$payload" | jq -r '.model.display_name // .model.id // "claude"')"
  cwd="$(printf '%s' "$payload" | jq -r '.workspace.current_dir // .cwd // empty')"
else
  model="claude"
  cwd=""
fi
[[ -n "$cwd" ]] || cwd="$PWD"

PROJECT_ROOT="$cwd"
# Walk up until we find a 02-Manuscript or hit /
while [[ "$PROJECT_ROOT" != "/" && ! -d "$PROJECT_ROOT/02-Manuscript" ]]; do
  PROJECT_ROOT="$(dirname "$PROJECT_ROOT")"
done

MANUSCRIPT="$PROJECT_ROOT/02-Manuscript"
if [[ ! -d "$MANUSCRIPT" ]]; then
  echo "[$model] (not in a WriteAssist project)"
  exit 0
fi

proj_name="$(basename "$PROJECT_ROOT")"

# Total manuscript word count
total_words=$(find "$MANUSCRIPT" -name '*.md' -exec cat {} + 2>/dev/null | wc -w | tr -d ' ')

# Most-recently-edited chapter
latest_ch="$(find "$MANUSCRIPT" -name '*.md' -printf '%T@ %f\n' 2>/dev/null | sort -nr | head -1 | awk '{print $2}')"
latest_ch="${latest_ch:-...}"

# Em-dash count across manuscript (should be 0)
emdash_count=$(grep -rhoP '—|(?<!-)--(?!-)' "$MANUSCRIPT" 2>/dev/null | wc -l | tr -d ' ')

# Last review score (look for `Predicted Panel Result` or any "X/10" in latest review report)
review_dir="$PROJECT_ROOT/.claude/state/reviews"
last_score="..."
if [[ -d "$review_dir" ]]; then
  latest_report="$(ls -t "$review_dir"/*.md 2>/dev/null | head -1 || true)"
  if [[ -n "$latest_report" ]]; then
    last_score="$(grep -oE '[0-9]+\.[0-9]+/10' "$latest_report" | head -1 || echo '...')"
  fi
fi

# Color codes (ANSI)
DIM=$'\033[2m'
RESET=$'\033[0m'
GREEN=$'\033[32m'
RED=$'\033[31m'
YELLOW=$'\033[33m'

# Em-dash color: green if 0, red otherwise
if [[ "$emdash_count" = "0" ]]; then
  emdash_str="${GREEN}em-dash:0${RESET}"
else
  emdash_str="${RED}em-dash:${emdash_count}${RESET}"
fi

printf '%s[%s]%s %s %s│%s %s %s│%s %s words %s│%s %s %s│%s last:%s\n' \
  "$DIM" "$model" "$RESET" \
  "$proj_name" \
  "$DIM" "$RESET" "$latest_ch" \
  "$DIM" "$RESET" "$total_words" \
  "$DIM" "$RESET" "$emdash_str" \
  "$DIM" "$RESET" "$last_score"
