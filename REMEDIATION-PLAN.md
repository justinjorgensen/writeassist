# WriteAssist v2 Remediation Plan (Goal Loop)

> Produced from a full technical audit of the harness (skills, agents, commands, hooks, docs) on 2026-07-03.
> This file is self-contained: a fresh session needs no other context to execute it.
> Overall audit verdict: sound architecture, badly maintained state. Score 38/100. No re-architecture needed; consolidate and repair.

## Loop Protocol (read this first, every iteration)

1. Read this entire file, including Locked Decisions and the Work Log.
2. Pick the FIRST unchecked task, in order. Phases are ordered by dependency; do not skip ahead except where a task says it is independent.
3. Complete the task exactly as scoped. If reality differs from the evidence cited (files change between sessions), re-verify before acting and note the difference in the Work Log.
4. Run the task's Verify step. A task is done only when Verify passes.
5. Check the box, add a Work Log entry (date, task ID, one line on what was done, any deviation).
6. After task R-00 exists, commit after each completed task with message `remediation: R-NN short description`.
7. Stop the iteration cleanly when context is getting long or after 3-5 tasks; the next session resumes from the first unchecked box.
8. NEVER use em dash characters in any file, ever (project rule). When a task requires referring to the em dash, write "em dash (U+2014)" or use the regex escape `\x{2014}`, never the literal glyph.

## Locked Decisions (do not re-litigate; record any forced deviation in the Work Log)

- D1: The v2 tier-based review engine WINS. `review-engine.md` (4 tiers: Strong Pass / Pass / Needs Work / Fail; panel gate 5/7 Pass+; weighted gate >= 7.0; critical-fail overrides) is canonical. The v1 system (10 agents, numeric scores, all dimensions >= 8.0) is deprecated and must be removed everywhere.
- D2: Final pass formula is `(panel_gate AND weighted_gate) AND no_critical_fails`. The OR variant in review-engine.md line 557 is a bug.
- D3: `.claude/docs/review-engine.md` is the ONLY file allowed to contain gate numbers, tier values, weights, and iteration caps. Every other file links to it.
- D4: Delete these agents: `meta-coordinator`, `simple-content-analyzer`, `context-filter`. Convert `agent-roster.md` from an agent into a doc at `.claude/docs/agent-roster.md`, regenerated from frontmatter.
- D5: `series-coordinator` survives but its tools become `Read, Grep, Glob, Task` (strip Write, Edit) to match the documented isolation policy.
- D6: Review critics are spawned as the NAMED read-only agents, not general-purpose. Core-7 mapping: Prose -> style-editor, Pacing -> pacing-master, Character -> beta-reader-sim (character/arc lens), Dialogue -> dialogue-coach, Continuity -> continuity-checker, Engagement -> beta-reader-sim is NOT reused twice; Engagement -> critic-sim, Rules -> rule-enforcer. (If a mapping proves poor in practice, note it, but do not fall back to general-purpose.)
- D7: Canonical paths and names: chapters at `02-Manuscript/Chapter-NN-Title.md` (flat, no Book subdirs by default); WRPs at `05-wrp/chapter-NN-wrp.md`; style guide at `04-Project-Management/style-guide.md`; outline at `01-Planning/outline.md`; review reports at `.claude/state/reviews/`; versioning via git (timestamp/iteration backup files are deprecated).
- D8: All agent and command cross-references use kebab-case file names exactly as they exist on disk.
- D9: Every unmeasured performance number (78%, 29%, 10x, ~30 seconds, 40-60%, 50-80%, fake benchmark tables, fake "learned" weights) is deleted, not relabeled.
- D10: `/ultrareview` does not exist. The final publish gate is `/code-review ultra` (a Claude Code built-in). Rename references accordingly.
- D11: Batch commands become thin composition loops over the single-chapter commands. Batch context passes `--no-plan` and suppresses interactive checkpoints explicitly.

---

