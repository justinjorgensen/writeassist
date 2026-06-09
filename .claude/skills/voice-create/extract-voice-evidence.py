#!/usr/bin/env python3
"""
extract-voice-evidence.py

Reads prose samples and prints JSON evidence a voice director can build a
profile from. This script does NOT write the profile and does NOT judge.
It surfaces measurable traits (rhythm, register, signature moves, vocabulary)
so the profile is grounded in the actual writing rather than guessed.

Usage:
  # one or more files as args
  ./extract-voice-evidence.py sample1.md sample2.md

  # or pipe text on stdin (use "-" or no args)
  cat chapter.md | ./extract-voice-evidence.py

  # restrict to a single character's dialogue (lines that character speaks),
  # by passing a speaker tag the script greps for in dialogue attributions:
  ./extract-voice-evidence.py --speaker Aldous chapter.md

Output: JSON to stdout. Standard library only.
"""

import sys
import re
import json
import statistics

# Em dash is BANNED in this framework. We never embed a literal em dash byte.
# Match it (to flag it as evidence of a rule violation) by codepoint escape only.
EM_DASH = re.compile("\\u2014")  # match em dash by codepoint, never an embedded literal byte

SENTENCE_SPLIT = re.compile(r"(?<=[.!?])\s+(?=[\"'A-Z0-9])")
WORD = re.compile(r"[A-Za-z']+")
# A loose dialogue grabber: text inside straight or curly double quotes.
DIALOGUE = re.compile(r"[\"“]([^\"”“]{1,400})[\"”]")

# Words that read as AI-voice tells (the framework flags these).
AI_TELLS = {
    "delve", "utilize", "navigate", "unlock", "landscape", "moreover",
    "tapestry", "testament", "realm", "intricate", "furthermore",
}

CONTRACTIONS = re.compile(r"\b\w+'(?:t|s|re|ve|ll|d|m)\b", re.IGNORECASE)


def strip_markdown(text):
    # Drop fenced code, headings, list bullets, emphasis markers, and
    # editorial metadata (bold key:value footers, italic stage-notes that may
    # span multiple lines) so we measure prose, not formatting or commentary.
    out = []
    in_italic_block = False
    for line in text.splitlines():
        s = line.strip()
        # Track multi-line italic stage-note blocks: a line that opens with
        # "*" but does not close on the same line starts a skipped block.
        star_count = s.count("*")
        if in_italic_block:
            if s.endswith("*"):
                in_italic_block = False
            continue
        if s.startswith("*") and not (s.endswith("*") and star_count >= 2):
            in_italic_block = True
            continue
        if s.startswith("#"):
            continue
        if s.startswith("---") or s.startswith("***"):
            continue
        if s.startswith("*") and s.endswith("*") and star_count >= 2:
            # one-line italic stage-note, skip
            continue
        # bold metadata footer like **Word Count**: 430
        if re.match(r"^\*\*[^*]+\*\*\s*:", s):
            continue
        if s.startswith("> "):
            s = s[2:]
        if re.match(r"^[-*+]\s", s):
            s = re.sub(r"^[-*+]\s+", "", s)
        if re.match(r"^\|", s):
            continue
        out.append(s)
    text = "\n".join(out)
    text = re.sub(r"`[^`]*`", "", text)
    text = re.sub(r"[*_]{1,3}", "", text)
    return text


def split_sentences(text):
    flat = re.sub(r"\s+", " ", text).strip()
    if not flat:
        return []
    parts = SENTENCE_SPLIT.split(flat)
    return [p.strip() for p in parts if p.strip()]


def extract_speaker_dialogue(text, speaker):
    """Keep only dialogue attributed to `speaker` on the same or adjacent
    portion of the line. Heuristic, transparent: a quote counts if the
    speaker's name appears within ~60 chars of the closing quote."""
    kept = []
    for m in DIALOGUE.finditer(text):
        line = m.group(1)
        window = text[max(0, m.start() - 60): m.end() + 60]
        if re.search(r"\b" + re.escape(speaker) + r"\b", window):
            kept.append(line)
    return kept


