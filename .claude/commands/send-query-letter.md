# Send Query Letter

**Recipient(s):** $ARGUMENTS

Compose and send a query letter to literary agents/editors, using the `query-coach` agent for the body and Gmail MCP for delivery.

## Prerequisites

- Gmail MCP authenticated (`mcp__claude_ai_Gmail__authenticate` + `complete_authentication`).
- `04-Project-Management/query-tracker.md` exists (created on first run).
- `story-compendium.md` filled in (the agent pulls hook, comp titles, word count, genre from here).

## Behavior

### With argument: `agent-name <email@domain>` or path to a `.md` agent file
Spawns `query-coach` to draft a personalized query referencing the agent's MSWL (manuscript wishlist) if known. Enters **plan mode** with the draft. After approval, sends via Gmail and appends an entry to `04-Project-Management/query-tracker.md`:

```markdown
| Date | Agent | Email | Status | Personalization | Notes |
|------|-------|-------|--------|-----------------|-------|
| 2026-05-12 | Jane Smith | js@agency.com | sent | Loved their MSWL note on workplace fiction | (none) |
```

### No argument
Lists tracker entries with status `pending` and prompts which to send. Useful when batching follow-ups.

## What `query-coach` produces

- Hook (1-2 sentences, voice-matched to project-config.md)
- Brief plot setup (3-4 sentences)
- Comp titles (pulled from market-analyst notes if present)
- Bio (from `04-Project-Management/author-bio.md`)
- Sample chapter inclusion if the recipient accepts pages

## What this command does NOT do

- Send unsolicited mass queries. Plan-mode approval is required per recipient.
- Spoof reply-to addresses. The Gmail account used is whatever's authenticated.
- Track replies, that's manual. Update the tracker when you hear back.

## Follow-up policy

The `query-tracker.md` includes a `next-followup-date` column (auto-set to send+8 weeks). A weekly cron (see `cron-setup.md`) reads this and surfaces pending follow-ups via `PushNotification`.