## Phase 0: Foundation (strict order)

- [x] **R-00: Initialize git.**
  Why: the project is NOT a git repository, yet `auto-revise-chapter.md` mandates a git-worktree revision loop and `batch-review-and-revise.md` claims branch-per-batch. Both fail at runtime today. Git also gives revert safety for this whole remediation.
  Do: `git init`; create `.gitignore` covering `.claude/state/`, `.worktrees/`, `*-backup-*.md`, `archive/`; initial commit of the whole project.
  Verify: `git log --oneline` shows the initial commit; `git status` is clean.

- [x] **R-01: Fix the pass-formula contradiction and crown the engine doc.**
  Evidence: `.claude/commands/review-chapter.md:177` requires `(panel AND weighted) AND no_critical_fails`; `.claude/docs/review-engine.md:557` says `(panel AND weighted) OR no_critical_fails`, which passes chapters that fail both gates.
  Do: change line 557 (locate by content, line may drift) to the AND form per D2. Add a header note to review-engine.md declaring it the single source of truth for all gate numbers (D3). Also fix its internal arithmetic slip: line ~708 says pass if `pass_count/critics_run >= 0.70` but line ~721 claims 5 critics "need 4 passes (80%)"; make the label match the rule.
  Verify: grep review-engine.md for `OR no_critical_fails` returns nothing; the doc states it is canonical.

- [x] **R-02: Repair the em-dash sweep corruption.**
  Evidence (a global character sweep replaced em dashes with commas, destroying meaning):
  - `CLAUDE.md:49`: defines the banned character as a comma: "em dashes (`,` or `--`)". Should read: em dash (U+2014) or `--`.
  - `MIGRATION.md:77`: migration grep `grep -rlP ',|(?<!-)--(?!-)'` matches every comma in every file. First alternative should be `\x{2014}`.
  - `.claude/commands/auto-revise-chapter.md:123`: `if "em dash" in fix.summary.lower() or "," in fix.location:` forces confidence 1.0 auto-apply on ANY fix whose location contains a comma. The `","` should be the U+2014 escape/reference.
  - `.claude/commands/auto-revise-chapter.md:164-177`: BEFORE/AFTER example strings differ only by a space; rewrite so the BEFORE genuinely demonstrates the violation (describe the em dash textually or use the escape).
  - `.claude/skills/improv-story-form/SKILL.md:50`: "replace `,` with commas/colons/parentheses" is nonsense; fix.
  - `.claude/docs/system-guides/cron-setup.md:33`: unclosed `[CRITICAL,` bracket; restore intended text.
  - Ungrammatical few-shot examples where dashes were deleted without replacement punctuation: `.claude/agents/story-architect.md:165`, `.claude/agents/character-developer.md:63`; restore grammar with commas/colons.
  Constraint: do NOT introduce literal em dash glyphs while fixing (rule 8 above); use "em dash (U+2014)" prose or `\x{2014}` in regexes.
  Verify: each listed site reads sensibly; `grep -rP '\x{2014}' .` over the repo returns only intentional regex escapes, no literal glyphs.

- [x] **R-03: Defuse the continuity-checker revision deadlock.**
  Evidence: `.claude/agents/continuity-checker.md:168,218` contains literal em dash glyphs AND prescribes em-dash-formatted manuscript fixes; the em-dash-guard hook rejects such edits, so auto-revision burns its 5 iterations in a blocked loop.
  Do: rewrite both examples using commas/parentheses; ensure no instruction anywhere in the file suggests em-dash punctuation.
  Verify: `grep -nP '\x{2014}' .claude/agents/continuity-checker.md` returns nothing.

## Phase 1: One review engine, real isolation

