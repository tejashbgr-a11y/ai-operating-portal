import { Inngest } from "npm:inngest@3";
import { serve } from "npm:inngest@3/deno";

const inngest = new Inngest({ id: "ai-operating-portal" });

// ── Scheduled: Article Ingestion (every 12 hours) ───────────
const ingestArticles = inngest.createFunction(
  { id: "ingest-articles-scheduled", name: "Ingest Articles (12h)" },
  { cron: "0 */12 * * *" },
  async ({ step }) => {
    const result = await step.run("call-ingest-edge-function", async () => {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      
      const res = await fetch(`${supabaseUrl}/functions/v1/ingest-articles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({ source: "all" }),
      });

      if (!res.ok) {
        throw new Error(`Ingestion call failed [${res.status}]: ${await res.text()}`);
      }

      return await res.json();
    });

    return { event: "ingest-articles", result };
  }
);

// ── Scheduled: Daily Summaries (once per day at 6am UTC) ────
const generateDailySummaries = inngest.createFunction(
  { id: "daily-summaries-scheduled", name: "Generate Daily Summaries" },
  { cron: "0 6 * * *" },
  async ({ step }) => {
    const result = await step.run("generate-summaries", async () => {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      
      const res = await fetch(`${supabaseUrl}/functions/v1/generate-summaries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseServiceKey}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Summary generation failed [${res.status}]: ${await res.text()}`);
      }

      return await res.json();
    });

    return { event: "daily-summaries", result };
  }
);

// ── On-demand: Trigger ingestion via event ──────────────────
const ingestOnDemand = inngest.createFunction(
  { id: "ingest-on-demand", name: "Ingest Articles (On Demand)" },
  { event: "app/ingest.requested" },
  async ({ event, step }) => {
    const result = await step.run("call-ingest", async () => {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      
      const res = await fetch(`${supabaseUrl}/functions/v1/ingest-articles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({ source: event.data?.source || "all" }),
      });

      if (!res.ok) {
        throw new Error(`Ingestion failed [${res.status}]: ${await res.text()}`);
      }

      return await res.json();
    });

    return result;
  }
);

export default serve({
  client: inngest,
  functions: [ingestArticles, generateDailySummaries, ingestOnDemand],
});
