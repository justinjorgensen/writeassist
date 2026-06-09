#!/usr/bin/env python3
# PreToolUse check for WriteAssist. Reads the hook JSON payload directly from STDIN and
# denies (exit 2) when a Write/Edit/MultiEdit would introduce a banned em-dash token to a
# manuscript file. Reading from stdin avoids passing large chapter text through an
# environment variable or argv (OS size limits) and avoids any heredoc/stdin collision.
import sys, json, re

EM     = re.compile(r'\u2014')                     # em dash, by codepoint escape (never a literal byte)
DOUBLE = re.compile(r'(?<!-)--(?!-)')              # bare double-hyphen em substitute
FLAG   = re.compile(r'(?:^|(?<=\s))--(?=[A-Za-z])')# spare --flag CLI tokens

def in_scope(fp):
    return ("/02-Manuscript/" in fp) or ("/05-wrp/" in fp) or fp.endswith("/story-compendium.md")

def line_is_bad(line):
    if EM.search(line):
        return True
    flags = {m.start() for m in FLAG.finditer(line)}
    return any(m.start() not in flags for m in DOUBLE.finditer(line))

def main():
    try:
        payload = json.load(sys.stdin)
    except Exception:
        return 0  # malformed or empty payload: do not block
    ti = payload.get("tool_input") or {}
    fp = ti.get("file_path") or ""
    if not fp or not in_scope(fp):
        return 0
    parts = []
    if ti.get("content") is not None:
        parts.append(ti["content"])
    if ti.get("new_string") is not None:
        parts.append(ti["new_string"])
    for e in (ti.get("edits") or []):
        if isinstance(e, dict) and e.get("new_string") is not None:
            parts.append(e["new_string"])
    pending = "\n".join(parts)
    if not pending:
        return 0
    hits = [f"{n}:{ln}" for n, ln in enumerate(pending.splitlines(), 1) if line_is_bad(ln)]
    if hits:
        sys.stderr.write(
            "[EM-DASH GUARD] DENIED before write to %s\n\n%s\n\n"
            "WriteAssist bans the em dash (author-rules.md). "
            "Replace with: comma, colon, semicolon, parentheses, or full stop.\n"
            % (fp, "\n".join(hits[:5]))
        )
        return 2
    return 0

if __name__ == "__main__":
    sys.exit(main())
