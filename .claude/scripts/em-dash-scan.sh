#!/usr/bin/env bash
# Defense-in-depth final scanner. Catches banned tokens that reached disk via ANY path
# (Bash, external formatters, future write-like tools). Intended for PostToolUse(Bash) and Stop.
# Exit 2 surfaces violations back to Claude; it detects-and-surfaces, it does not prevent.
set -euo pipefail
root="${CLAUDE_PROJECT_DIR:-.}"
viol="$(ROOT="$root" python3 - <<'PY'
import re, os, glob
root = os.environ.get("ROOT", ".")
EM   = re.compile(r'\u2014')
DOUBLE = re.compile(r'(?<!-)--(?!-)')
FLAG = re.compile(r'(?:^|(?<=\s))--(?=[A-Za-z])')
def bad(line):
    if EM.search(line): return True
    flags = {m.start() for m in FLAG.finditer(line)}
    return any(m.start() not in flags for m in DOUBLE.finditer(line))
out = []
pats = [f"{root}/02-Manuscript/**/*.md", f"{root}/05-wrp/**/*.md", f"{root}/story-compendium.md"]
for pat in pats:
    for f in glob.glob(pat, recursive=True):
        try:
            for n, line in enumerate(open(f, encoding="utf-8", errors="replace"), 1):
                if bad(line): out.append(f"{f}:{n}:{line.rstrip()}")
        except IsADirectoryError:
            pass
print("\n".join(out[:20]))
PY
)"
if [[ -n "$viol" ]]; then
  printf '[EM-DASH SCAN] Banned tokens found on disk (non-Write/Edit path):\n%s\n' "$viol" >&2
  exit 2
fi
exit 0
