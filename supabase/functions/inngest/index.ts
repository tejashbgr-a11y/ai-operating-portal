import { Inngest } from "https://esm.sh/inngest@3.22.0";
import { serve } from "https://esm.sh/inngest@3.22.0/deno/fresh";

const inngest = new Inngest({ id: "ai-operating-portal" });

// ── Scheduled: Article Ingestion + Summaries (every hour) ───
const ingestArticles = inngest.createFunction(
  { id: "ingest-articles-scheduled", name: "Ingest Articles (Hourly)" },
  { cron: "0 * * * *" },
  async ({ step }) => {
    const ingestionResult = await step.run("call-ingest-edge-function", async () => {
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

    // After ingestion, regenerate daily summaries so top picks stay fresh
    const summaryResult = await step.run("regenerate-summaries", async () => {
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

    return { event: "ingest-articles", ingestionResult, summaryResult };
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
