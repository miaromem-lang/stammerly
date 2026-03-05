
-- Fix 1: Restrict self-assignment to kid/parent only
DROP POLICY IF EXISTS "Users can insert their own role during signup" ON public.user_roles;
CREATE POLICY "Users can only self-assign basic roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND role IN ('kid', 'parent')
);

-- Fix 2: Scope therapist session_reviews access to assigned patients only
DROP POLICY IF EXISTS "Users can view reviews for their sessions" ON public.session_reviews;
CREATE POLICY "Users can view relevant reviews"
ON public.session_reviews FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.practice_sessions ps
    WHERE ps.id = session_reviews.session_id
    AND ps.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.practice_sessions ps
    JOIN public.therapist_assigned_quests taq ON taq.child_user_id = ps.user_id
    WHERE ps.id = session_reviews.session_id
    AND taq.therapist_id = auth.uid()
  )
);
