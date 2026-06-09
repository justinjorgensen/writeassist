# Workflow Pairings: /loop and /goal

This document records concrete pairings between WriteAssist's dynamic workflows
(in this directory) and two Claude Code orchestration skills:

- **`/loop`** runs a prompt or slash command on a recurring interval, or self-paced
  when you omit the interval. It is built for "keep doing this until I stop you"
  and for polling status on a cadence.
- **`/goal`** runs a prompt toward a stated objective and does not stop until that
  objective is met (or it proves it cannot be). It is built for "do not stop until
  the panel passes" style work, where the stopping condition is a verifiable outcome
  rather than a clock interval.

The workflows here already do real control flow on their own. These pairings wrap a
workflow in an outer driver so a single human kickoff produces continuous, hands-off
production or revision. Pick the driver by what your stopping condition is: a cadence
(`/loop`) or an outcome (`/goal`).

Docs only. Nothing here changes a workflow's behavior; it documents how to drive them.

---

## Pairing 1: batch-execute-wrp + /loop (continuous production)

`batch-execute-wrp` is deliberately capped. It refuses to run without an explicit
`--limit N`, clamps to a hard ceiling of 10, and returns every WRP beyond the limit as
`queued, not run` so you start the next batch on purpose. That refusal is the safety
rail that keeps spend visible. It also means a long backlog needs repeated, deliberate
kickoffs.

`/loop` is the right way to automate those repeated kickoffs WITHOUT removing the cap.
You keep the small per-batch limit and let the loop re-fire it on an interval, draining
the queue a few chapters at a time. Each iteration is still capped, still interruptible,
and still reports its spend.

### Example invocations

Run a capped batch every 30 minutes, two chapters at a time:

```
/loop 30m /batch-execute-wrp 05-wrp/ch-01.md 05-wrp/ch-02.md 05-wrp/ch-03.md 05-wrp/ch-04.md --limit 2
```

Drain a whole WRP directory in capped waves, self-paced (no fixed interval, the model
decides when the previous wave is done before firing the next):

```
/loop /batch-execute-wrp 05-wrp/*.md --limit 2 --fast
```

Faster cadence for a short backlog you are watching live:

```
/loop 10m /batch-execute-wrp 05-wrp/ch-05.md 05-wrp/ch-06.md --limit 1
```

### Why this pairing and not raising --limit

Raising `--limit` toward the ceiling spends a large amount in one uninterruptible shot.
Looping a small limit keeps every property the workflow was designed for: the cap stays
on, each wave is interruptible between iterations, and the `queued` list in each return
value tells the loop (and you) how much backlog remains. Stop the loop when `queued`
comes back empty.

> The HARD_CEILING of 10 still applies per iteration even under a loop. `/loop` does not
> bypass the cap; it just re-invokes the capped workflow. This is intentional.

---

## Pairing 2: review-chapter + /goal "do not stop until the panel passes"

`review-chapter` is a single dual-gate verdict. It returns
`{ decision, panel, weighted, criticalFail, critics, reason }` and `decision` is either
`PASS` or `REVISE`. On its own it judges once and stops; it does not revise.

`/goal` turns that single verdict into an outcome-driven driver. You state the objective
as the gate result you want, and `/goal` keeps working, reading the `REVISE` reason,
applying fixes, re-running the review, until `decision === "PASS"`.

### Example invocation

```
/goal do not stop until the panel passes: run /review-chapter 02-Manuscript/Chapter-04-The-Crossing.md against WRP 05-wrp/ch-04.md, and while it returns REVISE, apply the findings and re-run review-chapter, stopping only when decision is PASS
```

With fast advisory pruning while iterating, then a final full review:

```
/goal keep revising 02-Manuscript/Chapter-04-The-Crossing.md until /review-chapter returns PASS; iterate with fast:true for speed, but require one final non-fast review-chapter PASS before you stop
```

### Note on the principled version

This `/goal` pairing is the ad-hoc, free-form version of a loop that already exists as a
real workflow. If you want the deterministic, audited form of "revise until PASS" with
per-pass git worktrees and a confidence ladder, prefer `auto-revise-chapter` (Pairing 3)
over driving `review-chapter` by hand with `/goal`. Use the `/goal` form when you want a
human-readable, exploratory revise loop; use `auto-revise-chapter` when you want the
strict, reproducible one.

---

## Pairing 3: auto-revise-chapter + /goal (the loop-until-done already inside)

`auto-revise-chapter` ALREADY contains a loop-until-done. Read its body: after the
initial `review-chapter` call it enters a `for (let n = 1; n <= maxPasses; n += 1)`
revision loop that, on each pass, spawns a reviser on its own git worktree+branch
(`revise/chapter-XX-pass-N`, baseRef HEAD), applies findings by the fixed confidence
ladder, re-reviews the revised copy inside that worktree, and **breaks on the first
`PASS`**. It only stops early when it hits the `maxPasses` cap, in which case it returns
`maxedOut: true`. The internal stopping condition is exactly "the panel passes."

