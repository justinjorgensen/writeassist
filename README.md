# WriteAssist

**A constraint-driven, multi-agent writing framework for Claude Code.** It treats prose quality the way an engineering team treats code quality: a deterministic gate at the harness level, least-privilege reviewers that cannot touch what they review, auditable revision passes, and a parallel, named-agent review panel.

Clone it, open it in Claude Code, and every core feature works with **zero external accounts**: no API keys, no MCP servers.

---

## The four pillars

1. **Harness-level enforcement, not vibes.** A PostToolUse hook (`.claude/scripts/em-dash-guard.sh`) blocks the banned em-dash token at write time: when a Claude Code `Write` or `Edit` would introduce one to a manuscript file, the hook exits 2 and the harness blocks the write. The rule is enforced by the harness, not requested in a prompt the model might ignore. The matcher is scoped to manuscript directories and spares the literal `---` rule.

2. **Least-privilege, tool-isolated reviewers.** Every reviewer agent carries YAML frontmatter declaring its tools. The seven gating critics are locked to `Read, Grep, Glob`, so they physically cannot edit the manuscript they score. Only creator agents hold `Write, Edit`.

3. **Isolated, auditable revision passes.** `/auto-revise-chapter` runs each revision in its own git worktree and branch (plain `git worktree add` plus `cd` plus `commit`, not a special harness flag). Every pass is a separate, diffable, rollback-able commit. A bad revision never corrupts the working copy.

4. **Parallel, named-agent review.** `/review-chapter` fans out the seven named gating critics in one response, each in its own clean context, each scored against an explicit four-tier rubric. The critics are launched by name (`subagent_type: pacing-master`, and so on), never as a single general-purpose prompt simulating a panel.

---

WriteAssist works for any book-length narrative: fiction, memoir, autobiography, biography, or narrative non-fiction.

---

## 60-second quickstart

1. **Clone and open.** `git clone` the repo and open it in Claude Code. The hooks and statusline auto-load from `.claude/settings.json`. The only host dependencies are `jq` and `python3` (used by the portable em-dash matcher).

2. **The aha moment.** Ask Claude Code to write a sentence containing an em dash to any file under `02-Manuscript/`. The PostToolUse hook blocks the `Write`/`Edit` (exit 2) and tells you why. Through the normal edit path, a banned token cannot reach a chapter file.

3. **Fill the two template files.** Edit `project-config.md` (genre, voice, tone, themes) and `author-rules.md` (your hard and soft constraints). The em-dash ban already lives in `author-rules.md` as a configurable example.

4. **Run the pipeline.**
   ```
   /outline-book          # plan-mode gate, then writes 01-Planning/outline.md
   /setup-story           # builds story-compendium.md and characters
   /generate-wrp 1        # plan-mode gate, then a chapter blueprint
   /execute-wrp 05-wrp/chapter_01_WRP.md
   ```
   `/execute-wrp` writes the chapter and then auto-fires the four-tier review panel. If the panel returns Revise, run `/auto-revise-chapter` and inspect each pass with `git log` and `git diff`.

5. **Don't want to run anything yet?** `example/` holds a hand-authored synthetic walkthrough: a filled config, one WRP, and the chapter that follows from it (guaranteed zero em dashes).

---

## Agents

The framework ships **16 agents: 11 core plus 5 optional advanced reviewers and helpers.** Agents live flat in `.claude/agents/`; the core-versus-advanced tier below is documentation only. The seven gating critics are exactly the seven dimensions of the review engine, so the agent roster, critic list, and gate denominator are the same seven (see `docs/ARCHITECTURE.md` and `.claude/docs/review-engine.md`).

