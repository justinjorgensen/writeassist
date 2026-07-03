# /ultrareview as Final-Gate Review

`/ultrareview` is a Claude Code user-triggered, multi-agent cloud review. WriteAssist v2 uses it as the **last gate** before publishing a chapter to beta readers, sending pages to an agent, or merging a finished manuscript branch.

> `/ultrareview` cannot be invoked by Claude automatically. The author runs it themselves at the gate point. This doc tells them when and how.

## Where it sits in the pipeline

```
generate-wrp (plan-mode gate)
  → execute-wrp
    → review-chapter (local critic panel, parallel)
      → auto-revise-chapter (worktree iterations)
        → review-chapter gates pass
          → /smart-review (cheap re-check)
            → ★ /ultrareview ★   ← final cloud gate, author-triggered
              → publish / submit
```

Local `review-chapter` is fast and ~free. `/ultrareview` is slower and billed. So the contract is:
**Only run /ultrareview on chapters that have already passed the local review-engine gates (see `.claude/docs/review-engine.md`).**

## When to run it

| Trigger | Run /ultrareview? |
|---|---|
| Chapter just passed `review-chapter` panel for the first time | **Yes**, catch what the local panel missed |
| Final chapter of a book, ready for beta readers | **Yes** |
| Manuscript branch ready to merge to `main` | **Yes**, `/ultrareview` (no args) reviews the whole branch |
| Mid-revision, chapter still failing the review gates | No, local agents first |
| Minor edit on an already-cleared chapter | No |
| Query letter / synopsis going to an agent | **Yes** |

## How to run it

From the project root:

```bash
# Review the current branch (recommended for finished chapters / books)
/ultrareview

# Review a specific PR
/ultrareview 42
```

Branch mode bundles your local diff and runs the multi-agent panel against it in the cloud. No GitHub remote needed for branch mode.

## What it does that local agents don't

- Runs in fresh contexts with no contamination from the writing session.
- Includes reviewer agents tuned for security/correctness that aren't useful locally but catch surprising issues (e.g., licensing of quoted material, factual claims in research-driven fiction).
- Produces a single consolidated report instead of N parallel agent outputs.

## Author checklist before invoking

- [ ] Local `review-chapter` decision is PASS
- [ ] `em-dash:0` in statusline
- [ ] `story-compendium.md` is up to date with anything new from the chapter
- [ ] Git working tree is clean (or you're OK reviewing uncommitted changes)
- [ ] You've committed to spending the review credits

## After /ultrareview returns

1. Read the consolidated report.
2. Triage findings: `MUST FIX` → manual edit; `CONSIDER` → judgment call; `NIT` → ignore unless trivially right.
3. If MUST FIX items exist, fix them and re-run local `review-chapter` before re-invoking `/ultrareview`.
4. Once clean, proceed to publish/submit.

## Not a replacement for

- `review-chapter`, the local 10-agent panel is still the iterative tool. `/ultrareview` is the gate, not the loop.
- A human editor or beta reader. It's a high-quality second opinion, not a replacement for fresh human eyes.
