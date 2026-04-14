

## Change Ingestion Frequency to Every 1 Hour

**Feasibility**: Yes, fully feasible. The current setup uses Inngest cron scheduling, so it's a single line change. GNews API has a daily request limit (100 for free tier), so hourly calls (24/day) should stay within limits since each call fetches a small batch.

### Changes

1. **`supabase/functions/inngest/index.ts`** — Change cron from `"0 */12 * * *"` to `"0 * * * *"` (every hour on the hour). Update the function name to reflect the new cadence.

2. **Re-sync Inngest** — After deploying, visit the serve endpoint URL to sync the updated schedule with Inngest.

### Technical Note

After deployment, you'll need to re-sync the Inngest serve endpoint so it picks up the new cron schedule. This is done by visiting the function URL once in a browser.

