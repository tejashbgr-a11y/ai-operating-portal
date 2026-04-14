import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── Classification ──────────────────────────────────────────────────────────

// Words that indicate general news / not business impact even if company names appear
const NOISE_PATTERNS = [
  /attack/i, /accused/i, /arrest/i, /murder/i, /kill/i, /assault/i,
  /police/i, /crime/i, /lawsuit against/i, /sued/i, /scandal/i,
  /divorce/i, /death/i, /died/i, /shooting/i, /bomb/i, /threat/i,
  /protest/i, /fired from/i, /resign/i, /controversy/i,
];

const BUILDER_KEYWORDS = [
  "api", "sdk", "framework", "open source", "open-source", "oss", "agent framework",
  "mcp", "rag", "vector database", "vector db", "vectordb", "evals", "eval",
  "fine-tuning", "fine tuning", "finetuning", "inference",
  "developer", "tutorial", "engineering", "github", "repository", "repo",
  "library", "package", "npm", "pip", "crate", "deploy", "kubernetes",
  "docker", "devops", "mlops", "langchain", "llamaindex", "hugging face",
  "huggingface", "transformer", "benchmark", "training data", "dataset",
];

const TOOL_KEYWORDS = [
  "ai tool", "ai app", "ai plugin", "ai extension", "ai assistant", "ai workflow",
  "browser extension", "chrome extension", "productivity app", "saas",
  "try it", "free tier", "beta access", "waitlist", "playground", "demo",
  "copilot", "chatbot", "generator", "ai editor", "ai builder",
  "no-code", "low-code", "nocode", "new tool", "just launched",
];

// Business Impact requires STRONG signals — not just company name mentions
const BUSINESS_KEYWORDS = [
  "enterprise ai", "ai adoption", "ai roi", "return on investment",
  "cost reduction", "cost savings", "customer support automation",
  "go-to-market", "gtm strategy", "sales automation", "marketing automation",
  "hr automation", "ai operations", "ai consulting",
  "business transformation", "digital transformation", "ai revenue",
  "efficiency gains", "workforce ai", "ai strategy",
  "case study", "implementation story", "ai deployment",
  "supply chain ai", "logistics ai", "finance ai",
  "productivity gains", "automation roi", "ai business case",
  "enterprise adoption", "ai spending", "ai budget",
  "competitive advantage", "market impact", "industry disruption",
];

function classifyArticle(title: string, description: string, source?: string): { primary_lane: string; secondary_tags: string[] } {
  const text = `${title} ${description}`.toLowerCase();
  const tags: string[] = [];

  // Check for noise — if the article is about crime/scandal, it's always Pulse
  const isNoise = NOISE_PATTERNS.some(p => p.test(text));

  // Score using keyword matching (require multi-word phrases to match more strictly)
  const builderScore = BUILDER_KEYWORDS.filter(k => text.includes(k)).length;
  const toolScore = TOOL_KEYWORDS.filter(k => text.includes(k)).length;
  const businessScore = BUSINESS_KEYWORDS.filter(k => text.includes(k)).length;

  // Source-based boosting: Substack and Medium articles are more likely analysis/business content
  const isAnalysisSource = source && (
    source.toLowerCase().includes("substack") ||
    source.toLowerCase().includes("medium") ||
    source.toLowerCase().includes("strategy") ||
    source.toLowerCase().includes("operator")
  );
  const businessBoost = isAnalysisSource ? 1 : 0;

  // Collect tags
  if (text.includes("api")) tags.push("API");
  if (text.includes("sdk")) tags.push("SDK");
  if (text.includes("framework")) tags.push("framework");
  if (text.match(/open[- ]?source|oss/)) tags.push("open_source");
  if (text.includes("agent")) tags.push("agents");
  if (text.includes("mcp")) tags.push("MCP");
  if (text.includes("rag")) tags.push("RAG");
  if (text.match(/vector[- ]?db|vector[- ]?database|vectordb/)) tags.push("vector_db");
  if (text.includes("model") && (text.includes("release") || text.includes("launch"))) tags.push("model_release");
  if (text.includes("research") || text.includes("paper") || text.includes("arxiv")) tags.push("research");
  if (text.includes("regulation") || text.includes("policy") || text.includes("law")) tags.push("regulation");
  if (text.includes("funding") || text.includes("raised") || text.includes("investment")) tags.push("funding");
  if (text.includes("enterprise")) tags.push("enterprise");
  if (text.includes("roi") || text.includes("return on")) tags.push("roi");
  if (text.includes("automat")) tags.push("automation");
  if (text.includes("productiv")) tags.push("productivity");
  if (text.includes("tutorial") || text.includes("guide") || text.includes("how to")) tags.push("tutorial");
  if (text.match(/\bai tool\b|\bai app\b/)) tags.push("tools");
  if (text.includes("launch")) tags.push("launch");
  if (text.includes("workflow")) tags.push("workflow");
  if (text.includes("github")) tags.push("open_source");
  if (text.includes("case study")) tags.push("case_study");

  // If noise detected, force to pulse regardless of keyword matches
  if (isNoise) {
    return { primary_lane: "pulse", secondary_tags: [...new Set(tags)].slice(0, 8) };
  }

  let primary_lane = "pulse";
  const adjustedBusinessScore = businessScore + businessBoost;
  const maxScore = Math.max(builderScore, toolScore, adjustedBusinessScore);

  // Require a minimum threshold for non-pulse classification
  if (maxScore >= 2) {
    if (builderScore === maxScore) primary_lane = "builder_lab";
    else if (toolScore === maxScore) primary_lane = "tool_radar";
    else if (adjustedBusinessScore === maxScore) primary_lane = "business_impact";
  } else if (maxScore === 1) {
    // Single keyword match — only classify if it's a strong signal
    if (builderScore === 1 && toolScore === 0 && adjustedBusinessScore === 0) primary_lane = "builder_lab";
    else if (toolScore === 1 && builderScore === 0 && adjustedBusinessScore === 0) primary_lane = "tool_radar";
    // Single business keyword is NOT enough — keep as pulse
  }

  return { primary_lane, secondary_tags: [...new Set(tags)].slice(0, 8) };
}