- [x] **R-10: Propagate the v2 engine everywhere (D1, D3).**
  Evidence: these files still specify the deprecated v1 gate (10 agents, all scores >= 8.0): `CLAUDE.md` (WRP workflow and Quality Standards sections, "10 parallel agents", "8.0+ across 10 quality dimensions"), `.claude/commands/execute-wrp.md:312-343,378-386` (gates on `any_score < 8.0` across 10 role labels, three of which map to no agent), `batch-execute-wrp.md`, `batch-review-and-revise.md`, `batch-operations.md` (also invents an 8.5 threshold found nowhere else), `workshop-ingestion.md:176-181`, `.claude/docs/system-guides/ultrareview-gate.md:27,56`, `.claude/skills/writeassist-workflow/SKILL.md:34,46`, `workflow-guide.md:76-100` (claims 10 agents at line 76 and 7 critics at line 170 in the same file).
  Do: rewrite each quality/gating passage to say: "Gating is defined in `.claude/docs/review-engine.md` (panel 5/7 Pass+, weighted >= 7.0, critical-fail overrides, max 5 revision iterations)." Remove every "8.0", "10 agents", and "10 dimensions" claim. Keep the max-5-iterations cap (it is consistent already).
  Verify: `grep -rn "8\.0" CLAUDE.md .claude/commands .claude/skills .claude/docs/system-guides` returns no gating claims outside review-engine.md; no file except review-engine.md states tier values or weights.

- [x] **R-11: One critic output schema, declared in every reviewer agent.**
  Evidence: the engine consumes JSON `{"critic","tier","confidence","one_line_reason","fixes"}`, but only continuity-checker speaks it. Others use 7/10 (pacing-master), 8.5/10 plus percentages (voice-consistency), 3.5/5 (critic-sim), Critical/Major/Minor (transition-validator), CRITICAL/WARNING/NOTICE (rule-enforcer), or nothing at all (12+ agents).
  Do: define the schema once in review-engine.md. Add an "## Output Contract" section to every reviewer agent in `.claude/agents/` (all Read/Grep/Glob agents used in reviews) mandating that exact JSON as the final output, with the four tiers. transition-validator keeps its transition-specific body but wraps the verdict in the same schema. rule-enforcer's violation tag becomes `[RULE VIOLATION: rule-name]` to match CLAUDE.md (currently emits `[CRITICAL VIOLATION: ...]`).
  Verify: every reviewer agent file contains an Output Contract section referencing the shared schema; `grep -rln "X/10\|/5 average" .claude/agents/` returns nothing.

- [x] **R-12: Spawn named read-only agents in review-chapter (D6).**
  Evidence: `.claude/commands/review-chapter.md:419-431` spawns all critics as `subagent_type="general-purpose"`, which holds Write/Edit; the celebrated v2 tool isolation never applies to the main pipeline.
  Do: replace the 7 general-purpose persona spawns with the named agents per D6's mapping, launched in parallel in one message. Update `smart-review.md` to select from the same named set (and fix its internal contradiction: Step 2 forces 2 critics, Step 3 marks 4 as "always included"; pick one forced set). Remove creator agents (character-developer, world-builder) from smart-review's reviewer roster; substitute read-only equivalents (beta-reader-sim, continuity-checker cover the gaps).
  Verify: `grep -n "general-purpose" .claude/commands/review-chapter.md .claude/commands/smart-review.md` returns nothing; every subagent_type named exists as a file in `.claude/agents/`.

- [x] **R-13: Make the em-dash guard actually block (PreToolUse).**
  Evidence: `.claude/scripts/em-dash-guard.sh` is registered PostToolUse; empirically tested: it exits 2 AFTER the file is written, so the em dash is already on disk. CLAUDE.md's claim "em dashes literally cannot be written" is false. Bash writes bypass it entirely.
  Do: add a PreToolUse hook (matcher `Write|Edit`) that inspects `tool_input.content` / `tool_input.new_string` for the pattern `\x{2014}|(?<!-)--(?!-)` on guarded paths and denies (exit 2 on PreToolUse blocks the call). Keep the existing PostToolUse scan as a backstop for edits that slip through. Register both in `.claude/settings.json`. Update CLAUDE.md's Zero Em Dash Policy wording to describe the real mechanism. Optional hardening: switch the script's literal glyph in its regex to `\x{2014}` so the repo contains zero literal em dashes.
  Verify: simulate a PreToolUse payload with an em dash in new_string piped to the new script; exit code is 2 and no file is touched.