| Agent | Tier | Tools | Critic dimension | Gating or advisory |
|-------|------|-------|------------------|--------------------|
| story-architect | core | Read, Write, Edit, Grep, Glob | (creator: plot architecture) | creator |
| character-developer | core | Read, Write, Edit, Grep, Glob | (creator: character profiles and arcs) | creator |
| world-builder | core | Read, Write, Edit, Grep, Glob | (creator: setting and lore) | creator |
| research-assistant | core | Read, Write, Edit, Grep, Glob, WebFetch, WebSearch | (creator: fact and domain research) | creator |
| continuity-checker | core | Read, Grep, Glob | Continuity and Logic (20%) | gating (critical-fail) |
| rule-enforcer | core | Read, Grep, Glob | Rules Compliance (15%) | gating (critical-fail) |
| voice-consistency | core | Read, Grep, Glob | Voice and Prose (15%) | gating (critical-fail) |
| character-critic | core | Read, Grep, Glob | Characters and Arc (15%) | gating |
| pacing-master | core | Read, Grep, Glob | Pacing and Flow (12.5%) | gating |
| dialogue-coach | core | Read, Grep, Glob | Dialogue and Subtext (12.5%) | gating |
| engagement-critic | core | Read, Grep, Glob | Engagement and Impact (10%) | gating |
| sensitivity-reviewer | advanced | Read, Grep, Glob | Representation and harmful tropes | advisory (prunable) |
| thematic-guide | advanced | Read, Grep, Glob | Theme and motif reinforcement | advisory |
| grammar-clarity | advanced | Read, Grep, Glob | Grammar and readability | advisory |
| timeline-keeper | advanced | Read, Grep, Glob | Chronology and event sequencing | helper (backs /update-timeline) |
| twist-engineer | advanced | Read, Write, Edit, Grep, Glob | Reveal and misdirection design | creator helper |

**11 core:** 4 creators plus the 7 gating critics. **5 optional advanced:** 3 advisory critics plus 2 creative helpers. The advisory critics inform but never gate; they are pruned on `/review-chapter --fast` or when `author-rules.md` declares no sensitivity constraint.

---

## What this is, what it is not, and the caveats

**What this is**
- A working Claude Code framework for long-form prose with a deterministic style gate, tool-isolated reviewers, worktree-isolated revisions, and a parallel review panel.
- A demonstration that author-defined quality rules can be enforced by the harness instead of hoped for in a prompt.
- Runnable on the first try with no external services.

**What it is not**
- Not a publishing pipeline. The MCP-dependent reach (Drive sync, query letters, calendar blocking) is parked in `integrations/`, not in the core surface.
- Not a guarantee of "good writing." The framework structures and gates the work; it does not replace authorial judgment.
- Not a benchmark suite. It cites at most one reproducible measurement (in `.claude/docs/smoke-tests.md`); every other number is labeled illustrative.

**Honest caveats**
- **Review scores are heuristics.** The four-tier tiers and the panel and weighted gates are qualitative model judgments used as a stopping rule, not ground truth. The deterministic, checkable guarantee is the em-dash gate; the panel result is advisory by nature.
- **Parallel review trades tokens for latency.** Fanning out seven critics in clean contexts costs roughly seven critic-sized inferences per review. You get speed and isolation; you pay in tokens. See `docs/ADVANCED.md` for batch token-cost guidance.
- **MCP features are parked.** Anything needing Drive, Gmail, or Calendar lives in `integrations/` behind a "requires MCP server" banner so the first-run promise stays true.

---

## Documentation

- `docs/ARCHITECTURE.md`: the design write-up. Constraint hierarchy, WRP pipeline, why a hook over a prompt, why read-only reviewers, why git worktrees, and the four-tier review engine with the agent-critic-gate table.
- `docs/ADVANCED.md`: the advanced commands and the five optional agents, plus batch usage and token-cost guidance.
- `.claude/docs/review-engine.md`: the full four-tier rubric, dual-gate math, and critical-fail overrides.
- `.claude/docs/smoke-tests.md`: the gate-logic and hook smoke tests.

---

## Acknowledgments

WriteAssist was designed and built by Justin Jorgensen, with two AI collaborators who helped shape, critique, and rebuild it to v1.0:

- **Claude** (Anthropic), via Claude Code
- **Codex** (OpenAI's GPT-5.5)

---

## License

Released under the **MIT License**. Copyright (c) 2026 Justin Jorgensen. See `LICENSE`.
