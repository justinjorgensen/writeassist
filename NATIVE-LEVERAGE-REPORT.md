# Native Leverage Report

This pass leaned WriteAssist harder on Claude Code's native surfaces (hooks, output styles, slash commands, skills, and project MCP) instead of homebrewed glue. Seven enhancements landed, three of them rewires of existing homebrew. Every verdict below was re-run fresh for this report.

## The seven enhancements

### 1. State snapshot on PreCompact and Stop (new)

`.claude/scripts/state-snapshot.sh` writes a mechanical story-state file to `.claude/state/session-state.md` (latest chapter, total word count, last review decision, active WRP, timestamp). It is wired as the `PreCompact` hook and as the last step of the `Stop` hook, so a fresh post-compaction session starts oriented and goal drift on book-length work is reduced. The script drains STDIN JSON, runs with `set -uo pipefail` (no `set -e`, since no-match greps are expected), and exits 0 quietly when inputs are missing so a session is never broken.

### 2. State restore on SessionStart (new)

`.claude/scripts/state-restore.sh` is wired as the `SessionStart` hook. It is the read side of the snapshot: snapshot writes mechanical state, restore injects it back into a new session. The two scripts are deliberately split so writing state and surfacing state stay separate concerns.

### 3. Constraint reminder on UserPromptSubmit (new)

`.claude/scripts/constraint-reminder.sh` is wired as the `UserPromptSubmit` hook so the load-bearing creative constraints (the NO EM DASHES rule chief among them) are re-asserted into context on every turn rather than relying on the model to remember.

### 4. /new-book intake command (new)

`.claude/commands/new-book.md` is a native slash command (`allowed-tools: AskUserQuestion, Read, Write, Edit`) that interviews the author with `AskUserQuestion` (mode, genre, voice, structure, plus free-text basics) and fills `project-config.md` and `author-rules.md` in-conversation, replacing the manual "fill in the brackets" chore. It does every step in the main conversation (no script, no subagent) so the author's answers stay in context, then hands off to `/outline-book` and the `voice-create` skill.

### 5. Manuscript Prose output style (new)

`.claude/output-styles/manuscript-prose.md` is an opt-in `/output-style` that shifts Claude out of the default technical register into a working-novelist voice (scene-first, show-don't-tell, reads `author-rules.md` as the binding contract, zero em dashes). It is never the default and is turned on per drafting session via `/output-style Manuscript Prose`, off via `/output-style default`.

### 6. manuscript-compile skill (new)

`.claude/skills/manuscript-compile/` (compile.py plus SKILL.md) is a zero-dependency, no-auth export that concatenates `02-Manuscript/*.md` into a single manuscript file with no MCP server at all. It is the bundled local alternative to the parked Drive sync, and it lets the README keep its "works on first run, no external accounts" promise honest.

## What homebrew was rewired

### 7a. update-tracker folded into the state snapshot

The word-count logic from `update-tracker.sh` is now folded into `state-snapshot.sh`, so mechanical state and word count are computed in one place. `update-tracker.sh` itself and `04-Project-Management/writing-tracker.md` are intentionally left untouched: the tracker script stays on the `Stop` hook and remains the human-facing writing log, while the snapshot owns machine-readable state.

### 7b. improv-story-form moved from integrations to skills

`improv-story-form/SKILL.md` was git-moved out of `integrations/` into `.claude/skills/improv-story-form/`. It is a self-contained, no-auth premise builder that needs no MCP server, so filing it under `integrations/` was misleading. It now resolves as a normal skill and stays optional, not wired into the core flow. `integrations/README.md` documents the move.

### 7c. integrations stubs reframed as opt-in project MCP

The three parked commands (`sync-to-drive`, `send-query-letter`, `schedule-writing-time`) are reframed as an opt-in roadmap behind a documented, inert `.mcp.json.example` template at the repo root. Claude Code only loads a file named exactly `.mcp.json`, so nothing is active on a fresh clone and clone-and-go still needs zero external accounts. The template carries a local-filesystem server entry plus credentialed Drive/Gmail/Calendar blocks (all `_disabled`), with `.mcp.json` git-ignored so real tokens never get committed. `integrations/README.md` now frames these as reach, never a prerequisite.

## settings.json: new hook events and permissions

`hooks` now spans `SessionStart` (state-restore), `UserPromptSubmit` (constraint-reminder), `PreCompact` (state-snapshot), `PreToolUse` on `Write|Edit|MultiEdit` (em-dash-guard), `PostToolUse` on `Bash` (em-dash-scan) and on `Write|Edit` (post-chapter-review), and `Stop` (em-dash-scan, update-tracker, state-snapshot). `permissions.allow` pre-authorizes the framework's own skill scripts (canon-lookup, manuscript-compile, prose-metrics, voice-create/update, wrp-conformance) and all four dynamic workflows so they run without prompts.

## Verify verdicts

- Settings: PASS. `.claude/settings.json` is valid JSON; `.mcp.json.example` is valid JSON. Every hook command resolves to a real script under `.claude/scripts/`.
- Hooks: PASS. All eight referenced scripts are present and executable, and `bash -n` passes on every `.sh` in `.claude/scripts/`. `manuscript-compile/compile.py` passes `py_compile`.
- Artifacts: PASS. `new-book.md`, `manuscript-prose.md`, the moved `improv-story-form/SKILL.md`, `manuscript-compile/` (compile.py + SKILL.md), and the three new hook scripts are all on disk. Repo-wide em dash scan across `.claude/`, `docs/`, `integrations/`, and `.mcp.json.example` returns a count of 0.
