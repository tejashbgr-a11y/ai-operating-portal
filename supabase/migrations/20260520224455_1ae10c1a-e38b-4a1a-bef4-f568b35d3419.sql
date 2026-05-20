
-- 1. Role system
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

DROP POLICY IF EXISTS "users view own roles" ON public.user_roles;
CREATE POLICY "users view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admins manage roles" ON public.user_roles;
CREATE POLICY "admins manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Lock down sources table
DROP POLICY IF EXISTS "Anyone can add sources" ON public.sources;
DROP POLICY IF EXISTS "Anyone can update sources" ON public.sources;

CREATE POLICY "admins insert sources" ON public.sources
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update sources" ON public.sources
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete sources" ON public.sources
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- 3. Lock down ingestion_runs visibility
DROP POLICY IF EXISTS "Public read access for ingestion_runs" ON public.ingestion_runs;
CREATE POLICY "admins view ingestion_runs" ON public.ingestion_runs
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- 4. Subscribers email validation
CREATE OR REPLACE FUNCTION public.validate_subscriber()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.email IS NULL OR NEW.email !~* '^[A-Za-z0-9._%%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'invalid email format';
  END IF;
  NEW.email := lower(trim(NEW.email));
  -- Force safe defaults on insert; ignore client-supplied status
  IF TG_OP = 'INSERT' THEN
    NEW.status := COALESCE('active', NEW.status);
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS validate_subscriber_trg ON public.subscribers;
CREATE TRIGGER validate_subscriber_trg
  BEFORE INSERT OR UPDATE ON public.subscribers
  FOR EACH ROW EXECUTE FUNCTION public.validate_subscriber();
