# WriteAssist Architecture

This document is written for a senior engineering audience. WriteAssist is a writing tool, but the interesting part is not the prose: it is the control system around the prose. The thesis is that author-defined quality rules should be enforced by the harness, not requested in a prompt, and that the agents doing review should have exactly the capabilities they need and no more. What follows is the set of design decisions, the reasons behind them, and the tradeoffs each one accepts.

---

## 1. The constraint hierarchy

Every creative task reads four documents, in a fixed precedence order, before any prose is generated:

1. **`author-rules.md`** (highest authority): hard constraints that must never break, soft constraints to avoid without justification, and mandates that must always happen. The zero-em-dash rule lives here as a configurable example.
2. **`story-compendium.md`**: the story's encyclopedia. Characters, timeline, world rules, plot structure. This is the fact base continuity is checked against.
3. **`project-config.md`**: project settings. Genre, voice, tone, themes, dialogue style, target audience.
4. **`CLAUDE.md`**: framework behavior and workflow rules. System-level, not user-edited.

The point of an explicit hierarchy is determinism of intent: when two documents could conflict, the resolution order is fixed in advance rather than decided ad hoc by whichever the model happened to read last. Agents flag any violation with a `[RULE VIOLATION: rule-name]` tag, and `rule-enforcer` loads the active constraints first so the rest of the panel scores against a known rule set.

**Tradeoff:** four documents is more ceremony than a single prompt. The payoff is that constraints are versioned, diffable artifacts the author owns, not prose buried in a system message.

---

## 2. The WRP pipeline

The core unit of work is a **Writing Requirements Plan (WRP)**: a per-chapter blueprint that separates planning from drafting. The pipeline:

```
/outline-book   -> plan-mode gate -> 01-Planning/outline.md
/setup-story    -> story-compendium.md + character profiles
/generate-wrp N -> plan-mode gate -> 05-wrp/chapter_NN_WRP.md
/execute-wrp F  -> writes 02-Manuscript/Chapter-NN.md
                -> auto-fires the four-tier review panel
                -> (if Revise) /auto-revise-chapter -> worktree pass -> re-review
```

Two of these stages, `/outline-book` and `/generate-wrp`, enter **plan mode** before they write anything. The author approves the structure before the model commits a blueprint to disk. This is a deliberate human-in-the-loop gate at the two highest-leverage decision points (book structure and chapter structure), where a wrong commitment is expensive to unwind downstream.

**Why a WRP at all?** Separating the plan from the draft means the expensive, hard-to-review part (does this chapter do the right things?) is settled cheaply in a blueprint before any prose exists, and the draft step has a concrete spec to satisfy and to review against. It also makes batch production tractable: a directory of approved WRPs is a runnable queue.

---

## 3. Why a hook instead of a prompt

The headline rule, zero em dashes, is enforced by a **PreToolUse hook** (`.claude/scripts/em-dash-guard.sh`) plus a **final scanner** (`.claude/scripts/em-dash-scan.sh`), not by an instruction in `CLAUDE.md`.

A prompt instruction is a request. The model usually honors it, but "usually" is not a guarantee, and a single em dash slipping into a published chapter undermines a framework whose entire pitch is rule enforcement. A hook is a control. When a `Write`, `Edit`, or `MultiEdit` would introduce an em dash to a manuscript file, the PreToolUse hook exits 2 and the harness denies the tool call before it runs, so the token never reaches disk through those tools. A `Write|Edit|MultiEdit` matcher cannot see shell writes, so the claim is scoped honestly: through the Write/Edit/MultiEdit path the token is unwritable, and a final scanner (on `Bash` and `Stop`) enforces a clean final state for every other path.

Design details that make this honest rather than fragile:

