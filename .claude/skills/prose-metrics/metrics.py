#!/usr/bin/env python3
"""prose-metrics: deterministic prose analyzer for WriteAssist chapters.

Reads a chapter .md path from argv[1] (or stdin if no arg) and prints a single
JSON object of objective prose metrics to stdout. Standard library only.

The metrics are intentionally deterministic so that pacing-master,
voice-consistency, and engagement-critic all cite the SAME numbers.
"""

import json
import re
import statistics
import sys


# Em dash is banned in this framework. Reference it only by codepoint escape,
# never as an embedded literal byte.
EM_DASH = re.compile(r"\u2014")

FILTER_WORDS = (
    "felt",
    "saw",
    "heard",
    "seemed",
    "realized",
    "noticed",
    "watched",
    "wondered",
)

BE_FORMS = (
    "be",
    "been",
    "being",
    "am",
    "is",
    "are",
    "was",
    "were",
)

# Common -ly words that are NOT adverbs, to avoid inflating adverb density.
NON_ADVERB_LY = {
    "ally",
    "anomaly",
    "apply",
    "belly",
    "bully",
    "comply",
    "family",
    "fly",
    "holy",
    "imply",
    "italy",
    "jelly",
    "july",
    "lily",
    "monopoly",
    "multiply",
    "only",
    "rally",
    "rely",
    "reply",
    "supply",
    "ugly",
}

# Closed-class / very common words excluded from echo content-word detection.
STOPWORDS = {
    "the", "a", "an", "and", "or", "but", "if", "of", "to", "in", "on", "at",
    "for", "with", "by", "from", "as", "is", "are", "was", "were", "be", "been",
    "being", "am", "he", "she", "it", "they", "we", "you", "i", "him", "her",
    "his", "hers", "its", "their", "them", "our", "your", "my", "me", "us",
    "this", "that", "these", "those", "there", "here", "then", "than", "so",
    "not", "no", "do", "did", "does", "had", "has", "have", "will", "would",
    "could", "should", "can", "may", "might", "must", "up", "out", "down",
    "off", "over", "under", "again", "once", "all", "any", "some", "such",
    "what", "which", "who", "whom", "whose", "when", "where", "why", "how",
    "into", "onto", "upon", "about", "after", "before", "yet", "still", "him",
}

# Treat curly and straight quotes uniformly.
QUOTE_CHARS = '"“”'

WORD_RE = re.compile(r"[A-Za-z][A-Za-z'’-]*")
SENTENCE_SPLIT_RE = re.compile(r"(?<=[.!?])[\"”')\]]*\s+")
VOWEL_GROUPS_RE = re.compile(r"[aeiouy]+")


def strip_markdown(text):
    """Remove markdown scaffolding so we measure prose, not formatting."""
    out_lines = []
    for line in text.splitlines():
        s = line.strip()
        if not s:
            out_lines.append("")
            continue
        if s == "---":  # horizontal rule / front-matter fence
            out_lines.append("")
            continue
        if s.startswith("#"):  # heading
            continue
        if s.startswith(">"):  # blockquote marker only
            s = s.lstrip(">").strip()
        # Drop list bullets / numbering markers but keep the text.
        s = re.sub(r"^([*+-]|\d+\.)\s+", "", s)
        out_lines.append(s)
    text = "\n".join(out_lines)
    # Inline emphasis markers and inline code ticks.
    text = text.replace("**", "").replace("__", "")
    text = re.sub(r"(?<!\w)[*_]([^*_]+)[*_](?!\w)", r"\1", text)
    text = text.replace("`", "")
    # Markdown links: keep the link text, drop the target.
    text = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", text)
    return text


def split_paragraphs(text):
    paras = [p.strip() for p in re.split(r"\n\s*\n", text)]
    return [p for p in paras if p]


def split_sentences(text):
    flat = re.sub(r"\s+", " ", text).strip()
    if not flat:
        return []
    parts = SENTENCE_SPLIT_RE.split(flat)
    return [p.strip() for p in parts if p.strip()]


def count_words(text):
    return WORD_RE.findall(text)


