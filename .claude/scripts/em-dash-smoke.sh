#!/usr/bin/env bash
# Reusable smoke-test harness for the WriteAssist em-dash enforcement layer.
# Rerun after any change (scratch OR production) to confirm the guard + scanner still hold.
# Deterministic: drives the hook scripts with simulated payloads / files. No network, no claude -p.
# Usage: .claude/scripts/em-dash-smoke.sh   (exit 0 = all pass, nonzero = a failure)
set -uo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GUARD="$DIR/em-dash-guard.sh"
SCAN="$DIR/em-dash-scan.sh"
TMP="$(mktemp -d)"; export CLAUDE_PROJECT_DIR="$TMP"; mkdir -p "$TMP/02-Manuscript"
EM="$(python3 -c "import sys;sys.stdout.write(chr(0x2014))")"   # U+2014, never a literal in source
PASS=0; FAIL=0
# build a tool payload as JSON (python json.dumps -> safe escaping)
mk(){ python3 -c "import json,sys;print(json.dumps({'tool_name':sys.argv[1],'tool_input':json.loads(sys.argv[2])}))" "$1" "$2"; }
# assert guard exit code for a payload
g(){ local desc="$1" want="$2" payload="$3"; printf '%s' "$payload" | "$GUARD" >/dev/null 2>&1; local got=$?; if [[ "$got" == "$want" ]]; then echo "  PASS  $desc (exit $got)"; PASS=$((PASS+1)); else echo "  FAIL  $desc (want $want got $got)"; FAIL=$((FAIL+1)); fi; }
# assert scanner exit code
s(){ local desc="$1" want="$2"; "$SCAN" >/dev/null 2>&1; local got=$?; if [[ "$got" == "$want" ]]; then echo "  PASS  $desc (exit $got)"; PASS=$((PASS+1)); else echo "  FAIL  $desc (want $want got $got)"; FAIL=$((FAIL+1)); fi; }
MP="$TMP/02-Manuscript/ch.md"

echo "PreToolUse guard (2=deny before exec, 0=allow):"
g "AC1 Write content w/ em dash -> DENY"        2 "$(mk Write "{\"file_path\":\"$MP\",\"content\":\"He paused${EM}then ran.\"}")"
g "     Write clean -> allow"                    0 "$(mk Write "{\"file_path\":\"$MP\",\"content\":\"He paused, then ran.\"}")"
g "AC2 Edit new_string w/ em dash -> DENY"       2 "$(mk Edit "{\"file_path\":\"$MP\",\"old_string\":\"x\",\"new_string\":\"a${EM}b\"}")"
g "     Edit clean new_string -> allow"          0 "$(mk Edit "{\"file_path\":\"$MP\",\"old_string\":\"x\",\"new_string\":\"a, b\"}")"
g "AC3 MultiEdit one edit w/ em dash -> DENY"    2 "$(mk MultiEdit "{\"file_path\":\"$MP\",\"edits\":[{\"old_string\":\"p\",\"new_string\":\"clean\"},{\"old_string\":\"q\",\"new_string\":\"bad${EM}here\"}]}")"
g "     MultiEdit all clean -> allow"            0 "$(mk MultiEdit "{\"file_path\":\"$MP\",\"edits\":[{\"old_string\":\"p\",\"new_string\":\"clean\"},{\"old_string\":\"q\",\"new_string\":\"also clean\"}]}")"
g "     em dash to NON-manuscript -> allow"      0 "$(mk Write "{\"file_path\":\"$TMP/notes.md\",\"content\":\"x${EM}y\"}")"
g "AC6 --limit CLI flag spared -> allow"         0 "$(mk Write "{\"file_path\":\"$MP\",\"content\":\"run --limit 5\"}")"
g "     --- triple dash spared -> allow"         0 "$(mk Write "{\"file_path\":\"$MP\",\"content\":\"a --- b\"}")"
g "     word--word em substitute -> DENY"        2 "$(mk Write "{\"file_path\":\"$MP\",\"content\":\"wait--stop\"}")"

echo "AC4 Edit partial-replacement (insert blocked; preserved pre-existing caught by scanner):"
# Pre-existing banned content reaches disk via a non-guarded path (stand-in for Bash):
printf 'pre-existing %sline\n' "$EM" > "$MP"
g "     Edit with CLEAN new_string is allowed (guard only inspects inserted text)" 0 "$(mk Edit "{\"file_path\":\"$MP\",\"old_string\":\"foo\",\"new_string\":\"bar baz\"}")"
s "     scanner catches the preserved pre-existing em dash on disk -> DENY" 2

echo "AC5 Bash bypass + scanner catch:"
echo "  NOTE  guard matcher is Write|Edit|MultiEdit, so Bash is structurally never sent to the guard (bypass by design)."
s "     scanner still flags the bash-written file -> DENY"        2
rm -f "$MP"
s "     clean manuscript -> allow"                                0

echo
echo "RESULT: $PASS passed, $FAIL failed"
rm -rf "$TMP"
[[ "$FAIL" == 0 ]]
