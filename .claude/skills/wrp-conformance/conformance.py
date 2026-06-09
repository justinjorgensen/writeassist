#!/usr/bin/env python3
"""wrp-conformance: check a written chapter against the beats its WRP specified.

Usage:
    conformance.py <chapter.md> <wrp.md>

Parses the WRP for required beats (markdown headers + bullet lists), then
heuristically scores each beat present / weak / missing by keyword and entity
overlap against the chapter text. Prints JSON to stdout:

    {"beats": [{"beat": str, "status": str, "evidence": str}, ...],
     "summary": {"present": int, "weak": int, "missing": int}}
"""

import json
import re
import sys

# Match an em dash by codepoint, never an embedded literal byte. This framework
# bans U+2014; we expose a detector for callers that want it.
EM_DASH = re.compile(r"\u2014")

# Stopwords kept small and stdlib-only; we want content words to drive overlap.
STOPWORDS = frozenset("""
a an the and or but if then else of to in on at by for with without from into onto
is are was were be been being am do does did have has had will would shall should
can could may might must this that these those it its they them their he she his her
him you your we our us i me my as so not no yes none na nan n/a at-most one short
line addressed who whom which what when where why how out off up down over under
primary supporting cast focus purpose pov setting conflict elements scene chapter
title word target words emotional arc key question previous summary characters plot
progress unresolved content planning establish repeat core dialogue requirements
description balance action internal thought theme integration subtle references
pacing notes success criteria reader feels feel without being told zero em dashes
demo synthetic illustrative example ready execution phase first present felt shown
page hint naming named name turn near end most about moment matching slow measured
""".split())

WORD_RE = re.compile(r"[A-Za-z][A-Za-z'\-]+")

# Section headers we treat as non-beats (overview/meta, not on-page requirements
# that the prose itself must satisfy). Everything else under a header becomes a beat.
SKIP_HEADER_KEYWORDS = (
    "previous chapter",
    "what not to repeat",
    "word target",
    "description balance",
    "pacing notes",
)


def tokens(text):
    return {w.lower() for w in WORD_RE.findall(text) if len(w) > 2}


def content_tokens(text):
    return {t for t in tokens(text) if t not in STOPWORDS}


def entities(text):
    """Capitalized words that are not at the very start of a line / sentence proxy.

    We approximate proper nouns: capitalized tokens that are not common sentence
    starters. Cheap but useful for catching named characters (Aldous) etc.
    """
    out = set()
    for m in re.finditer(r"\b([A-Z][a-z]{2,})\b", text):
        w = m.group(1)
        if w.lower() not in STOPWORDS:
            out.add(w)
    return out


def parse_wrp_beats(wrp_text):
    """Extract beats from the WRP.

    A beat is a bullet line, or a numbered success-criterion line, captured with
    the header section it lives under so we can skip meta sections.
    """
    beats = []
    current_header = ""
    skip_section = False

    for raw in wrp_text.splitlines():
        line = raw.rstrip()
        stripped = line.strip()

        header_match = re.match(r"^#{1,6}\s+(.*)$", stripped)
        if header_match:
            current_header = header_match.group(1).strip()
            low = current_header.lower()
            skip_section = any(k in low for k in SKIP_HEADER_KEYWORDS)
            continue

        if skip_section:
            continue

        # Bullet items: "- ...", "* ...", possibly nested with indentation.
        bullet = re.match(r"^[-*+]\s+(.*)$", stripped)
        # Numbered success criteria: "1. ..."
        numbered = re.match(r"^\d+\.\s+(.*)$", stripped)

        text = None
        if bullet:
            text = bullet.group(1).strip()
        elif numbered:
            text = numbered.group(1).strip()

        if text is None:
            continue

        # Strip markdown bold markers and leading "Label:" scaffolding so the
        # beat text reflects the actual requirement.
        text = text.replace("**", "")
        text = re.sub(r"^[A-Za-z /]+:\s*", "", text).strip()

        if not text or text.lower() in ("n/a", "na", "none"):
            continue

        # Drop pure ratio lines like "45%".
        if re.fullmatch(r"[\d%\s.:to-]+", text):
            continue

        beats.append(text)

    # De-duplicate while preserving order.
    seen = set()
    unique = []
    for b in beats:
        key = b.lower()
        if key not in seen:
            seen.add(key)
            unique.append(b)
    return unique