## Phase 2: Namespace and dead weight

- [x] **R-20: Delete orphaned agents; demote the roster (D4, D5).**
  Evidence: five agents are referenced by zero commands or docs: `agent-roster` (a stale doc with agent frontmatter; claims "16 Specialists, non-overlapping" against 29 overlapping files), `simple-content-analyzer` (duplicate of content-analyzer with contradictory thresholds and a hardcoded fictional character list), `context-filter` (250 lines of inert pseudo-Python, fabricated benchmarks, holds Write in violation of policy), `meta-coordinator` (routes to six nonexistent agents, holds undocumented Bash, fake "learned" weights), `series-coordinator` (holds Write+Edit+Task against policy).
  Do: delete `simple-content-analyzer.md`, `context-filter.md`, `meta-coordinator.md`. Move agent-roster's content to `.claude/docs/agent-roster.md`, regenerated accurately from the surviving agents' frontmatter (correct count, kebab-case names, honest overlap notes); delete the agent file. Edit series-coordinator frontmatter to `tools: Read, Grep, Glob, Task`.
  Verify: `.claude/agents/` contains 25 files; `grep -rn "meta-coordinator\|simple-content-analyzer\|context-filter" .claude/ CLAUDE.md` returns only the new roster doc's honest notes or nothing; series-coordinator frontmatter has no Write/Edit.

- [ ] **R-21: Fix broken identifiers.**
  Evidence: agent bodies cross-reference in snake_case while files are kebab-case; `rules_enforcer` (plural) appears in content-analyzer and smart-review vs the real `rule-enforcer`; the phantom command name `batch-review-and-fix` appears in `CLAUDE.md:54`, `project-config.md:91`, `.claude/docs/system-guides/PARALLEL-EXECUTION-GUIDE.md:131`, `parallel-review-implementation.md:210`, `.claude/commands/validate-transitions.md:101`, and `batch-review-and-revise.md:344`.
  Do: global pass converting every agent/command cross-reference to the exact on-disk kebab-case name (D8); fix all `batch-review-and-fix` to `batch-review-and-revise`.
  Verify: a script that extracts every `[a-z_]+_[a-z_]+` agent-like token and every `/command` reference from `.claude/` and checks it resolves to a file finds zero unresolved names (this becomes the lint in R-41).

- [ ] **R-22: Purge phantom agents and commands.**
  Evidence, nonexistent AGENTS referenced as real: `reader_analyst` (curate-chapters:63,140,184; critic-sim; marketing-strategist), `competitive_positioning` (marketing-strategist, publisher-desk, query-coach), `genre-specialist` (rule-enforcer), `theme-explorer` (workshop-ingestion; real agent is thematic-guide), `foreshadowing` (twist-engineer), "Emotion engineer / Theme explorer / Sensory specialist" (batch-operations:167-177), "Story Compendium Manager agent" (write-chapter:11,130). Nonexistent COMMANDS referenced as real: `/restore-chapter` (auto-revise-chapter:347), `compile-manuscript` (batch-review-and-revise:345), `query-prep.md`, `market-ready.md`, `review-sim.md`, `adaptation-assess.md`, `polish-chapter` (across agent Integration Points sections), `/ultrareview` (CLAUDE.md, MIGRATION.md, ultrareview-gate.md, writeassist-workflow SKILL.md).
  Do: replace each phantom with the nearest real referent (theme-explorer -> thematic-guide; reader_analyst -> beta-reader-sim; Story Compendium Manager agent -> the story-compendium-manager command; /restore-chapter -> git revert now that R-00 exists) or delete the reference. Apply D10: /ultrareview references become /code-review ultra; rename `ultrareview-gate.md` content accordingly.
  Verify: the R-21 resolver script passes; `grep -rn "ultrareview" .` returns only historical notes in MIGRATION.md if any.

