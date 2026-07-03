# Scheduled Jobs (Cron / Routines)

WriteAssist v2 ships three recommended scheduled agents that run via Claude Code's `CronCreate` (remote-triggered routines). These are **opt-in**, they cost a small amount per run, so the author decides whether each is worth it.

## How to install

In a Claude Code session inside `~/projects/WriteAssist-v2`, use the `schedule` skill:

```
/schedule
```

…and paste each block below when prompted. Or call `CronCreate` directly with the parameters listed.

You can list/disable any routine later with `CronList` / `CronDelete`.

---

## 1. Weekly continuity sweep, `writeassist-weekly-curate`

**Schedule:** `0 9 * * MON` (Mondays 9am local)
**Cost:** ~one large review per week.
**What it does:**
1. Runs `/curate-chapters all` against the full `02-Manuscript/`.
2. Pipes the report through `continuity-checker` + `timeline-keeper`.
3. Drops the result in `04-Project-Management/weekly-continuity-YYYY-MM-DD.md`.
4. Fires `PushNotification` if **any CRITICAL** continuity issue is found, otherwise stays silent.

**Why weekly:** continuity drift is slow. Daily is overkill; monthly is too late.

**Prompt to schedule:**
```
Run /curate-chapters all on ~/projects/WriteAssist-v2/02-Manuscript/. Save the report to 04-Project-Management/weekly-continuity-$(date +%F).md. If the report contains any line starting with [CRITICAL], send a PushNotification summarizing it. Otherwise stay silent.
```

---

## 2. Daily smart-review of recent work, `writeassist-daily-smart-review`

**Schedule:** `0 7 * * *` (every day, 7am local)
**Cost:** ~one cheap review per day (smart-review runs only the critics relevant to the chapter).
**What it does:**
1. Finds chapters modified in the **last 24 hours** in `02-Manuscript/`.
2. Runs `/smart-review` on each.
3. If any scored below 7.5, appends to `04-Project-Management/needs-attention.md`.
4. Otherwise stays silent.

**Why daily:** catches regressions while they're still fresh in the author's memory.

**Skip the run** when no chapters changed (no-op exit).

**Prompt to schedule:**
```
Find files in ~/projects/WriteAssist-v2/02-Manuscript/ modified in the last 24 hours. For each, run /smart-review. If any score is below 7.5, append a one-line entry to 04-Project-Management/needs-attention.md. If no files changed, exit silently.
```

---

## 3. Query follow-up reminder, `writeassist-query-followups`

**Schedule:** `0 10 * * MON` (Mondays 10am)
**Cost:** Tiny, just reads a tracker file.
**What it does:**
1. Reads `04-Project-Management/query-tracker.md`.
2. Finds entries with `next-followup-date` ≤ today and `status = sent`.
3. Sends a `PushNotification` listing them: *"3 queries are due for follow-up this week."*
4. Doesn't auto-send anything, the author drives follow-ups manually via `/send-query-letter`.

**Why Mondays:** start-of-week planning beat.

**Prompt to schedule:**
```
Parse ~/projects/WriteAssist-v2/04-Project-Management/query-tracker.md. List entries where next-followup-date <= today AND status = sent. If any exist, send a PushNotification with the list. If none, exit silently.
```

---

## Disabling

Stop a routine:
```
CronList    # find the ID
CronDelete  # by ID
```

Or just `/schedule` and remove it from the routine list.

## Don't add a per-write cron

Tempting but wrong: a per-write or per-minute cron will burn money and won't catch anything that the live hooks don't already catch. The hooks in `.claude/settings.json` are the always-on enforcement; cron is for **periodic sweeps** that scan accumulated state.
