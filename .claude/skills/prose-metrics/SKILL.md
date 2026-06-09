---
name: prose-metrics
description: >-
  Run this BEFORE judging a chapter's prose so every verdict cites numbers, not
  vibes. Reach for it whenever pacing-master, voice-consistency, or
  engagement-critic needs objective evidence about a single chapter: sentence
  length variety, filter-word density (felt/saw/heard/seemed/realized/noticed/
  watched/wondered), passive voice, -ly adverb load, dialogue ratio, echo /
  repeated-phrase detection within a 50-word window, paragraph length spread,
  and a Flesch-Kincaid reading grade. Deterministic and dependency-free, so all
  three critics analyze the SAME shared evidence. Use it when asked to "analyze
  this chapter," "check pacing," "find repetition," "measure prose quality," or
  before scoring/critiquing a draft.
---

# prose-metrics

A deterministic prose analyzer for WriteAssist. It reads one chapter Markdown
file and prints a single JSON object of objective metrics. No pip dependencies
(Python 3 standard library only). The same numbers feed pacing-master,
voice-consistency, and engagement-critic so their verdicts cite evidence
instead of impressions.

## What it measures

- **word_count, sentence_count, paragraph_count**
- **sentence_length**: `{mean, stdev, min, max}` (low stdev flags monotonous rhythm)
- **paragraph_lengths**: `{mean, stdev, min, max}`
- **filter_word_density**: per-word counts and per-1000-words rate for
  `felt, saw, heard, seemed, realized, noticed, watched, wondered`, plus a
  combined `total_per_1000_words`
- **passive_voice_count**: heuristic, a be-form (`be/been/being/am/is/are/was/were`)
  followed within two tokens by a past participle (`-ed` ending or a common
  irregular)
- **adverb_density**: `-ly` adverbs per 1000 words (common non-adverb `-ly`
  words filtered out) plus the top offenders
- **dialogue_ratio**: fraction of words sitting inside quotation marks
  (straight or curly)
- **echo_detection**: content words and 2-/3-grams that repeat within a sliding
  50-word window, with repeat counts
- **reading_level**: Flesch-Kincaid grade approximation, plus avg syllables per
  word and avg words per sentence
- **em_dash_count**: this framework bans em dashes; any literal is surfaced here

Markdown scaffolding (headings, rules, list markers, emphasis, links, code
ticks) is stripped before measurement, so metrics reflect prose, not formatting.

## How to run it

Pass the chapter Markdown path as the first argument:

```bash
python3 .claude/skills/prose-metrics/metrics.py example/Chapter-01.md
```

Or pipe text in on stdin (no argument):

```bash
cat example/Chapter-01.md | python3 .claude/skills/prose-metrics/metrics.py
```

## Output

A single JSON object on stdout. Running it against `example/Chapter-01.md`:

```json
{
  "word_count": 423,
  "sentence_count": 32,
  "paragraph_count": 8,
  "sentence_length": { "mean": 13.219, "stdev": 8.638, "min": 3, "max": 40 },
  "paragraph_lengths": { "mean": 52.875, "stdev": 18.631, "min": 20, "max": 72 },
  "filter_word_density": {
    "counts": { "felt": 0, "saw": 0, "heard": 0, "seemed": 0,
                "realized": 0, "noticed": 0, "watched": 2, "wondered": 0 },
    "per_1000_words": { "watched": 4.728, "...": 0.0 },
    "total_per_1000_words": 4.728
  },
  "passive_voice_count": 4,
  "adverb_density": {
    "count": 1,
    "per_1000_words": 2.364,
    "top": [ { "word": "faintly", "count": 1 } ]
  },
  "dialogue_ratio": 0.0071,
  "echo_detection": {
    "window_words": 50,
    "total_echoes": 16,
    "repeated_words": [ { "text": "channel", "repeats": 1 },
                        { "text": "traffic", "repeats": 1 } ],
    "repeated_bigrams": [ { "text": "the traffic", "repeats": 1 } ],
    "repeated_trigrams": []
  },
  "reading_level": {
    "flesch_kincaid_grade": 4.8,
    "avg_syllables_per_word": 1.291,
    "avg_words_per_sentence": 13.219
  },
  "source": "example/Chapter-01.md",
  "em_dash_count": 0
}
```

(The example above is trimmed for readability; the real output lists every
filter word and the full top-N echo lists.)

## How the critics use it

- **pacing-master**: read `sentence_length.stdev` and `paragraph_lengths.stdev`
  for rhythm variety; a low stdev means same-length sentences and flat pacing.
- **voice-consistency**: compare `filter_word_density`, `adverb_density`, and
  `dialogue_ratio` across chapters to catch drift in narrative distance.
- **engagement-critic**: cite `passive_voice_count`, `echo_detection`, and the
  filter-word total to point at specific dull or repetitive spans.

## Error handling

If the path is unreadable, the script prints `{"error": "..."}` to stdout and
exits non-zero. Otherwise it always exits 0 with a JSON object.