def find_evidence(beat, chapter_text, chapter_sentences):
    """Return the chapter sentence with the highest content-token overlap."""
    beat_tokens = content_tokens(beat)
    beat_ents = entities(beat)
    best_score = -1.0
    best_sentence = ""
    for sent in chapter_sentences:
        st = content_tokens(sent)
        overlap = len(beat_tokens & st)
        ent_overlap = len(beat_ents & entities(sent))
        score = overlap + 1.5 * ent_overlap
        if score > best_score:
            best_score = score
            best_sentence = sent
    snippet = re.sub(r"\s+", " ", best_sentence).strip()
    if len(snippet) > 200:
        snippet = snippet[:197].rstrip() + "..."
    return snippet


def split_sentences(text):
    # Collapse whitespace per paragraph, then split on sentence enders.
    flat = re.sub(r"\s+", " ", text)
    parts = re.split(r"(?<=[.!?])\s+", flat)
    return [p.strip() for p in parts if p.strip()]


def score_beat(beat, chapter_tokens, chapter_ents, chapter_text, chapter_sentences):
    beat_tokens = content_tokens(beat)
    beat_ents = entities(beat)

    if not beat_tokens and not beat_ents:
        # Nothing to test against; treat as present (trivial requirement).
        return "present", find_evidence(beat, chapter_text, chapter_sentences)

    token_hits = beat_tokens & chapter_tokens
    ent_hits = beat_ents & chapter_ents
    ent_total = len(beat_ents)

    # Coverage of content keywords.
    token_cov = len(token_hits) / len(beat_tokens) if beat_tokens else 1.0
    ent_cov = (len(ent_hits) / ent_total) if ent_total else None

    # Decide status. Entities are strong signals: a missed named entity is a real
    # gap; a matched one lifts confidence.
    if ent_total and len(ent_hits) == 0 and token_cov < 0.34:
        status = "missing"
    elif token_cov >= 0.5 or (ent_cov is not None and ent_cov >= 0.5 and token_cov >= 0.25):
        status = "present"
    elif token_cov >= 0.25 or (ent_cov is not None and ent_cov > 0):
        status = "weak"
    elif token_cov > 0:
        status = "weak"
    else:
        status = "missing"

    evidence = find_evidence(beat, chapter_text, chapter_sentences)
    if status == "missing":
        evidence = "no strong match found in chapter"
    return status, evidence


def main():
    if len(sys.argv) < 3:
        print(json.dumps({"error": "usage: conformance.py <chapter.md> <wrp.md>"}))
        return 2

    chapter_path = sys.argv[1]
    wrp_path = sys.argv[2]

    try:
        with open(chapter_path, "r", encoding="utf-8") as fh:
            chapter_text = fh.read()
    except OSError as exc:
        print(json.dumps({"error": "cannot read chapter: %s" % exc}))
        return 2

    try:
        with open(wrp_path, "r", encoding="utf-8") as fh:
            wrp_text = fh.read()
    except OSError as exc:
        print(json.dumps({"error": "cannot read wrp: %s" % exc}))
        return 2

    beats = parse_wrp_beats(wrp_text)

    chapter_tokens = content_tokens(chapter_text)
    chapter_ents = entities(chapter_text)
    chapter_sentences = split_sentences(chapter_text)

    results = []
    counts = {"present": 0, "weak": 0, "missing": 0}
    for beat in beats:
        status, evidence = score_beat(
            beat, chapter_tokens, chapter_ents, chapter_text, chapter_sentences
        )
        counts[status] += 1
        results.append({"beat": beat, "status": status, "evidence": evidence})

    print(json.dumps({"beats": results, "summary": counts}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
