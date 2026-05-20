import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { requireAdmin } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  const unauthorized = await requireAdmin(req, corsHeaders);
  if (unauthorized) return unauthorized;

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Calculate the past week range
  const now = new Date();
  const weekEnd = new Date(now);
  weekEnd.setHours(23, 59, 59, 999);
  const weekStart = new Date(now.getTime() - 7 * 86400000);
  weekStart.setHours(0, 0, 0, 0);

  const weekStartStr = weekStart.toISOString().split("T")[0];
  const weekEndStr = weekEnd.toISOString().split("T")[0];

  // Check if digest already exists for this week
  const { data: existing } = await supabase
    .from("weekly_digests")
    .select("id")
    .eq("week_start", weekStartStr)
    .maybeSingle();

  // Fetch articles from the past week by lane
  const { data: articles, error: fetchErr } = await supabase
    .from("articles")
    .select("id, title, url, description, primary_lane, source, published_at")
    .gte("published_at", weekStart.toISOString())
    .lte("published_at", weekEnd.toISOString())
    .order("published_at", { ascending: false })
    .limit(200);

  if (fetchErr || !articles || articles.length === 0) {
    return new Response(JSON.stringify({ error: "No articles found for this week" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }

  // Group by lane
  const byLane: Record<string, typeof articles> = {};
  articles.forEach(a => {
    if (!byLane[a.primary_lane]) byLane[a.primary_lane] = [];
    byLane[a.primary_lane].push(a);
  });

  // Build article list for AI prompt
  const articleList = articles.map(a =>
    `[${a.primary_lane}] "${a.title}" — ${a.description || 'No description'} (${a.url})`
  ).join("\n");

  const prompt = `You are an AI newsletter editor for "AI Operating Portal", a curated intelligence feed for AI professionals. Write a weekly digest for the week of ${weekStartStr} to ${weekEndStr}.

Here are this week's articles grouped by lane:
${articleList}

Generate a weekly digest in JSON format with this exact structure:
{
  "title": "A compelling, concise newsletter title for this week (e.g. 'AI Digest: Week of Apr 7-13')",
  "intro": "A 2-3 sentence engaging introduction summarizing the biggest themes this week. Write in a confident, editorial voice.",
  "sections": [
    {
      "lane": "pulse",
      "label": "🔵 Biggest AI Development",
      "headline": "The single most impactful headline this week",
      "blurb": "A 2-3 sentence summary of why this matters. Conversational but informative.",
      "articleUrl": "the URL of the selected article",
      "articleTitle": "exact title of the selected article"
    },
    {
      "lane": "business_impact",
      "label": "🟢 Best Business/ROI Story",
      "headline": "...",
      "blurb": "...",
      "articleUrl": "...",
      "articleTitle": "..."
    },
    {
      "lane": "tool_radar",
      "label": "🟣 Best Useful Tool",
      "headline": "...",
      "blurb": "...",
      "articleUrl": "...",
      "articleTitle": "..."
    },
    {
      "lane": "builder_lab",
      "label": "🟠 Best Builder Update",
      "headline": "...",
      "blurb": "...",
      "articleUrl": "...",
      "articleTitle": "..."
    }
  ],
  "wildcard_picks": [
    {
      "headline": "A surprising or interesting pick",
      "blurb": "1-2 sentence blurb",
      "articleUrl": "...",
      "articleTitle": "..."
    }
  ],
  "selected_article_urls": ["url1", "url2", ...]
}

Rules:
- Select the BEST story from each lane category
- Add 1-2 wildcard picks that are surprising, unique, or cross-cutting
- Blurbs should be conversational, punchy, and informative — like a Substack newsletter
- Use the exact article URLs and titles from the provided list
- All content must be in English
- Return ONLY valid JSON, no markdown fences`;

  // Call Lovable AI Gateway
  const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${lovableApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!aiResponse.ok) {
    const errText = await aiResponse.text();
    console.error("AI Gateway error:", errText);
    return new Response(JSON.stringify({ error: "AI generation failed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }

  const aiResult = await aiResponse.json();
  const content = aiResult.choices?.[0]?.message?.content;
  
  let digest;
  try {
    digest = JSON.parse(content);
  } catch (e) {
    console.error("Failed to parse AI response:", content);
    return new Response(JSON.stringify({ error: "Failed to parse digest" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }

  // Find article IDs from URLs
  const selectedUrls = digest.selected_article_urls || [];
  const selectedArticles = articles.filter(a => selectedUrls.includes(a.url));
  const articleIds = selectedArticles.map(a => a.id);

  // Upsert the digest
  const upsertData = {
    week_start: weekStartStr,
    week_end: weekEndStr,
    title: digest.title,
    intro: digest.intro,
    sections: digest.sections,
    wildcard_picks: digest.wildcard_picks,
    article_ids: articleIds,
    status: "draft",
    generated_at: new Date().toISOString(),
  };

  const { error: upsertErr } = existing
    ? await supabase.from("weekly_digests").update(upsertData).eq("id", existing.id)
    : await supabase.from("weekly_digests").insert(upsertData);

  if (upsertErr) {
    console.error("Upsert error:", upsertErr);
    return new Response(JSON.stringify({ error: "Failed to save digest" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }

  return new Response(JSON.stringify({ success: true, digest: upsertData }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
});
