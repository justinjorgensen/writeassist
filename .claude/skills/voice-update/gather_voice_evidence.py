#!/usr/bin/env python3
"""Gather voice-update evidence for the WriteAssist voice-update skill.

This helper does NOT make creative judgments. It collects the raw evidence an
agent needs before refreshing a voice profile:

  1. Which manuscript chapters are APPROVED (passed the review panel) and are
     therefore valid voice evidence. Approval is read from a chapter file's
     `**Status**:` line and/or the writing-tracker, matching the framework's
     PASS / Approved / Final markers.
  2. The current voice-profile target files (style-guide.md plus any documented
     character voice profiles) and whether they still contain unfilled
     `[placeholder]` slots (the "weak sections" a refresh should fix).
  3. Per-character dialogue line counts harvested from the approved chapters, so
     the agent can see which characters now have enough on-page speech to
     warrant a profile update.
  4. A scan for banned em dashes (U+2014) in every file it touches, since the
     framework forbids them.

Input:
  - argv[1] (optional): project root. Defaults to the current directory, then
    walks up until it finds author-rules.md / story-compendium.md.
  - stdin (optional): freeform author-feedback text. It is echoed back verbatim
    under "author_feedback" so the agent folds it into the refresh. The script
    does not interpret it.

Output: a single JSON object on stdout. Stdlib only, no third-party deps.
"""

import json
import os
import re
import sys

# Match the em dash by codepoint escape, never as an embedded literal byte.
EM_DASH = re.compile("\u2014")

# Status tokens that mean "this chapter passed the panel and is voice evidence".
APPROVED_RE = re.compile(
    r"\b(approved|passed|pass|final|done|complete[d]?|reviewed[\s\-]*pass)\b",
    re.IGNORECASE,
)

# Status line inside a chapter file, e.g. "**Status**: Approved".
STATUS_LINE_RE = re.compile(r"\*\*Status\*\*\s*:?\s*(.+)", re.IGNORECASE)

# The voice-profile files this skill refreshes. Relative to project root.
VOICE_PROFILE_TARGETS = [
    "04-Project-Management/style-guide.md",
    "project-config.md",
]

# A markdown placeholder slot still awaiting real content, e.g. "[First/Third]".
PLACEHOLDER_RE = re.compile(r"\[[^\]\n]{1,80}\]")

# A spoken dialogue line: a quoted span attributed to a Name via a dialogue tag.
# Conservative: requires a quote plus a "said/asked/<verb>" + Capitalized name,
# OR a "Name said/asked" lead-in. Used only as a coarse evidence signal.
DIALOGUE_TAG_RE = re.compile(
    r'(?:"[^"\n]{1,300}"\s*,?\s*(?:said|asked|replied|whispered|shouted|murmured|answered)\s+([A-Z][a-z]+)'
    r'|([A-Z][a-z]+)\s+(?:said|asked|replied|whispered|shouted|murmured|answered)\s*,?\s*"[^"\n]{1,300}")'
)


def find_project_root(start):
    cur = os.path.abspath(start)
    markers = ("author-rules.md", "story-compendium.md")
    while True:
        if any(os.path.isfile(os.path.join(cur, m)) for m in markers):
            return cur
        parent = os.path.dirname(cur)
        if parent == cur:
            return os.path.abspath(start)
        cur = parent


def read_text(path):
    try:
        with open(path, "r", encoding="utf-8") as fh:
            return fh.read()
    except (OSError, UnicodeDecodeError):
        return ""


def chapter_status(text):
    m = STATUS_LINE_RE.search(text)
    if not m:
        return None
    return m.group(1).strip()


def is_approved(status):
    return bool(status) and bool(APPROVED_RE.search(status))


def collect_chapters(root):
    """Find manuscript chapters and classify approval status."""
    approved, pending = [], []
    search_dirs = [
        os.path.join(root, "02-Manuscript"),
        os.path.join(root, "example"),
    ]
    for d in search_dirs:
        if not os.path.isdir(d):
            continue
        for name in sorted(os.listdir(d)):
            if not name.lower().endswith(".md"):
                continue
            low = name.lower()
            if "template" in low or "wrp" in low:
                continue
            if not re.search(r"chapter|ch[\-_ ]?\d", low):
                continue
            path = os.path.join(d, name)
            text = read_text(path)
            status = chapter_status(text)
            rel = os.path.relpath(path, root)
            entry = {
                "path": rel,
                "status": status,
                "em_dash_count": len(EM_DASH.findall(text)),
            }
            if is_approved(status):
                entry["dialogue_by_character"] = dialogue_counts(text)
                approved.append(entry)
            else:
                pending.append(entry)
    return approved, pending


def dialogue_counts(text):
    counts = {}
    for m in DIALOGUE_TAG_RE.finditer(text):
        name = m.group(1) or m.group(2)
        if name:
            counts[name] = counts.get(name, 0) + 1
    # Return as a sorted list of {character, lines} for stable JSON.
    return [
        {"character": k, "lines": v}
        for k, v in sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))
    ]


def inspect_profile_targets(root):
    targets = []
    for rel in VOICE_PROFILE_TARGETS:
        path = os.path.join(root, rel)
        if not os.path.isfile(path):
            targets.append({"path": rel, "exists": False})
            continue
        text = read_text(path)
        placeholders = PLACEHOLDER_RE.findall(text)
        targets.append(
            {
                "path": rel,
                "exists": True,
                "unfilled_placeholders": len(placeholders),
                "weak_section_samples": placeholders[:8],
                "em_dash_count": len(EM_DASH.findall(text)),
            }
        )
    return targets


def main():
    start = sys.argv[1] if len(sys.argv) > 1 else os.getcwd()
    root = find_project_root(start)

    feedback = ""
    if not sys.stdin.isatty():
        try:
            feedback = sys.stdin.read()
        except Exception:
            feedback = ""

    approved, pending = collect_chapters(root)
    targets = inspect_profile_targets(root)

    # Aggregate which characters now have enough approved on-page dialogue.
    char_totals = {}
    for ch in approved:
        for d in ch.get("dialogue_by_character", []):
            char_totals[d["character"]] = char_totals.get(d["character"], 0) + d["lines"]
    characters_with_new_evidence = [
        {"character": k, "approved_dialogue_lines": v}
        for k, v in sorted(char_totals.items(), key=lambda kv: (-kv[1], kv[0]))
    ]

    weak_profile_files = [
        t["path"]
        for t in targets
        if t.get("exists") and t.get("unfilled_placeholders", 0) > 0
    ]

    result = {
        "project_root": root,
        "approved_chapters": approved,
        "approved_count": len(approved),
        "pending_chapters": pending,
        "voice_profile_targets": targets,
        "weak_profile_files": weak_profile_files,
        "characters_with_new_evidence": characters_with_new_evidence,
        "author_feedback": feedback.strip(),
        "ready_to_refresh": len(approved) > 0,
        "notes": (
            "approved_chapters are the ONLY valid voice evidence (they passed "
            "the four-tier review panel). Refresh style-guide.md narrative voice "
            "plus each character voice profile from these chapters and any "
            "author_feedback. Never introduce em dashes (U+2014)."
        ),
    }
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
