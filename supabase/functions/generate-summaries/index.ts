import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LANES = ["pulse", "business_impact", "tool_radar", "builder_lab"];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString();
  const results: any[] = [];

  for (const lane of LANES) {
    // Fetch top articles for this lane from last 24h
    const { data: articles } = await supabase
      .from("articles")
      .select("id, title, description, source")
      .eq("primary_lane", lane)
      .gte("published_at", yesterday)
      .order("published_at", { ascending: false })
      .limit(5);

    if (!articles || articles.length === 0) {
      console.log(`No recent articles for ${lane}, skipping summary`);
      continue;
    }

    // Rules-based summary from headlines
    const headlines = articles.map((a, i) => `${i + 1}. ${a.title}`).join(". ");
    const summaryText = `Today's top ${lane.replace("_", " ")} stories: ${headlines}`;

    // Upsert summary for today + lane
    const { error } = await supabase.from("daily_summaries").upsert(
      {
        summary_date: today,
        lane,
        summary_text: summaryText.slice(0, 2000),
        top_article_ids: articles.map(a => a.id),
      },
      { onConflict: "summary_date,lane" }
    );

    if (error) {
      console.error(`Summary upsert error for ${lane}:`, error);
    } else {
      results.push({ lane, articles: articles.length });
    }
  }

  // Create a general "today in AI" summary — focus on pulse + business_impact only
  const { data: topArticles } = await supabase
    .from("articles")
    .select("id, title, url, primary_lane")
    .in("primary_lane", ["pulse", "business_impact"])
    .gte("published_at", yesterday)
    .order("published_at", { ascending: false })
    .limit(8);

  if (topArticles && topArticles.length > 0) {
    // Store title|||url pairs so the frontend can render clickable links
    const generalSummary = topArticles.map(a => `• ${a.title}|||${a.url}`).join("\n");
    await supabase.from("daily_summaries").upsert(
      {
        summary_date: today,
        lane: "general",
        summary_text: generalSummary.slice(0, 4000),
        top_article_ids: topArticles.map(a => a.id),
      },
      { onConflict: "summary_date,lane" }
    );
  }

  return new Response(JSON.stringify({ summaries: results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
});
