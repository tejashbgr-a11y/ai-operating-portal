
CREATE TABLE public.weekly_digests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start date NOT NULL,
  week_end date NOT NULL,
  title text NOT NULL,
  intro text,
  sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  wildcard_picks jsonb DEFAULT '[]'::jsonb,
  article_ids jsonb DEFAULT '[]'::jsonb,
  generated_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'draft',
  UNIQUE(week_start)
);

ALTER TABLE public.weekly_digests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for weekly_digests"
  ON public.weekly_digests FOR SELECT
  TO public USING (true);