def syllables_in_word(word):
    w = word.lower()
    w = re.sub(r"[^a-z]", "", w)
    if not w:
        return 0
    groups = VOWEL_GROUPS_RE.findall(w)
    count = len(groups)
    # Silent trailing 'e' (but never drop below 1).
    if w.endswith("e") and not w.endswith("le") and count > 1:
        count -= 1
    return max(count, 1)


def round_stats(values, ndigits=3):
    if not values:
        return {"mean": 0.0, "stdev": 0.0, "min": 0, "max": 0}
    return {
        "mean": round(statistics.mean(values), ndigits),
        "stdev": round(statistics.pstdev(values), ndigits) if len(values) > 1 else 0.0,
        "min": min(values),
        "max": max(values),
    }


def dialogue_word_count(text):
    """Count words that fall inside paired quotation marks."""
    inside = []
    open_quote = False
    buf = []
    for ch in text:
        if ch in QUOTE_CHARS:
            if open_quote:
                inside.append("".join(buf))
                buf = []
            open_quote = not open_quote
        elif open_quote:
            buf.append(ch)
    words = 0
    for chunk in inside:
        words += len(WORD_RE.findall(chunk))
    return words


def filter_word_density(tokens_lower, total_words):
    counts = {fw: 0 for fw in FILTER_WORDS}
    for t in tokens_lower:
        if t in counts:
            counts[t] += 1
    per_1000 = {}
    for fw, c in counts.items():
        per_1000[fw] = round((c / total_words) * 1000, 3) if total_words else 0.0
    total = sum(counts.values())
    return {
        "counts": counts,
        "per_1000_words": per_1000,
        "total_per_1000_words": round((total / total_words) * 1000, 3)
        if total_words
        else 0.0,
    }


def passive_voice_count(tokens_lower):
    """Heuristic: a be-form followed (within 2 tokens) by a past participle.

    Past participle approximated by an -ed ending or a small irregular set.
    """
    irregular_pp = {
        "done", "gone", "seen", "taken", "given", "made", "found", "told",
        "known", "shown", "thrown", "broken", "spoken", "chosen", "written",
        "driven", "eaten", "fallen", "forgotten", "hidden", "held", "kept",
        "left", "lost", "meant", "met", "paid", "put", "read", "said", "sent",
        "set", "shut", "sold", "sung", "swept", "taught", "torn", "worn",
        "built", "burnt", "caught", "cut", "felt", "heard",
    }
    count = 0
    n = len(tokens_lower)
    for i, tok in enumerate(tokens_lower):
        if tok not in BE_FORMS:
            continue
        for j in range(i + 1, min(i + 3, n)):
            nxt = tokens_lower[j]
            if nxt.endswith("ed") and len(nxt) > 3:
                count += 1
                break
            if nxt in irregular_pp:
                count += 1
                break
    return count


def adverb_density(tokens_lower, total_words):
    adverbs = [
        t
        for t in tokens_lower
        if t.endswith("ly") and len(t) > 3 and t not in NON_ADVERB_LY
    ]
    per_1000 = round((len(adverbs) / total_words) * 1000, 3) if total_words else 0.0
    # Most frequent offenders, for actionable feedback.
    freq = {}
    for a in adverbs:
        freq[a] = freq.get(a, 0) + 1
    top = sorted(freq.items(), key=lambda kv: (-kv[1], kv[0]))[:10]
    return {
        "count": len(adverbs),
        "per_1000_words": per_1000,
        "top": [{"word": w, "count": c} for w, c in top],
    }


