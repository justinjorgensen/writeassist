#!/usr/bin/env bash
# Framework lint: catches the drift classes fixed in the 2026-07-03 remediation.
# Exits nonzero with a findings list if any rule is violated. Run from anywhere.

set -uo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$PROJECT_ROOT"

FAIL=0
finding() {
  FAIL=1
  printf 'LINT: %s\n' "$1"
}

# ---------------------------------------------------------------------------
# 1a. No literal em dash (U+2014) anywhere in the repo.
# ---------------------------------------------------------------------------
while IFS= read -r hit; do
  finding "literal em dash (U+2014): $hit"
done < <(grep -rnP '\x{2014}' . --exclude-dir=.git --exclude-dir=node_modules 2>/dev/null | cut -d: -f1,2)

# ---------------------------------------------------------------------------
# 1b. No bare -- (em-dash substitute) in manuscript dirs. Runs of 3+ dashes
#     (markdown rules / frontmatter) are allowed.
# ---------------------------------------------------------------------------
for dir in 02-Manuscript 01-Planning 05-wrp; do
  [[ -d "$dir" ]] || continue
  while IFS= read -r hit; do
    finding "bare double-hyphen in manuscript dir: $hit"
  done < <(grep -rnP '(?<!-)--(?!-)' "$dir" --include='*.md' 2>/dev/null | cut -d: -f1,2)
done

# ---------------------------------------------------------------------------
# 2. Agent references resolve: no snake_case variant of any real agent name,
#    and every subagent_type-style backtick reference resolves to a file.
# ---------------------------------------------------------------------------
AGENTS_DIR=".claude/agents"
for f in "$AGENTS_DIR"/*.md; do
  name="$(basename "$f" .md)"
  snake="${name//-/_}"
  [[ "$snake" == "$name" ]] && continue
  while IFS= read -r hit; do
    finding "snake_case agent reference '$snake' (should be '$name'): $hit"
  done < <(grep -rnw "$snake" .claude CLAUDE.md project-config.md MIGRATION.md --include='*.md' 2>/dev/null \
             | grep -v '\.claude/docs/archive/' | cut -d: -f1,2)
done

# subagent_type values named in command/doc tables must exist as agent files
while IFS= read -r line; do
  file="${line%%:*}"
  agent="$(printf '%s' "$line" | grep -oP '(?<=subagent_type">)[a-z-]+|(?<=subagent_type: )[a-z-]+' | head -1)"
  [[ -z "$agent" ]] && continue
  [[ "$agent" == "general-purpose" ]] && { finding "generic agent spawn (must be a named agent): $file"; continue; }
  [[ -f "$AGENTS_DIR/$agent.md" ]] || finding "subagent_type '$agent' has no agent file: $file"
done < <(grep -rn 'subagent_type' .claude/commands .claude/docs --include='*.md' 2>/dev/null | grep -v '\.claude/docs/archive/')

# ---------------------------------------------------------------------------
# 3. /command references resolve to .claude/commands/ (or known built-ins).
# ---------------------------------------------------------------------------
BUILTINS='code-review|goal|help|clear|config|fast|schedule|loop|init|review'
PATHWORDS='tmp|home|usr|etc|var|dev|bin|opt'
while IFS= read -r line; do
  file="${line%%:*}"
  rest="${line#*:*:}"
  for cmd in $(printf '%s' "$rest" | grep -oP '(?<=[ `(>])/[a-z][a-z0-9-]{2,}(?=[ `.,)\x27]|$)' | sed 's|^/||' | sort -u); do
    [[ "$cmd" =~ ^($BUILTINS)$ ]] && continue
    [[ "$cmd" =~ ^($PATHWORDS)$ ]] && continue
    [[ -f ".claude/commands/$cmd.md" ]] || finding "unresolved /command reference '/$cmd': $file"
  done
done < <(grep -rn ' /[a-z][a-z0-9-]\{2,\}\|`/[a-z][a-z0-9-]\{2,\}' .claude CLAUDE.md project-config.md --include='*.md' 2>/dev/null \
           | grep -v '\.claude/docs/archive/' | grep -v 'https\?://' | grep -vE '(^|[^ `(>])/(home|tmp|usr|projects|claude)')

# ---------------------------------------------------------------------------
# 4. Gate numbers only in review-engine.md: the 8.0 threshold, tier-value
#    mappings, and dimension weights must not be restated elsewhere.
# ---------------------------------------------------------------------------
while IFS= read -r hit; do
  finding "gate number outside review-engine.md: $hit"
done < <(grep -rnE '8\.0|Strong Pass ?= ?10|Pass ?= ?8|Needs Work ?= ?6|Fail ?= ?4|12\.5%|Continuity ?= ?20%' \
           CLAUDE.md project-config.md .claude/commands .claude/skills .claude/agents .claude/docs 2>/dev/null \
           | grep -v 'review-engine\.md' | grep -v '\.claude/docs/archive/' | cut -d: -f1,2)

# ---------------------------------------------------------------------------
# 5. Every command file has YAML frontmatter.
# ---------------------------------------------------------------------------
for f in .claude/commands/*.md; do
  [[ "$(head -1 "$f")" == "---" ]] || finding "missing frontmatter: $f"
done

# ---------------------------------------------------------------------------
# 6. agent-roster doc matches the agents directory exactly.
# ---------------------------------------------------------------------------
ROSTER=".claude/docs/agent-roster.md"
if [[ -f "$ROSTER" ]]; then
  diff_out="$(diff <(ls "$AGENTS_DIR" | sed 's/\.md$//' | sort) \
                   <(grep -oP '(?<=^\| `)[a-z-]+(?=`)' "$ROSTER" | sort) 2>&1)" \
    || finding "agent-roster.md does not match agents dir:${diff_out:+ $diff_out}"
else
  finding "missing $ROSTER"
fi

# ---------------------------------------------------------------------------
if [[ "$FAIL" -eq 0 ]]; then
  echo "lint-framework: OK"
else
  echo "lint-framework: FAILED (see findings above)"
fi
exit "$FAIL"
