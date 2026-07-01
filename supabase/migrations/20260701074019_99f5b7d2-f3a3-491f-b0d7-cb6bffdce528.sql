
-- Restrict email_campaigns
DROP POLICY IF EXISTS "Public read access for email_campaigns" ON public.email_campaigns;
CREATE POLICY "Admins can read email_campaigns" ON public.email_campaigns
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Restrict email_campaign_articles
DROP POLICY IF EXISTS "Public read access for email_campaign_articles" ON public.email_campaign_articles;
CREATE POLICY "Admins can read email_campaign_articles" ON public.email_campaign_articles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Revoke anon grants (not needed since only admin policies)
REVOKE SELECT ON public.email_campaigns FROM anon;
REVOKE SELECT ON public.email_campaign_articles FROM anon;

-- Lock down SECURITY DEFINER functions
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
-- authenticated retains EXECUTE on has_role because RLS policies invoke it as the calling role
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
