import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { requireAdmin } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  const unauthorized = await requireAdmin(req, corsHeaders);
  if (unauthorized) return unauthorized;

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY")!;
    const sb = createClient(supabaseUrl, serviceKey);

    // Get builder_lab and tool_radar articles with short/missing descriptions
    const { data: articles, error } = await sb
      .from("articles")
      .select("id, title, url, description, primary_lane, source")
      .in("primary_lane", ["builder_lab", "tool_radar"])
      .order("ingested_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    const needsSummary = (articles ?? []).filter(
      (a) => !a.description || a.description.length < 80
    );

    console.log(`Found ${needsSummary.length} articles needing summaries`);

    let updated = 0;

    for (const article of needsSummary) {
      try {
        const prompt = `Write a concise 50-100 word summary for this ${article.primary_lane === "builder_lab" ? "developer/builder" : "AI tool"} article. Focus on what readers will learn or what the tool does. Be specific and practical.

Title: ${article.title}
Source: ${article.source || "unknown"}
URL: ${article.url}
${article.description ? `Existing description: ${article.description}` : ""}

Return ONLY the summary text, no quotes or labels.`;

        const aiResp = await fetch(
          "https://ai.gateway.lovable.dev/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${lovableKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              messages: [
                {
                  role: "system",
                  content:
                    "You are a tech editor writing brief article summaries for an AI intelligence portal. Be specific, practical, and concise.",
                },
                { role: "user", content: prompt },
              ],
            }),
          }
        );

        if (!aiResp.ok) {
          console.error(`AI error for ${article.id}: ${aiResp.status}`);
          continue;
        }

        const aiData = await aiResp.json();
        const summary = aiData.choices?.[0]?.message?.content?.trim();

        if (summary && summary.length > 30) {
          const { error: updateErr } = await sb
            .from("articles")
            .update({ description: summary })
            .eq("id", article.id);

          if (updateErr) {
            console.error(`Update error for ${article.id}:`, updateErr);
          } else {
            updated++;
            console.log(`Updated summary for: ${article.title.slice(0, 60)}`);
          }
        }

        // Small delay to avoid rate limits
        await new Promise((r) => setTimeout(r, 500));
      } catch (e) {
        console.error(`Error processing ${article.id}:`, e);
      }
    }

    return new Response(
      JSON.stringify({
        processed: needsSummary.length,
        updated,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-article-summaries error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