- **Scope.** The matcher is narrowed to manuscript directories (`02-Manuscript/`, `05-wrp/`, `story-compendium.md`). Config files like `author-rules.md` are deliberately out of scope, because a CLI example or a `--flag` in a config file would otherwise false-block.
- **The `---` sparing.** The regex spares the literal triple-dash so Markdown horizontal rules and YAML frontmatter delimiters still work.
- **Portability.** The matcher is implemented so it runs on a hostile clone (including BSD/macOS), not just on a Linux box with PCRE `grep -P`. The em-dash character is matched by codepoint so the demo cannot silently no-op on a reviewer's machine.

**Tradeoff:** a hook is harder to write and test than a sentence in a prompt, and it only catches what its regex catches. It is the right tool precisely because it is deterministic: a CI gate, not a code review comment. _This is the difference between "please do not" and "you cannot."_

---

## 4. Why read-only reviewers (least privilege)

Every agent declares its tools in YAML frontmatter. The seven gating critics are locked to `Read, Grep, Glob`. They can read the manuscript, the compendium, and the rules; they cannot write or edit anything.

This is an IAM decision, not a stylistic one. A reviewer that can edit the thing it reviews can quietly "fix" what it should be flagging, which both hides defects and makes the review unauditable. By construction, a WriteAssist critic can only produce a verdict and a list of suggested fixes; it cannot apply them. All edits flow through one place, `/auto-revise-chapter`, where they are visible and gated.

Capability is split cleanly:

- **Creators** (`story-architect`, `character-developer`, `world-builder`, `research-assistant`, `twist-engineer`) hold `Write, Edit`. They make artifacts.
- **Critics** (the seven gating plus three advisory) hold `Read, Grep, Glob`. They judge artifacts.

That accounts for fifteen agents (5 creators plus 10 critics). The sixteenth is `timeline-keeper`, a read-only (`Read, Grep, Glob`) advanced helper that backs `/update-timeline`. It and `twist-engineer` are the two optional advanced helpers documented in `docs/ADVANCED.md`; with them the full roster is sixteen. The eleven core agents are the 4 creators plus the 7 gating critics.

If a critic reports "cannot write file" during a review, that is correct behavior, not a bug. The review path is read-only by design.

**Tradeoff:** the read-only split means a critic that spots a one-character fix cannot just make it; the fix is routed through the revision command. That extra hop is the price of an auditable, separation-of-duties pipeline.

---

## 5. Why git worktrees for revisions

`/auto-revise-chapter` runs each revision pass in its own git worktree and branch (for example `.worktrees/chapter-01-pass-2`). This is plain Git: `git worktree add`, then `cd`, then `commit`. It is not a special harness capability, and the framework deliberately does not pretend otherwise.

The properties this buys:

- **Auditability.** Each pass is a separate commit on its own branch. `git diff` between passes shows exactly what a revision changed.
- **Rollback.** A bad revision pass lives on its own branch and never corrupts the author's working copy. Discarding it is dropping a branch.
- **Isolation.** Re-review runs against a clean, committed state, not a half-edited buffer.

The auto-revise loop applies fixes by confidence (auto-apply at high confidence, inline markers in the middle band, suggest-only below that, skip-and-log at the bottom), with em-dash removal forced to confidence 1.0 on every pass because the hook is the mechanical backstop. After a pass, the panel re-runs.

**Tradeoff:** worktrees require the project to be a git repo and add filesystem and bookkeeping overhead per pass. In exchange, the revision history is a first-class, inspectable artifact instead of an opaque in-place rewrite.

---

## 6. The four-tier review engine

There is exactly one review engine. Earlier internal iterations carried a numeric "score at least 8.0, iterate to perfect" threshold; that has been removed everywhere. The shipped engine is the four-tier rubric with a dual gate.

### The rubric

| Tier | Meaning |
|------|---------|
| Strong Pass | Exceptional, publication-ready. |
| Pass | Solid, meets standards. |
| Needs Work | Functional but has clear issues. |
| Fail | Critical problems present. |

### The agent, critic, and gate table

