
-- 1. user_profiles
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2. user_preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_lanes JSONB NOT NULL DEFAULT '[]'::jsonb,
  preferred_tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  preferred_sources JSONB NOT NULL DEFAULT '[]'::jsonb,
  pulse_weight NUMERIC NOT NULL DEFAULT 1,
  business_weight NUMERIC NOT NULL DEFAULT 1,
  tools_weight NUMERIC NOT NULL DEFAULT 1,
  builder_weight NUMERIC NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users view own prefs" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users insert own prefs" ON public.user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own prefs" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "users delete own prefs" ON public.user_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- 3. article_interactions
CREATE TABLE IF NOT EXISTS public.article_interactions (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('impression','click','save','like','hide','share')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB
);
ALTER TABLE public.article_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users view own interactions" ON public.article_interactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users insert own interactions" ON public.article_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users delete own interactions" ON public.article_interactions
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_interactions_user ON public.article_interactions(user_id, interaction_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_interactions_article ON public.article_interactions(article_id, interaction_type);
CREATE UNIQUE INDEX IF NOT EXISTS idx_interactions_unique_save_like_hide
  ON public.article_interactions(user_id, article_id, interaction_type)
  WHERE interaction_type IN ('save','like','hide');

-- 4. updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_user_profiles_updated ON public.user_profiles;
CREATE TRIGGER trg_user_profiles_updated BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_user_preferences_updated ON public.user_preferences;
CREATE TRIGGER trg_user_preferences_updated BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. Auto-create profile + preferences on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
    NEW.raw_user_meta_data->>'avatar_url'
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_preferences (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
