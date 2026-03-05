
-- 1. Create private session-audio storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('session-audio', 'session-audio', false);

-- 2. Add audio_file_path column to practice_sessions
ALTER TABLE public.practice_sessions
ADD COLUMN audio_file_path text;

-- 3. RLS on storage.objects: users can upload their own audio
CREATE POLICY "Users can upload own session audio"
ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'session-audio'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Users can read their own audio
CREATE POLICY "Users can read own session audio"
ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'session-audio'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. Therapists can read assigned patient audio via therapist_assigned_quests
CREATE POLICY "Therapists can read assigned patient audio"
ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'session-audio'
  AND EXISTS (
    SELECT 1 FROM public.therapist_assigned_quests taq
    WHERE taq.child_user_id::text = (storage.foldername(name))[1]
      AND taq.therapist_id = auth.uid()
  )
);

-- 6. Therapists can view disfluency_logs for assigned patients
CREATE POLICY "Therapists can view assigned patient disfluency logs"
ON public.disfluency_logs
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.therapist_assigned_quests taq
    WHERE taq.child_user_id = disfluency_logs.user_id
      AND taq.therapist_id = auth.uid()
  )
);

-- 7. Therapists can view assigned patient practice sessions (if not already covered)
-- Already exists from teacher migration, but we need therapist access too
CREATE POLICY "Therapists can view assigned patient sessions"
ON public.practice_sessions
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.therapist_assigned_quests taq
    WHERE taq.child_user_id = practice_sessions.user_id
      AND taq.therapist_id = auth.uid()
  )
);
