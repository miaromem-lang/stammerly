-- Fix overly permissive waitlist_signups INSERT policy
-- The current WITH CHECK (true) allows unrestricted inserts
DROP POLICY IF EXISTS "Anyone can sign up for waitlist" ON public.waitlist_signups;

-- Restrict to prevent duplicate email signups
CREATE POLICY "Anyone can sign up for waitlist"
ON public.waitlist_signups FOR INSERT TO anon, authenticated
WITH CHECK (
  NOT EXISTS (
    SELECT 1 FROM public.waitlist_signups ws
    WHERE ws.email = waitlist_signups.email
  )
);