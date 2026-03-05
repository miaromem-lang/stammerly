
-- Enable pg_cron and pg_net extensions for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant usage to postgres role
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Create therapist_annotations table for AI accuracy feedback
CREATE TABLE public.therapist_annotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  disfluency_log_id uuid NOT NULL REFERENCES public.disfluency_logs(id) ON DELETE CASCADE,
  therapist_id uuid NOT NULL,
  assessment_correct boolean NOT NULL,
  corrected_type text,
  corrected_severity text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (disfluency_log_id, therapist_id)
);

ALTER TABLE public.therapist_annotations ENABLE ROW LEVEL SECURITY;

-- Therapists can view annotations for their assigned patients
CREATE POLICY "Therapists can view annotations for assigned patients"
ON public.therapist_annotations
FOR SELECT TO authenticated
USING (
  therapist_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.disfluency_logs dl
    JOIN public.therapist_assigned_quests taq ON taq.child_user_id = dl.user_id
    WHERE dl.id = therapist_annotations.disfluency_log_id
      AND taq.therapist_id = auth.uid()
  )
);

-- Therapists can create annotations for assigned patients
CREATE POLICY "Therapists can create annotations"
ON public.therapist_annotations
FOR INSERT TO authenticated
WITH CHECK (
  therapist_id = auth.uid()
  AND public.has_role(auth.uid(), 'therapist')
  AND EXISTS (
    SELECT 1 FROM public.disfluency_logs dl
    JOIN public.therapist_assigned_quests taq ON taq.child_user_id = dl.user_id
    WHERE dl.id = therapist_annotations.disfluency_log_id
      AND taq.therapist_id = auth.uid()
  )
);

-- Therapists can update their own annotations
CREATE POLICY "Therapists can update own annotations"
ON public.therapist_annotations
FOR UPDATE TO authenticated
USING (therapist_id = auth.uid())
WITH CHECK (therapist_id = auth.uid());

-- Therapists can delete their own annotations
CREATE POLICY "Therapists can delete own annotations"
ON public.therapist_annotations
FOR DELETE TO authenticated
USING (therapist_id = auth.uid());

-- Function to clean up expired audio files (called by cron)
CREATE OR REPLACE FUNCTION public.cleanup_expired_audio()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
  expired_record RECORD;
BEGIN
  -- Find practice sessions with audio older than 90 days
  FOR expired_record IN
    SELECT id, audio_file_path, user_id
    FROM public.practice_sessions
    WHERE audio_file_path IS NOT NULL
      AND session_date < now() - interval '90 days'
  LOOP
    -- Delete from storage
    DELETE FROM storage.objects
    WHERE bucket_id = 'session-audio'
      AND name = expired_record.audio_file_path;
    
    -- Clear the path reference
    UPDATE public.practice_sessions
    SET audio_file_path = NULL
    WHERE id = expired_record.id;
  END LOOP;
END;
$$;
