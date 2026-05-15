
-- 1. Waitlist: restrict SELECT to admins only
CREATE POLICY "Admins can view waitlist signups"
ON public.waitlist_signups
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. Safeguarding alerts: scope to assigned therapists, add INSERT policy
DROP POLICY IF EXISTS "Therapists can view safeguarding alerts" ON public.safeguarding_alerts;
DROP POLICY IF EXISTS "Therapists can update safeguarding alerts" ON public.safeguarding_alerts;

CREATE POLICY "Assigned therapists can view safeguarding alerts"
ON public.safeguarding_alerts
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'therapist'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.therapist_assigned_quests taq
    WHERE taq.child_user_id = safeguarding_alerts.user_id
      AND taq.therapist_id = auth.uid()
  )
);

CREATE POLICY "Assigned therapists can update safeguarding alerts"
ON public.safeguarding_alerts
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'therapist'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.therapist_assigned_quests taq
    WHERE taq.child_user_id = safeguarding_alerts.user_id
      AND taq.therapist_id = auth.uid()
  )
);

CREATE POLICY "Users can create own safeguarding alerts"
ON public.safeguarding_alerts
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 3. Mood check-ins: parent policy should use parent_child_links, not context_notes
DROP POLICY IF EXISTS "Parents can view child mood checkins" ON public.mood_checkins;

CREATE POLICY "Parents can view child mood checkins"
ON public.mood_checkins
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.parent_child_links pcl
    WHERE pcl.child_user_id = mood_checkins.user_id
      AND pcl.parent_user_id = auth.uid()
      AND pcl.is_active = true
  )
);

-- 4. Storage: session-audio bucket UPDATE/DELETE policies scoped to file owner
CREATE POLICY "Users can update own session audio"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'session-audio'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own session audio"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'session-audio'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. Add scrub-pii to api_rate_limits for cost protection
INSERT INTO public.api_rate_limits (function_name, max_requests_per_minute, max_requests_per_hour, max_daily_cost_gbp, is_enabled)
VALUES ('scrub-pii', 30, 500, 10.00, true)
ON CONFLICT DO NOTHING;