def analyze(text, speaker=None):
    raw = text
    if speaker:
        quotes = extract_speaker_dialogue(text, speaker)
        prose_text = " ".join(quotes)
    else:
        prose_text = strip_markdown(text)

    sentences = split_sentences(prose_text)
    sent_lengths = [len(WORD.findall(s)) for s in sentences]
    sent_lengths = [n for n in sent_lengths if n > 0]

    all_words = WORD.findall(prose_text.lower())
    total_words = len(all_words)

    # rhythm
    if sent_lengths:
        mean_len = round(statistics.mean(sent_lengths), 1)
        median_len = statistics.median(sent_lengths)
        stdev_len = round(statistics.pstdev(sent_lengths), 1) if len(sent_lengths) > 1 else 0.0
        shortest = min(sent_lengths)
        longest = max(sent_lengths)
        fragments = sum(1 for n in sent_lengths if n <= 4)
    else:
        mean_len = median_len = stdev_len = shortest = longest = fragments = 0

    # register signals
    contractions = len(CONTRACTIONS.findall(prose_text))
    first_person = sum(1 for w in all_words if w in ("i", "me", "my", "mine", "we", "us", "our"))
    second_person = sum(1 for w in all_words if w in ("you", "your", "yours"))

    # signature moves
    dialogue_hits = DIALOGUE.findall(text)
    semicolons = raw.count(";")
    em_dashes = len(EM_DASH.findall(raw))  # rule-violation flag
    repetition = find_anaphora(sentences)

    # vocabulary texture
    unique = set(all_words)
    ttr = round(len(unique) / total_words, 3) if total_words else 0.0
    long_words = [w for w in unique if len(w) >= 9]
    ai_tells_found = sorted(unique & AI_TELLS)
    distinctive = top_distinctive(all_words)

    # opening / motion samples (so the director can hear it move)
    opening = sentences[0] if sentences else ""
    short_samples = [s for s in sentences if 1 <= len(WORD.findall(s)) <= 6][:4]
    long_samples = sorted(sentences, key=lambda s: len(WORD.findall(s)), reverse=True)[:2]

    return {
        "scope": ("character:" + speaker) if speaker else "narrative",
        "total_words": total_words,
        "sentence_count": len(sentences),
        "rhythm": {
            "mean_sentence_words": mean_len,
            "median_sentence_words": median_len,
            "stdev_sentence_words": stdev_len,
            "shortest": shortest,
            "longest": longest,
            "fragment_count_<=4w": fragments,
            "variance_verdict": rhythm_verdict(stdev_len, mean_len),
        },
        "register": {
            "contractions": contractions,
            "first_person_pronouns": first_person,
            "second_person_pronouns": second_person,
            "register_verdict": register_verdict(contractions, total_words, first_person),
        },
        "signature_moves": {
            "dialogue_lines": len(dialogue_hits),
            "semicolons": semicolons,
            "anaphora_examples": repetition[:3],
        },
        "vocabulary": {
            "type_token_ratio": ttr,
            "distinctive_words": distinctive,
            "long_words_sample": sorted(long_words)[:12],
        },
        "in_motion": {
            "opening_line": opening,
            "short_beats": short_samples,
            "longest_sentences": long_samples,
        },
        "rule_flags": {
            "em_dashes_found": em_dashes,
            "ai_voice_tells": ai_tells_found,
        },
    }


def rhythm_verdict(stdev, mean):
    if mean == 0:
        return "no data"
    ratio = stdev / mean if mean else 0
    if ratio >= 0.55:
        return "highly varied (long and short sentences collide)"
    if ratio >= 0.35:
        return "moderately varied"
    return "even/metronomic (sentences cluster near one length)"


def register_verdict(contractions, total, first_person):
    if total == 0:
        return "no data"
    c_rate = contractions / max(total, 1)
    fp = "first-person-leaning" if first_person > total * 0.02 else "third-person-leaning"
    if c_rate >= 0.02:
        return "casual/spoken, " + fp
    if c_rate > 0:
        return "measured but not stiff, " + fp
    return "formal/literary (no contractions), " + fp


def find_anaphora(sentences):
    """Find repeated sentence-opening words (a real signature move in the
    lighthouse sample: 'Still the lamp... Still he climbed.')."""
    openers = {}
    for s in sentences:
        m = WORD.search(s)
        if not m:
            continue
        key = m.group(0).lower()
        openers.setdefault(key, []).append(s)
    out = []
    for word, group in openers.items():
        if len(group) >= 2 and word not in ("the", "a", "and", "but", "he", "she", "it"):
            out.append({"opener": word, "count": len(group), "example": group[0]})
    out.sort(key=lambda d: d["count"], reverse=True)
    return out


STOPWORDS = set("""the a an and or but of to in on at for with as by from is was were be been
being it he she they we you i him her them his hers their our my your me us not no so if then
that this these those there here had has have do did does which who whom what when where how
into out up down over under again very just only than too also can could would should will""".split())


def top_distinctive(words):
    freq = {}
    for w in words:
        if w in STOPWORDS or len(w) < 4:
            continue
        freq[w] = freq.get(w, 0) + 1
    ranked = sorted(freq.items(), key=lambda kv: (-kv[1], kv[0]))
    return [{"word": w, "count": c} for w, c in ranked[:12]]


def main():
    args = sys.argv[1:]
    speaker = None
    if "--speaker" in args:
        i = args.index("--speaker")
        try:
            speaker = args[i + 1]
        except IndexError:
            sys.stderr.write("error: --speaker needs a name\n")
            sys.exit(2)
        del args[i:i + 2]

    texts = []
    sources = []
    files = [a for a in args if a != "-"]
    if files:
        for path in files:
            try:
                with open(path, "r", encoding="utf-8") as f:
                    texts.append(f.read())
                sources.append(path)
            except OSError as e:
                sys.stderr.write("error reading %s: %s\n" % (path, e))
                sys.exit(2)
    else:
        data = sys.stdin.read()
        if not data.strip():
            sys.stderr.write("error: no input (pass files or pipe text on stdin)\n")
            sys.exit(2)
        texts.append(data)
        sources.append("<stdin>")

    combined = "\n\n".join(texts)
    result = analyze(combined, speaker=speaker)
    result["sources"] = sources
    print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
