# Schedule Writing Time

**Window:** $ARGUMENTS  (e.g., `weekdays 6-7am`, `tomorrow 2pm-4pm`, `saturday morning 3h`)

Block out writing time on Google Calendar with an attached word-count goal pulled from `04-Project-Management/writing-tracker.md`.

## Prerequisites

- Google Calendar MCP authenticated.
- `04-Project-Management/writing-tracker.md` exists with a `daily-target` line (default 500 words if missing).

## Behavior

1. Parse the natural-language window into concrete start/end datetimes.
2. Compute the word-count goal:
   - For a 1h block: daily-target × 0.5
   - For a 2h block: daily-target × 1.0
   - For 3h+ blocks: daily-target × (hours / 2)
3. Enter **plan mode** with the proposed event(s), recurring rules, location, reminder offsets.
4. After approval, create the calendar event(s) via the MCP.
5. Append to `04-Project-Management/writing-tracker.md`:

   ```markdown
   ## Scheduled
   - 2026-05-13 06:00-07:00 PT, target: 250 words (Chapter 7 continuation)
   ```

## Recurring blocks

When the parsed window is recurring (`weekdays`, `every saturday`, `mon-wed-fri`), create a Calendar recurring event using RRULE. Default end-date: 4 weeks out unless `--until YYYY-MM-DD` is passed.

## What writes to the event

- Title: `WriteAssist, <project-name>, <target> words`
- Description: latest WRP filename being worked on (so opening the calendar event tells you where to pick up)
- Reminder: 15 min before
- Color: green if streak ≥ 5 days, default otherwise

## Tie-in with a scheduled nudge

A scheduled job can check Calendar for that day's writing block. If a block exists and no chapter was modified during it, it surfaces a gentle nudge via PushNotification.

## What this does NOT do

- Move existing events or detect conflicts beyond Calendar's built-in conflict warning.
- Send invites to others. These are personal blocks.