So the deterministic loop-until-done lives inside the workflow. `/goal` is for the layer
ABOVE it: the case where the cap was reached without a PASS and you want to keep going
across fresh cap-bounded runs rather than raising `maxPasses` into one giant
uninterruptible run.

### Example invocations

Single principled run, capped at 5 passes (this is the workflow doing its own
loop-until-done; no `/goal` needed):

```
/auto-revise-chapter { "chapter": "02-Manuscript/Chapter-04-The-Crossing.md", "wrp": "05-wrp/ch-04.md", "maxPasses": 5 }
```

Wrap it in `/goal` so that if a run returns `maxedOut: true` (cap hit, still REVISE),
the goal driver kicks off another capped `auto-revise-chapter` run from the latest passing
worktree, and only stops when a run returns `finalDecision: "PASS"`:

```
/goal do not stop until the panel passes: run /auto-revise-chapter on 02-Manuscript/Chapter-04-The-Crossing.md with wrp 05-wrp/ch-04.md and maxPasses 5; if it returns maxedOut true, start another auto-revise-chapter run continuing from the last committed pass branch, and stop only when finalDecision is PASS
```

### Why keep the cap and use /goal on top

The `maxPasses` cap (default 5) keeps any single `auto-revise-chapter` run interruptible
and bounds its spend, the same philosophy as `batch-execute-wrp`'s `--limit`. Removing the
cap to "loop forever internally" would defeat that. `/goal` preserves the cap: each run is
a bounded, audited, worktree-isolated batch of passes, and the goal driver simply decides
whether to start another bounded run based on `finalDecision` / `maxedOut`. You get
unbounded persistence toward the outcome WITHOUT an unbounded single run.

---

## Pairing 4: triage-style continuous review with /loop

For a manuscript in active drafting, you often want a standing reviewer: re-review the
chapters that changed, on a cadence, and surface anything that slipped to REVISE, without
manually re-running `review-chapter` after every edit. This is a polling pattern, so it is
`/loop`, not `/goal` (there is no single "done" outcome; you want a recurring sweep).

### Example invocations

Re-review the chapter you are actively editing every 15 minutes and report only when the
gate flips:

```
/loop 15m /review-chapter 02-Manuscript/Chapter-04-The-Crossing.md
```

Self-paced triage sweep across the whole manuscript directory in `fast` mode, reporting
each chapter's `decision` and the REVISE reasons, then waiting before the next sweep:

```
/loop run /review-chapter on each file in 02-Manuscript/*.md with fast:true, collect the decisions, and report only the chapters that came back REVISE with their reason; then wait for the next sweep
```

Tighter cadence while a co-author is making rapid changes you want gated continuously:

```
/loop 5m /review-chapter 02-Manuscript/Chapter-04-The-Crossing.md against WRP 05-wrp/ch-04.md
```

### Triage discipline

`review-chapter` is read-only by design (its gating critics are locked to `Read, Grep,
Glob`). That makes it safe to run on a loop: a triage sweep never mutates the manuscript,
it only judges. When a sweep flags a chapter REVISE, hand that one chapter off to
`auto-revise-chapter` (Pairing 3) to actually fix it. Keep the read-only sweep and the
write-capable revise on separate drivers so the standing loop never touches prose.

---

## Choosing a driver: quick reference

| You want | Stopping condition | Driver | Workflow |
|---|---|---|---|
| Drain a WRP backlog in capped waves | cadence / queue empty | `/loop` | `batch-execute-wrp` (small `--limit`) |
| One chapter revised until it passes, ad hoc | outcome (`PASS`) | `/goal` | `review-chapter` (hand-driven) |
| One chapter revised until it passes, audited | outcome (`PASS`) | none, or `/goal` over the cap | `auto-revise-chapter` (its own internal loop) |
| Standing gate over chapters in flight | cadence (recurring sweep) | `/loop` | `review-chapter` (read-only) |

### Two rules that hold across every pairing

1. **Never remove a workflow's cap to make a loop run longer.** `batch-execute-wrp`'s
   `--limit` / HARD_CEILING and `auto-revise-chapter`'s `maxPasses` exist so each run is
   bounded, interruptible, and visible in cost. Drive longevity from the OUTSIDE with
   `/loop` or `/goal`, which re-invoke the still-capped workflow.
2. **Keep read-only and write-capable drivers separate.** Put `review-chapter` (read-only)
   on standing `/loop` sweeps, and route only the chapters it flags into the write-capable
   `auto-revise-chapter`. The standing sweep must never mutate prose.