def echo_detection(tokens_lower, window=50, top_n=15):
    """Find content words and 2- and 3-grams repeated within a sliding window.

    Returns the most notable echoes with their repeat counts (number of close
    repeats observed within any window).
    """
    content = [(i, t) for i, t in enumerate(tokens_lower) if t not in STOPWORDS and len(t) > 2]

    word_echoes = {}
    # For each content token, count how many earlier content tokens of the same
    # value sit within `window` positions (token-index distance).
    last_seen = {}
    for idx, tok in content:
        prev = last_seen.get(tok)
        if prev is not None and (idx - prev) <= window:
            word_echoes[tok] = word_echoes.get(tok, 0) + 1
        last_seen[tok] = idx

    def ngram_echoes(n):
        echoes = {}
        seen = {}
        for start in range(len(tokens_lower) - n + 1):
            gram = tuple(tokens_lower[start : start + n])
            # Skip grams that are entirely stopwords (low signal).
            if all(g in STOPWORDS for g in gram):
                continue
            prev = seen.get(gram)
            if prev is not None and (start - prev) <= window:
                echoes[" ".join(gram)] = echoes.get(" ".join(gram), 0) + 1
            seen[gram] = start
        return echoes

    bigram = ngram_echoes(2)
    trigram = ngram_echoes(3)

    def topify(d):
        items = sorted(d.items(), key=lambda kv: (-kv[1], kv[0]))[:top_n]
        return [{"text": k, "repeats": v} for k, v in items]

    total = sum(word_echoes.values()) + sum(bigram.values()) + sum(trigram.values())
    return {
        "window_words": window,
        "total_echoes": total,
        "repeated_words": topify(word_echoes),
        "repeated_bigrams": topify(bigram),
        "repeated_trigrams": topify(trigram),
    }


def flesch_kincaid_grade(total_words, sentences, total_syllables):
    if total_words == 0 or len(sentences) == 0:
        return 0.0
    words_per_sentence = total_words / len(sentences)
    syllables_per_word = total_syllables / total_words
    grade = 0.39 * words_per_sentence + 11.8 * syllables_per_word - 15.59
    return round(grade, 2)


def analyze(text):
    prose = strip_markdown(text)
    paragraphs = split_paragraphs(prose)
    sentences = split_sentences(prose)

    tokens = count_words(prose)
    tokens_lower = [t.lower() for t in tokens]
    total_words = len(tokens)

    sentence_lengths = [len(count_words(s)) for s in sentences]
    paragraph_lengths = [len(count_words(p)) for p in paragraphs]

    total_syllables = sum(syllables_in_word(w) for w in tokens)
    dlg_words = dialogue_word_count(prose)

    result = {
        "word_count": total_words,
        "sentence_count": len(sentences),
        "paragraph_count": len(paragraphs),
        "sentence_length": round_stats(sentence_lengths),
        "paragraph_lengths": {
            "mean": round(statistics.mean(paragraph_lengths), 3)
            if paragraph_lengths
            else 0.0,
            "stdev": round(statistics.pstdev(paragraph_lengths), 3)
            if len(paragraph_lengths) > 1
            else 0.0,
            "min": min(paragraph_lengths) if paragraph_lengths else 0,
            "max": max(paragraph_lengths) if paragraph_lengths else 0,
        },
        "filter_word_density": filter_word_density(tokens_lower, total_words),
        "passive_voice_count": passive_voice_count(tokens_lower),
        "adverb_density": adverb_density(tokens_lower, total_words),
        "dialogue_ratio": round(dlg_words / total_words, 4) if total_words else 0.0,
        "echo_detection": echo_detection(tokens_lower),
        "reading_level": {
            "flesch_kincaid_grade": flesch_kincaid_grade(
                total_words, sentences, total_syllables
            ),
            "avg_syllables_per_word": round(total_syllables / total_words, 3)
            if total_words
            else 0.0,
            "avg_words_per_sentence": round(total_words / len(sentences), 3)
            if sentences
            else 0.0,
        },
    }
    return result


def main():
    if len(sys.argv) > 1:
        path = sys.argv[1]
        try:
            with open(path, "r", encoding="utf-8") as fh:
                text = fh.read()
        except OSError as exc:
            print(json.dumps({"error": str(exc)}))
            return 1
        source = path
    else:
        text = sys.stdin.read()
        source = "<stdin>"

    if EM_DASH.search(text):
        # Not fatal for analysis, but surface it: this framework bans em dashes.
        em_dash_count = len(EM_DASH.findall(text))
    else:
        em_dash_count = 0

    result = analyze(text)
    result["source"] = source
    result["em_dash_count"] = em_dash_count
    print(json.dumps(result, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
