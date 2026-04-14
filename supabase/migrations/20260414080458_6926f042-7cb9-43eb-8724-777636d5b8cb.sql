
-- 1. sources
CREATE TABLE public.sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  base_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  source_category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for sources" ON public.sources FOR SELECT USING (true);

-- 2. articles
CREATE TABLE public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  canonical_url TEXT UNIQUE NOT NULL,
  canonical_hash TEXT,
  source TEXT,
  source_id UUID REFERENCES public.sources(id),
  published_at TIMESTAMP WITH TIME ZONE,
  description TEXT,
  image_url TEXT,
  primary_lane TEXT NOT NULL DEFAULT 'pulse',
  secondary_tags JSONB DEFAULT '[]'::jsonb,
  raw_provider JSONB,
  ingested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for articles" ON public.articles FOR SELECT USING (true);
CREATE INDEX idx_articles_published_at ON public.articles(published_at DESC);
CREATE INDEX idx_articles_primary_lane ON public.articles(primary_lane);
CREATE INDEX idx_articles_source ON public.articles(source);
CREATE INDEX idx_articles_ingested_at ON public.articles(ingested_at DESC);

-- 3. daily_summaries
CREATE TABLE public.daily_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  summary_date DATE NOT NULL,
  lane TEXT NOT NULL,
  summary_text TEXT,
  top_article_ids JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.daily_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for daily_summaries" ON public.daily_summaries FOR SELECT USING (true);

-- 4. ingestion_runs
CREATE TABLE public.ingestion_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'running',
  source_name TEXT,
  query_used TEXT,
  articles_fetched INTEGER DEFAULT 0,
  articles_inserted INTEGER DEFAULT 0,
  duplicates_skipped INTEGER DEFAULT 0,
  malformed_skipped INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  error_message TEXT
);
ALTER TABLE public.ingestion_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for ingestion_runs" ON public.ingestion_runs FOR SELECT USING (true);

-- 5. subscribers (NOT publicly readable - contains PII)
CREATE TABLE public.subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  source TEXT,
  wants_daily_brief BOOLEAN NOT NULL DEFAULT true,
  wants_weekly_roundup BOOLEAN NOT NULL DEFAULT true,
  wants_business_impact BOOLEAN NOT NULL DEFAULT false,
  wants_tool_radar BOOLEAN NOT NULL DEFAULT false,
  wants_builder_lab BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
-- No public read policy for subscribers - PII protection

-- 6. email_campaigns
CREATE TABLE public.email_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_type TEXT NOT NULL,
  subject TEXT,
  content_html TEXT,
  content_text TEXT,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for email_campaigns" ON public.email_campaigns FOR SELECT USING (true);

-- 7. email_campaign_articles (join table)
CREATE TABLE public.email_campaign_articles (
  campaign_id UUID NOT NULL REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  PRIMARY KEY (campaign_id, article_id)
);
ALTER TABLE public.email_campaign_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for email_campaign_articles" ON public.email_campaign_articles FOR SELECT USING (true);
