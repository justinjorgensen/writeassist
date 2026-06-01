# Send Query Letter

**Recipient(s):** $ARGUMENTS

Compose and send a query letter to literary agents/editors. This command drafts the letter inline and uses the Gmail MCP for delivery.

> **Status:** parked roadmap command. It depends on the Gmail MCP being wired up; treat it as a planned integration, not a guaranteed live path.

## Prerequisites

- Gmail MCP authenticated (`mcp__claude_ai_Gmail__authenticate` + `complete_authentication`).
- `04-Project-Management/query-tracker.md` exists (created on first run).
- `story-compendium.md` filled in (the command pulls hook, comp titles, word count, genre from here).

## Behavior

### With argument: `agent-name <email@domain>` or path to a `.md` agent file
Drafts a personalized query inline, referencing the agent's MSWL (manuscript wishlist) if known. Enters **plan mode** with the draft. After approval, sends via Gmail and appends an entry to `04-Project-Management/query-tracker.md`:

```markdown
| Date | Agent | Email | Status | Personalization | Notes |
|------|-------|-------|--------|-----------------|-------|
| 2026-05-12 | Jane Smith | js@agency.com | sent | Loved their MSWL note on workplace fiction | (none) |
```

### No argument
Lists tracker entries with status `pending` and prompts which to send. Useful when batching follow-ups.

## What the draft contains

- Hook (1-2 sentences, voice-matched to project-config.md)
- Brief plot setup (3-4 sentences)
- Comp titles (pulled from `story-compendium.md` if present)
- Bio (from `04-Project-Management/author-bio.md`)
- Sample chapter inclusion if the recipient accepts pages

## What this command does NOT do

- Send unsolicited mass queries. Plan-mode approval is required per recipient.
- Spoof reply-to addresses. The Gmail account used is whatever's authenticated.
- Track replies, that's manual. Update the tracker when you hear back.

## Follow-up policy

The `query-tracker.md` includes a `next-followup-date` column (auto-set to send+8 weeks). A scheduled job can read this and surface pending follow-ups via `PushNotification`.
