# Integrations (Optional, Parked)

The BASE WriteAssist framework runs with **zero external accounts**: no API keys, no MCP servers. Clone it, open
it in Claude Code, and every core feature works: the hooks load, the statusline
renders, the agents and slash commands resolve, and the em-dash guard enforces
itself. You do not need any accounts, API keys, OAuth flows, or MCP servers to
write, review, and revise chapters.

The commands in this directory are **parked**. They are intentionally kept out of
the core surface because they depend on external MCP servers that the framework
cannot guarantee are present. They are here as a roadmap and as working reference
implementations, not as part of the first-run experience.

---

## What is parked here

| Command | What it does | Requires |
|---------|--------------|----------|
| `sync-to-drive.md` | Pushes the manuscript (or one chapter) to Google Drive so beta readers and editors can comment. | Google **Drive** MCP server |
| `send-query-letter.md` | Drafts a personalized query letter and sends it, with a plan-mode approval gate. | Google **Gmail** MCP server |
| `schedule-writing-time.md` | Blocks writing time on your calendar with an attached word-count goal. | Google **Calendar** MCP server |

### A note on `improv-story-form`

The `improv-story-form` skill used to live in this directory. It has **moved** to
`.claude/skills/improv-story-form/`, because it is a skill and that is where
skills belong. It is a self-contained, no-auth premise builder (it needs no MCP
server at all), so keeping it under `integrations/` was misleading. It stays
optional and is not wired into the core flow; it is just resolved as a normal
skill now. See `docs/ADVANCED.md` for what it does.

---

## The opt-in project MCP path (`.mcp.json`)

The parked Drive / Gmail / Calendar commands above need MCP servers. The repo
ships a documented, **inert** template for wiring those up at the project level:
`.mcp.json.example` in the repo root.

Claude Code only loads a file named exactly `.mcp.json`. The committed file is
`.mcp.json.example`, so nothing is active on a fresh clone and clone-and-go still
works with zero external accounts. To opt in:

1. `cp .mcp.json.example .mcp.json`
2. Delete the server blocks you do not want, fill in the real command / args /
   credentials for the ones you keep, and remove the `_comment` / `_disabled`
   keys from those blocks.
3. Restart Claude Code so it picks up the project MCP config.

The active `.mcp.json` holds real tokens, so it is git-ignored; only the
`.example` template is committed. Never put live credentials in the template.

The template also documents a **local filesystem** server entry, which is the
non-Drive way to export outside this directory. You usually do not need even
that: the bundled, zero-dependency `manuscript-compile` skill
(`.claude/skills/manuscript-compile/`) concatenates `02-Manuscript/*.md` into a
single manuscript file with no MCP server at all. Reach for `.mcp.json` only when
you specifically want Drive sync or cross-directory file access.

---

## Why they are not in the core framework

The core property worth protecting is **"works on the first run, with no external
auth."** That is what makes the repo demonstrable on any machine and keeps the
quickstart honest. The moment a core command needs a Drive token or a Gmail OAuth
handshake, "works on first run" becomes false for anyone who has not set that up.

So these three live here instead. The narrative still reaches all the way to
beta-reader sync and query letters, but as an opt-in roadmap rather than a broken
first-run promise.

---

## How to enable one

These commands are activated by the MCP servers, not by the framework. To use one:

1. Install and authenticate the relevant MCP server for your Claude Code setup
   (Drive, Gmail, or Calendar). Each parked command file lists the exact
   `authenticate` / `complete_authentication` calls it expects.
2. Move or copy the command file into `.claude/commands/` so Claude Code resolves
   it as a slash command by bare filename.
3. Run it like any other command. It will prompt for authentication on first use
   if the MCP server is connected but not yet authorized.

Until you do that, the BASE framework neither needs nor references these commands,
and nothing in the core pipeline breaks by their absence.

---

## What works without external accounts

- The full WRP pipeline: `/generate-wrp`, `/execute-wrp`, `/review-chapter`,
  `/auto-revise-chapter`.
- The em-dash PostToolUse hook, the statusline, and the Stop-hook tracker.
- Every core and advanced agent and command that ships in `.claude/`.
- The `manuscript-compile` skill: a zero-dependency, no-auth export that
  concatenates `02-Manuscript/*.md` into one manuscript file. This is the local
  alternative to the parked Drive sync.
- The `improv-story-form` skill (now under `.claude/skills/`): a no-auth premise
  builder.

The parked integrations add reach. They are never a prerequisite.