The seven gating critics are exactly the seven dimensions of the engine, each backed by one named, read-only agent. The set of agents equals the set of critics equals the gate denominator. There are no orphan dimensions and no phantom agents.

| Dimension | Agent | Tools | Weight | Critical-fail override |
|-----------|-------|-------|--------|------------------------|
| Continuity and Logic | continuity-checker | Read, Grep, Glob | 20% | any Fail forces Revise |
| Rules Compliance | rule-enforcer | Read, Grep, Glob | 15% | Fail at confidence >= 0.90 forces Revise |
| Voice and Prose | voice-consistency | Read, Grep, Glob | 15% | Fail at confidence >= 0.90 forces Revise |
| Characters and Arc | character-critic | Read, Grep, Glob | 15% | none |
| Pacing and Flow | pacing-master | Read, Grep, Glob | 12.5% | none |
| Dialogue and Subtext | dialogue-coach | Read, Grep, Glob | 12.5% | none |
| Engagement and Impact | engagement-critic | Read, Grep, Glob | 10% | none |

Three advisory agents (`sensitivity-reviewer`, `thematic-guide`, `grammar-clarity`) can run alongside the panel. They give polish feedback but never participate in either gate or any override.

### The dual gate

A chapter passes only when both gates pass and no critical fail fires:

- **Panel gate:** at least 5 of the 7 gating critics return Pass or Strong Pass.
- **Weighted gate:** mapping tiers to values (Strong Pass 10, Pass 8, Needs Work 6, Fail 4) and applying the weights above, the weighted score is at least 7.0.
- **Critical-fail override:** a Fail from Continuity (any confidence), or from Rules or Voice at confidence >= 0.90, forces Revise regardless of the gates.

A single threshold is easy to game and hard to interpret; one weak number can be masked by strong ones. The dual gate is harder to satisfy by accident: a chapter can clear the weighted average yet still be sent back because too few critics individually passed, or because one critical dimension hard-failed. The override exists because some defects (a continuity contradiction, a hard rule violation) are disqualifying no matter how good the rest is.

### Why named, parallel critics

`/review-chapter` launches the seven critics as named parallel Task calls (`subagent_type: continuity-checker`, and so on), each in its own clean context. Two reasons:

1. **Isolation of judgment.** A single agent asked to "play seven critics" leaks context between dimensions and tends to converge its scores. Seven separate contexts keep the judgments independent.
2. **It makes the least-privilege guarantee load-bearing.** Because the critics are the actual tool-isolated agents and not inline general-purpose prompts, "the reviewer physically cannot edit the manuscript" is true on the live path, not decorative.

---

## 7. The cost-aware pruning rule

The only cost optimization in the engine is honest and small. The seven gating critics always run; the gate denominator never changes. Advisory critics are conditionally skipped:

- `/review-chapter <file> --fast` skips all advisory critics.
- `sensitivity-reviewer` is skipped when `author-rules.md` declares no sensitivity constraint.

There is no claimed percentage token-reduction headline, because none was reproducible. The rule is documented because it is implementable and true, not because it makes a number look good.

---

## 8. Honest caveats

- **Scores are a stopping rule, not truth.** The tiers and gates are qualitative model judgments. They are calibrated to be useful as a forcing function for revision, not presented as objective measurement. The one deterministic guarantee in the system is the em-dash gate.
- **Parallel review costs tokens.** Seven critics in clean contexts is roughly seven critic-sized inferences per review. The design buys isolation and speed and pays in tokens; batch operations multiply that and carry an explicit `--limit` guard and a cost banner (see `docs/ADVANCED.md`).
- **The hook catches what its regex catches.** It is a strong, deterministic gate for the specific banned token, not a general prose linter.
- **MCP reach is parked.** Drive, Gmail, and Calendar commands live in `integrations/` so the core framework keeps its "works on the first run, no external auth" property.

The bottom line: one honest engine, named tool-isolated agents that actually run, deterministic enforcement where determinism is possible, and labeled heuristics where it is not.