- [ ] **R-23: Remove prior-project residue.**
  Evidence: "Divine Replica" worked examples with characters Elena/Emma/Marcus in `continuity-checker.md` and `transition-validator.md:106` region and `validate-transitions.md:41,152`; hardcoded `known_characters = ["Sarah", "Marcus", "Dr. Chen", "Alice"]` in simple-content-analyzer (moot if R-20 deleted it).
  Do: rewrite examples with clearly generic placeholders ("[Protagonist]", "[Sibling, age 7]") so no model treats them as story facts.
  Verify: `grep -rn "Divine Replica\|Elena\|Dr. Chen" .claude/` returns nothing.

- [ ] **R-24: Delete fabricated metrics; archive obsolete v1 docs (D9).**
  Evidence: unmeasured and mutually contradictory claims: 78% token reduction / 29% faster (CLAUDE.md:106,170; workflow-guide:98-99; cron-setup:41; writeassist-workflow SKILL:35) vs smart-review's own 40-60% / 50-80% / 50%; "10x speed", "~30 seconds vs ~5 minutes", "~2-5MB context" (PARALLEL-EXECUTION-GUIDE:73-75,203-206; parallel-review-implementation:91; README:23; execute-wrp:325; batch-review-and-revise:270; project-config:95); fake CPU/memory dashboards (batch-execute-wrp:226-231). Also: `PARALLEL-EXECUTION-GUIDE.md` and `parallel-review-implementation.md` are obsolete v1 docs (10 agents, numeric 1-10, general-purpose spawns) still listed as "Core Guides" in `system-guides/README.md:11-12` and pointed to by CLAUDE.md:57.
  Do: delete every unmeasured number. Move the two v1 docs to `.claude/docs/archive/` with a deprecation header, or rewrite PARALLEL-EXECUTION-GUIDE to describe the v2 engine and delete parallel-review-implementation (it is an older draft of review-chapter.md). Update system-guides/README.md to list what actually exists (it also omits cron-setup.md and ultrareview-gate.md and mislocates review-engine.md).
  Verify: `grep -rn "78%\|29%\|10x\|~30 sec" . --include="*.md"` returns nothing outside archive/.

## Phase 3: Command layer contracts

- [ ] **R-30: Add frontmatter and input contracts to all commands.**
  Evidence: none of the 28 files in `.claude/commands/` has YAML frontmatter (no description, argument-hint, allowed-tools, model). Several commands CLAUDE.md documents as taking arguments contain no `$ARGUMENTS` token (curate-chapters, dialogue-specialist, write-chapter, smart-review, validate-transitions). `execute-wrp.md:9` hard-prepends `05-wrp/` to its argument, breaking full paths.
  Do: add frontmatter to every command: `description`, `argument-hint` where args exist; `allowed-tools` restricting read-only commands (review, validate, compare, curate) to non-mutating tools. Add `$ARGUMENTS` handling with explicit missing-arg behavior (list available targets and stop, or documented default). Fix execute-wrp to accept either a bare name or a path.
  Verify: `head -1 .claude/commands/*.md` shows `---` for all files; each command states its no-arg behavior.

