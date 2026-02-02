-- Add missing DELETE policy for practice_sessions (GDPR compliance)
CREATE POLICY "Users can delete own sessions"
ON public.practice_sessions
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Add missing UPDATE policy for user_achievements
CREATE POLICY "Users can update own achievements"
ON public.user_achievements
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Add missing DELETE policy for user_achievements
CREATE POLICY "Users can delete own achievements"
ON public.user_achievements
FOR DELETE
TO authenticated
USING (user_id = auth.uid());