// ── URL Canonicalization ────────────────────────────────────────────────────

function canonicalize(url: string): string {
  try {
    const u = new URL(url);
    // Strip tracking params
    const strip = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "ref", "source", "via"];
    strip.forEach(p => u.searchParams.delete(p));
    // Remove trailing slash
    let canonical = u.origin + u.pathname.replace(/\/+$/, "") + u.search;
    return canonical;
  } catch {
    return url;
  }
}

async function hashString(s: string): Promise<string> {
  const data = new TextEncoder().encode(s);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// ── GNews Fetcher ───────────────────────────────────────────────────────────

const GNEWS_QUERIES = [
  { query: '(AI OR "artificial intelligence" OR LLM OR OpenAI OR Anthropic OR "Google DeepMind")', lane_hint: "pulse" },
  { query: '("enterprise AI" OR "AI adoption" OR "AI ROI" OR "AI productivity" OR "AI operations")', lane_hint: "business_impact" },
  { query: '("AI tool" OR "AI app" OR "AI assistant" OR "AI workflow tool" OR "AI plugin")', lane_hint: "tool_radar" },
  { query: '("AI API" OR "AI SDK" OR "AI framework" OR "open source AI" OR "agent framework" OR "RAG" OR "vector database" OR MCP)', lane_hint: "builder_lab" },
];

async function fetchGNews(apiKey: string): Promise<any[]> {
  const articles: any[] = [];
  for (const { query } of GNEWS_QUERIES) {
    try {
      const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=10&apikey=${apiKey}`;
      const res = await fetch(url);
      if (!res.ok) {
        console.error(`GNews query failed [${res.status}]: ${query}`);
        continue;
      }
      const data = await res.json();
      if (data.articles) {
        articles.push(...data.articles.map((a: any) => ({
          title: a.title,
          url: a.url,
          description: a.description,
          image_url: a.image,
          published_at: a.publishedAt,
          source: a.source?.name || "GNews",
          raw_provider: { provider: "gnews", original: a },
        })));
      }
    } catch (e) {
      console.error(`GNews fetch error for query "${query}":`, e);
    }
  }
  return articles;
}

// ── RSS Fetcher ─────────────────────────────────────────────────────────────

async function fetchRSS(feedUrl: string, sourceName: string, sourceId: string): Promise<any[]> {
  try {
    const res = await fetch(feedUrl, {
      headers: { "User-Agent": "AI-Operating-Portal/1.0" },
    });
    if (!res.ok) {
      console.error(`RSS fetch failed [${res.status}] for ${sourceName}: ${feedUrl}`);
      return [];
    }
    const xml = await res.text();
    return parseRSSItems(xml, sourceName, sourceId);
  } catch (e) {
    console.error(`RSS error for ${sourceName}:`, e);
    return [];
  }
}

function parseRSSItems(xml: string, sourceName: string, sourceId: string): any[] {
  const items: any[] = [];
  // Simple XML parsing for RSS items
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1];
    const title = extractTag(item, "title");
    const link = extractTag(item, "link") || extractGuid(item);
    const description = extractTag(item, "description");
    const pubDate = extractTag(item, "pubDate");

    if (title && link) {
      items.push({
        title: stripCDATA(title),
        url: link.trim(),
        description: stripHTML(stripCDATA(description || "")).slice(0, 500),
        published_at: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        source: sourceName,
        source_id: sourceId,
        raw_provider: { provider: "rss", feed_url: sourceName },
      });
    }
  }

  // Also try Atom <entry> format
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/gi;
  while ((match = entryRegex.exec(xml)) !== null) {
    const entry = match[1];
    const title = extractTag(entry, "title");
    const link = extractAtomLink(entry);
    const summary = extractTag(entry, "summary") || extractTag(entry, "content");
    const published = extractTag(entry, "published") || extractTag(entry, "updated");

    if (title && link) {
      items.push({
        title: stripCDATA(title),
        url: link.trim(),
        description: stripHTML(stripCDATA(summary || "")).slice(0, 500),
        published_at: published ? new Date(published).toISOString() : new Date().toISOString(),
        source: sourceName,
        source_id: sourceId,
        raw_provider: { provider: "rss", feed_url: sourceName },
      });
    }
  }

  return items.slice(0, 15);
}

function extractTag(xml: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = xml.match(regex);
  return m ? m[1] : null;
}

function extractGuid(xml: string): string | null {
  return extractTag(xml, "guid");
}

function extractAtomLink(xml: string): string | null {
  const m = xml.match(/<link[^>]*href=["']([^"']+)["'][^>]*\/?>/i);
  return m ? m[1] : null;
}

function stripCDATA(s: string): string {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();
}

function stripHTML(s: string): string {
  return s.replace(/<[^>]+>/g, "").replace(/&[#\w]+;/g, " ").replace(/\s+/g, " ").trim();
}

// ── GitHub Trending ─────────────────────────────────────────────────────────

async function fetchGitHubTrending(): Promise<any[]> {
  const articles: any[] = [];
  try {
    // Use GitHub API search for recently created/updated AI repos
    const queries = [
      `topic:ai topic:llm pushed:>${getDateDaysAgo(2)}`,
      `topic:agent topic:framework pushed:>${getDateDaysAgo(2)}`,
      `topic:rag pushed:>${getDateDaysAgo(3)}`,
      `topic:mcp pushed:>${getDateDaysAgo(3)}`,
      `AI tool stars:>50 pushed:>${getDateDaysAgo(3)}`,
    ];

    for (const q of queries) {
      try {
        const res = await fetch(
          `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=5`,
          { headers: { "User-Agent": "AI-Operating-Portal/1.0", Accept: "application/vnd.github.v3+json" } }
        );
        if (!res.ok) continue;
        const data = await res.json();
        if (data.items) {
          articles.push(...data.items.map((repo: any) => ({
            title: `${repo.full_name}: ${repo.description || "New AI repository"}`,
            url: repo.html_url,
            description: `⭐ ${repo.stargazers_count} stars · ${repo.language || "Multi-language"} · ${repo.description || ""}`.slice(0, 500),
            published_at: repo.pushed_at || repo.created_at,
            source: "GitHub",
            image_url: repo.owner?.avatar_url || null,
            raw_provider: { provider: "github", repo: repo.full_name, stars: repo.stargazers_count, language: repo.language },
          })));
        }
      } catch (e) {
        console.error("GitHub search error:", e);
      }
    }
  } catch (e) {
    console.error("GitHub trending error:", e);
  }

  // Dedupe by repo URL
  const seen = new Set<string>();
  return articles.filter(a => {
    if (seen.has(a.url)) return false;
    seen.add(a.url);
    return true;
  });
}

function getDateDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
}

// ── Main Ingestion ──────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const gnewsApiKey = Deno.env.get("GNEWS_API_KEY");

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  let body: any = {};
  try { body = await req.json(); } catch {}
  const sourceFilter = body.source; // optional: "gnews" | "rss" | "github" | "all"

  const runStart = new Date().toISOString();
  let totalFetched = 0;
  let totalInserted = 0;
  let totalDuplicates = 0;
  let totalMalformed = 0;
  let totalFailed = 0;
  let errorMessages: string[] = [];

  // ── Collect articles from all sources ──────────────────────
  let allArticles: any[] = [];

  // 1. GNews
  if ((!sourceFilter || sourceFilter === "all" || sourceFilter === "gnews") && gnewsApiKey) {
    try {
      const gnewsArticles = await fetchGNews(gnewsApiKey);
      allArticles.push(...gnewsArticles);
      console.log(`GNews: fetched ${gnewsArticles.length} articles`);
    } catch (e: any) {
      errorMessages.push(`GNews: ${e.message}`);
    }
  }

  // 2. RSS feeds
  if (!sourceFilter || sourceFilter === "all" || sourceFilter === "rss") {
    const { data: rssSources } = await supabase
      .from("sources")
      .select("*")
      .eq("type", "rss")
      .eq("is_active", true);

    if (rssSources) {
      for (const src of rssSources) {
        if (src.base_url) {
          try {
            const rssArticles = await fetchRSS(src.base_url, src.name, src.id);
            allArticles.push(...rssArticles);
            console.log(`RSS ${src.name}: fetched ${rssArticles.length} articles`);
          } catch (e: any) {
            errorMessages.push(`RSS ${src.name}: ${e.message}`);
          }
        }
      }
    }
  }

  // 3. Substack (treated as RSS with /feed appended)
  if (!sourceFilter || sourceFilter === "all" || sourceFilter === "substack") {
    const { data: substackSources } = await supabase
      .from("sources")
      .select("*")
      .eq("type", "substack")
      .eq("is_active", true);

    if (substackSources) {
      for (const src of substackSources) {
        if (src.base_url) {
          const feedUrl = src.base_url.replace(/\/$/, "") + "/feed";
          try {
            const articles = await fetchRSS(feedUrl, src.name, src.id);
            allArticles.push(...articles);
            console.log(`Substack ${src.name}: fetched ${articles.length} articles`);
          } catch (e: any) {
            errorMessages.push(`Substack ${src.name}: ${e.message}`);
          }
        }
      }
    }
  }

  // 4. GitHub trending
  if (!sourceFilter || sourceFilter === "all" || sourceFilter === "github") {
    try {
      const ghArticles = await fetchGitHubTrending();
      allArticles.push(...ghArticles);
      console.log(`GitHub: fetched ${ghArticles.length} repos`);
    } catch (e: any) {
      errorMessages.push(`GitHub: ${e.message}`);
    }
  }

  totalFetched = allArticles.length;
  console.log(`Total fetched: ${totalFetched}`);

  // ── Insert articles ────────────────────────────────────────
  for (const article of allArticles) {
    // Validate
    if (!article.title || !article.url) {
      totalMalformed++;
      continue;
    }

    // Skip non-English articles (detect CJK, Arabic, Cyrillic, Thai, Devanagari characters)
    if (/[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af\u0600-\u06ff\u0400-\u04ff\u0e00-\u0e7f\u0900-\u097f]/.test(article.title)) {
      totalMalformed++;
      continue;
    }

    const canonical = canonicalize(article.url);
    const hash = await hashString(canonical);
    const { primary_lane, secondary_tags } = classifyArticle(article.title, article.description || "", article.source || "");

    try {
      const { error } = await supabase.from("articles").insert({
        title: article.title.slice(0, 500),
        url: article.url,
        canonical_url: canonical,
        canonical_hash: hash,
        source: article.source || null,
        source_id: article.source_id || null,
        published_at: article.published_at || null,
        description: (article.description || "").slice(0, 1000),
        image_url: article.image_url || null,
        primary_lane,
        secondary_tags,
        raw_provider: article.raw_provider || null,
      });

      if (error) {
        if (error.code === "23505") {
          // Duplicate
          totalDuplicates++;
        } else {
          console.error("Insert error:", error);
          totalFailed++;
        }
      } else {
        totalInserted++;
      }
    } catch (e: any) {
      console.error("Insert exception:", e);
      totalFailed++;
    }
  }

  // ── Log ingestion run ──────────────────────────────────────
  const runEnd = new Date().toISOString();
  const runStatus = totalFailed > 0 || errorMessages.length > 0 ? "completed_with_errors" : "completed";

  await supabase.from("ingestion_runs").insert({
    started_at: runStart,
    ended_at: runEnd,
    status: runStatus,
    source_name: sourceFilter || "all",
    query_used: sourceFilter || "all sources",
    articles_fetched: totalFetched,
    articles_inserted: totalInserted,
    duplicates_skipped: totalDuplicates,
    malformed_skipped: totalMalformed,
    failed_count: totalFailed,
    error_message: errorMessages.length > 0 ? errorMessages.join("; ") : null,
  });

  const result = {
    status: runStatus,
    fetched: totalFetched,
    inserted: totalInserted,
    duplicates: totalDuplicates,
    malformed: totalMalformed,
    failed: totalFailed,
    errors: errorMessages,
  };

  console.log("Ingestion complete:", JSON.stringify(result));

  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
});