- [ ] **R-31: Batch commands compose the single-chapter commands (D11).**
  Evidence: batch-generate-wrp reimplements generate-wrp (dropping its plan gate and the promised --no-plan handshake); batch-execute-wrp restates the whole write/review/fix loop with invented artifacts (`-scores.md` sidecars nothing produces) and fictional "Parallel-4" threading; batch-review-and-revise restates review+revise with a THIRD confidence ladder (3-band vs auto-revise's 4-band) plus impossible "Continuous Monitoring Mode"; batch-operations names three nonexistent agents and an 8.5 threshold. Autonomy contradiction: execute-wrp promises "No User Interaction Required" while auto-revise prompts the user at iteration 3.
  Do: rewrite each batch command as a thin loop: "for each target: invoke the single command with --no-plan; on failure, record and continue; emit one batch report at `.claude/state/batch-reports/`". Delete Parallel-4, dashboards, monitoring mode, sidecar artifacts. Single confidence ladder: keep auto-revise's 4-band ladder, delete the 3-band copy. Resolve autonomy: auto-revise's iteration-3 checkpoint is suppressed when invoked by execute-wrp or a batch command (state this in auto-revise itself, once).
  Verify: batch files reference their single-chapter counterparts by name; `grep -rn "Parallel-4\|CPU\|Memory bar\|Continuous Monitoring" .claude/commands/` returns nothing; only one confidence ladder exists in the repo.

- [ ] **R-32: One artifact contract (D7).**
  Evidence of drift: WRP filenames have three conventions (generate-wrp.md:15 vs :48 disagree with themselves; batch-generate-wrp:128 uses a third); chapter paths are flat vs `[Book]/` (execute-wrp:18) vs `Book-[Number]/` with underscores (write-chapter:8,143); initialize-story-compendium:70-74 writes `style-guide.md` at root (real file: `04-Project-Management/style-guide.md`); workshop-ingestion Phase 4 writes `outline.md` at an ambiguous path (canonical: `01-Planning/outline.md`); `update-timeline.md:122` writes `01-Planning/timeline-验证.md` (garbled localization artifact); three versioning schemes (compare-drafts `versions/`, auto-revise `-backup-[timestamp]`, execute-wrp `-iteration-N`).
  Do: write a short "Artifact Contract" section into review-engine.md or a new `.claude/docs/artifact-contract.md` with the D7 canon; fix every listed site to match; versioning becomes git (backups deprecated, delete the backup instructions). Also fill or fix `write-chapter.md`, which ships as an unfilled bracket-placeholder template invoking a nonexistent agent; either make it a real command consistent with execute-wrp or mark it explicitly as requiring project setup.
  Verify: `grep -rn "验证\|Book-\[Number\]\|\[Book\]" .claude/commands/` returns nothing; all output paths across commands match the contract doc.

- [ ] **R-33: Close the Drive privacy hole and the marker leak.**
  Evidence: `sync-to-drive.md` has NO plan-mode gate (send-query-letter and schedule-writing-time both gate), and `--beta` (line 22) mints an anyone-with-link public-comment share with zero confirmation. Its exclusions (lines 30-35) miss execute-wrp's `-draft`/`-iteration-N` backups and the `[AR-NNN]` / `<!-- AR-SUGGEST-NNN -->` scaffolding auto-revise writes INTO chapters (auto-revise:272-283, no cleanup step), plus write-scene's `[SCENE ADDED]` markers and update-timeline's in-chapter time comments.
  Do: add a plan-mode gate to sync-to-drive (list exactly what will be shared and with what permissions; require approval); extend exclusions to all backup/draft name patterns; add a pre-sync check that refuses to sync any file containing AR/SCENE markers. Add an explicit final "strip all markers" step to auto-revise-chapter and write-scene before a chapter is declared done.
  Verify: sync-to-drive contains a plan-mode gate section; auto-revise contains a marker-strip step; grep for the marker patterns in sync-to-drive's exclusion logic finds them handled.

- [ ] **R-34: Wire up observability.**
  Evidence: `statusline.sh:48-55` reads `.claude/state/reviews/*.md` for the last-review-score segment, but NO command writes there; the segment permanently shows `last:...`. Review results are otherwise ephemeral (no persistence path in review-chapter). `post-chapter-review.sh:7` header comment says `.claude/.pending-review` while line 20 writes `.claude/state/pending-review.txt`.
  Do: review-chapter (and smart-review) write their final report to `.claude/state/reviews/<chapter>-<n>.md` including a `X.X/10`-formatted weighted score line the statusline regex can find. Fix the post-chapter-review comment. Optional: cap writing-tracker.md growth (update-tracker.sh appends unboundedly on every Stop).
  Verify: run a review (or simulate a report file); statusline emits a real score instead of `last:...`.

## Phase 4: Tests and lint (the drift catchers)

- [ ] **R-40: Build the smoke fixtures and make assertions assertable.**
  Evidence: `.claude/docs/smoke-tests.md` is a manual checklist; none of its eight fixtures exist (`find . -name "test-*.md"` is empty); expected outputs assert exact confidence values (e.g. 0.98) from nondeterministic LLM judgments; Test 8 contradicts the gating spec (says weighted score is display-only; review-chapter says it gates).
  Do: create the eight fixture chapters under `03-Resources/smoke-fixtures/` with planted, unambiguous defects; rewrite each test's Expected section to assert only decidable properties: critic output validates against the R-11 schema, the planted defect's dimension lands at Needs Work or Fail, clean fixture passes the panel gate, em-dash fixture trips the guard (exit 2). Fix Test 8 to match D2/D3 gating.
  Verify: each fixture exists; smoke-tests.md contains no exact-confidence or timing assertions.

- [ ] **R-41: Write the framework lint script.**
  Do: create `.claude/scripts/lint-framework.sh` that checks: (1) no literal em dash (U+2014) anywhere in the repo, and no bare `--` in manuscript dirs; (2) every agent name referenced in `.claude/` resolves to a file in `.claude/agents/`; (3) every `/command` reference resolves to `.claude/commands/`; (4) gate numbers (8.0, tier values, weights) appear ONLY in review-engine.md; (5) all commands have frontmatter; (6) the agent-roster doc's list matches the agents directory exactly. Exit nonzero with a findings list.
  Verify: script runs clean on the remediated repo; deliberately breaking one rule makes it fail.

- [ ] **R-42: Final consistency pass and re-audit.**
  Do: correct stale counts everywhere (CLAUDE.md:33 says "24 slash command implementations"; actual is 27, or the post-remediation number); update MIGRATION.md to describe the remediation; regenerate the roster doc; run lint (R-41) and the smoke checklist (R-40); update this file's Work Log with a closing summary and the new self-assessed score.
  Verify: lint passes; every checkbox above this one is checked; `git log` shows one commit per task.

---

## Work Log

(Each iteration appends: date, task ID, what was done, deviations.)

- 2026-07-03: Plan created from the full harness audit. No tasks executed yet.
- 2026-07-03: R-00 done. git init, .gitignore (.claude/state/, .worktrees/, *-backup-*.md, archive/), initial commit. No deviations.
- 2026-07-03: R-01 done. review-engine.md line 557 OR changed to AND (D2); canonical source-of-truth header added (D3); pruned-panel example at old line 721 relabeled so 4/5 passes is explained against the 70% rule. No deviations.
- 2026-07-03: R-02 done. Fixed CLAUDE.md:49 (banned char now "U+2014 or --"), MIGRATION.md:77 grep first alternative to \x{2014}, auto-revise-chapter.md:123 comma check to a — escape, auto-revise BEFORE/AFTER examples rewritten with an <EM DASH> placeholder, improv SKILL.md:50, cron-setup.md:33 restored to [CRITICAL]. Deviations: (a) the broken few-shot was in story-architect.md:63 not :165 (fixed with colon/semicolon); (b) character-developer.md:63 example already reads grammatically, left unchanged; (c) additionally converted the functional regex glyphs in em-dash-guard.sh and statusline.sh to \x{2014} escapes (verified they still match) and de-glyphed help.html. Remaining literal glyphs are only in files owned by later tasks: continuity-checker.md (R-03), parallel-review-implementation.md (R-24 archive), smoke-tests.md (R-40).
- 2026-07-03: R-03 done. continuity-checker.md:168 example rewritten with parentheses, :218 FIX rewritten with commas; grep -nP for U+2014 on the file returns nothing; no em-dash-style punctuation prescribed anywhere in the file. Note: the Divine Replica / Elena / Emma residue in these same examples is deliberately left for R-23.
- 2026-07-03: R-10 done. All v1 gate claims (8.0, 10 agents, 10 dimensions) replaced with the standard review-engine.md gating sentence in: CLAUDE.md, execute-wrp.md, batch-execute-wrp.md, batch-review-and-revise.md, batch-operations.md (8.5 threshold deleted), workshop-ingestion.md (also its 8.5 "critical chapters" gate and three extra 8.0 sites beyond the cited lines), ultrareview-gate.md, writeassist-workflow SKILL.md, workflow-guide.md, sync-to-drive.md:19. Beyond the evidence list: review-chapter.md's duplicated tier-value table, weight list, and worked weighted-gate example were replaced with links to review-engine.md (D3), and auto-revise-chapter.md's numeric tier parentheticals dropped. Verify grep clean; the only remaining hits are in PARALLEL-EXECUTION-GUIDE.md and parallel-review-implementation.md, which R-24 archives.
- 2026-07-03: R-11 done. Schema already existed in review-engine.md (Critic Output Schema section); added an Output Contract section to all 13 reviewer agents (style-editor, pacing-master, beta-reader-sim, dialogue-coach, continuity-checker, critic-sim, rule-enforcer, voice-consistency, grammar-clarity, thematic-guide, timeline-keeper, sensitivity-reviewer, transition-validator). Unified scales: beta-reader-sim 7/10, pacing-master 7/10, voice-consistency 8.5/10 and 95%+, critic-sim 3.5/5 all converted to tiers; rule-enforcer tag now [RULE VIOLATION: rule-name]. transition-validator keeps its body, wraps verdict per contract. Deviations: content-analyzer excluded (selector, not a critic); the last numeric-scale grep hit is meta-coordinator.md, deleted in R-20.
- 2026-07-03: R-12 done. review-chapter.md parallel-execution section rewritten: D6 named-agent mapping table added, XML example uses style-editor/pacing-master, anti-example no longer names a generic agent type. smart-review.md fully rewritten: named read-only roster (creator agents character-developer/world-builder removed, beta-reader-sim and continuity-checker cover the gaps), forced set resolved to Continuity+Rules only (Step 2 wins; style-editor now prunable), snake_case names fixed, numeric X.X/10 output replaced with tiers, fabricated percentage claims dropped (D9), pruned-gate numbers now deferred to review-engine.md. Verify: no generic-agent spawns remain in either file; all named subagent_types exist on disk.
- 2026-07-03: R-13 done. New .claude/scripts/em-dash-guard-pre.sh inspects tool_input.content/new_string on guarded paths and exits 2 (deny) on \x{2014} or bare --; registered as PreToolUse Write|Edit in settings.json; PostToolUse scan kept as backstop. CLAUDE.md Zero Em Dash Policy and Hooks sections now describe the real mechanism, including the Bash bypass caveat. Script-regex hardening was already done in R-02. Verified with 4 simulated payloads: em dash on guarded path exit 2, bare -- exit 2, clean content exit 0, em dash on unguarded path exit 0; no file touched.
- 2026-07-03: R-20 done. Deleted simple-content-analyzer.md, context-filter.md, meta-coordinator.md, agent-roster.md (agent); .claude/agents/ now has exactly 25 files. New .claude/docs/agent-roster.md generated from frontmatter (25 agents: 17 read-only, 8 with write access; honest overlap notes; removal record). series-coordinator tools now Read, Grep, Glob, Task. CLAUDE.md agent-count paragraph corrected (29 to 25, meta-coordinator dropped); MIGRATION.md line 53 rewritten as a historical note. Verify grep returns only the roster doc and the historical note.
