
-- Allow public inserts into subscribers (newsletter signup)
CREATE POLICY "Anyone can subscribe"
ON public.subscribers
FOR INSERT
TO public
WITH CHECK (true);

-- Allow public inserts into sources (admin can add sources)
CREATE POLICY "Anyone can add sources"
ON public.sources
FOR INSERT
TO public
WITH CHECK (true);

-- Allow public updates on sources (toggle active/inactive)
CREATE POLICY "Anyone can update sources"
ON public.sources
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);
