#!/usr/bin/env bash
# UserPromptSubmit hook for WriteAssist (Enhancement 2: live hard constraints).
#
# Injects a SHORT additionalContext reminder of the project's HARD constraints
# (zero em dashes, POV, tense) before the model sees each prompt, so a long
# drafting session never drifts mid-chapter.
#
# Contract for UserPromptSubmit:
#   * print {"hookSpecificOutput":{"hookEventName":"UserPromptSubmit",
#           "additionalContext":"<text>"}} then exit 0 to inject context.
#   * NEVER exit 2 here (that would BLOCK the user's prompt).
#   * If anything is missing or off-project, exit 0 quietly so the session
#     is never broken.
#
# Kept deliberately tiny: only a few bullet lines are injected per turn.
set -uo pipefail
# No `set -e`: grep returning 1 on no-match is normal and must not abort us.

# --- Read the hook event JSON from stdin (session_id, cwd, hook_event_name...) ---
payload="$(cat 2>/dev/null || true)"

# --- Resolve cwd from the payload (fall back to $PWD) ---
cwd=""
if [[ -n "$payload" ]] && command -v jq >/dev/null 2>&1; then
  cwd="$(printf '%s' "$payload" | jq -r '.cwd // .workspace.current_dir // empty' 2>/dev/null || true)"
fi
[[ -n "$cwd" ]] || cwd="${PWD:-}"
[[ -n "$cwd" ]] || exit 0

# --- Walk up to find the WriteAssist project root (the dir with 02-Manuscript) ---
root="$cwd"
while [[ "$root" != "/" && ! -d "$root/02-Manuscript" ]]; do
  root="$(dirname "$root")"
done
# Not a WriteAssist project: stay silent.
[[ -d "$root/02-Manuscript" ]] || exit 0

rules="$root/author-rules.md"
config="$root/project-config.md"
# No rules file to read from: nothing useful to inject, exit quietly.
[[ -f "$rules" ]] || exit 0

# --- Build the reminder bullets in Python (codepoint-safe em-dash handling) ---
# Pass file paths via env; Python parses the HARD CONSTRAINTS block plus the
# Narrative Voice line and emits a compact JSON object on stdout, or nothing.
WA_RULES="$rules" WA_CONFIG="$config" python3 - <<'PYEOF' || exit 0
import os, re, json, sys

rules_path  = os.environ.get("WA_RULES", "")
config_path = os.environ.get("WA_CONFIG", "")

def read(p):
    try:
        with open(p, encoding="utf-8", errors="replace") as fh:
            return fh.read()
    except Exception:
        return ""

rules = read(rules_path)
if not rules:
    sys.exit(0)

# Em dash is matched by codepoint escape, never a literal byte.
EM = "\u2014"

# Isolate the HARD CONSTRAINTS section: from its heading to the next "## " heading.
hard = ""
m = re.search(r'^#{1,6}\s.*HARD CONSTRAINTS.*$', rules, re.M | re.I)
if m:
    start = m.end()
    nxt = re.search(r'^##\s', rules[start:], re.M)
    hard = rules[start: start + nxt.start()] if nxt else rules[start:]

bullets = []

# 1) Em-dash ban: only assert it if the hard section actually says so.
if re.search(r'EM[\s-]?DASH', hard, re.I) or EM in hard:
    bullets.append("ZERO em dashes (use comma, colon, semicolon, parentheses, or full stop)")

# 2) POV + tense. Prefer concrete values from project-config Narrative Voice;
#    fall back to the author-rules MANDATE lines / hard section if present.
pov_tense = ""
cfg = read(config_path)
mv = re.search(r'Narrative Voice\**\s*:\s*(.+)', cfg) if cfg else None
if mv:
    val = mv.group(1).strip().strip("`").strip()
    # Skip unfilled template placeholders like "[First/Third person, ...]".
    if val and not val.startswith("["):
        pov_tense = val
if not pov_tense:
    mp = re.search(r'MAINTAIN consistent POV[^\n]*', rules, re.I)
    mt = re.search(r'MAINTAIN consistent tense[^\n]*', rules, re.I)
    pick = []
    for mm in (mp, mt):
        if not mm:
            continue
        seg = mm.group(0)
        # Only surface a bracketed spec if it has been filled in.
        b = re.search(r'\[([^\]]+)\]', seg)
        if b and "/" not in b.group(1):
            pick.append(b.group(1).strip())
    pov_tense = ", ".join(pick)
if pov_tense:
    bullets.append("Voice: %s" % pov_tense)

# 3) A couple more high-signal narrative HARD rules, if declared.
if re.search(r'head[\s-]?hop', hard, re.I):
    bullets.append("Strict POV per scene (no head-hopping)")
if re.search(r'filter words', hard, re.I):
    bullets.append("No filter words (saw/felt/heard); show, do not tell")

if not bullets:
    sys.exit(0)

text = "HARD constraints (author-rules.md), hold these every line:\n" + \
       "\n".join("- " + b for b in bullets)

out = {"hookSpecificOutput": {
    "hookEventName": "UserPromptSubmit",
    "additionalContext": text,
}}
print(json.dumps(out))
PYEOF

exit 0
