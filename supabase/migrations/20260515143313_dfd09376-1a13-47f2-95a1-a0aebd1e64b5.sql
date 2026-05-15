-- Acoustic events captured by the live in-browser stammer detector
CREATE TABLE public.acoustic_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES public.practice_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('PROLONGATION','BLOCK','REPETITION','INTERJECTION')),
  duration_ms numeric NOT NULL DEFAULT 0,
  confidence numeric NOT NULL DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 1),
  occurred_at_ms numeric NOT NULL DEFAULT 0, -- offset from session start, in ms
  detail text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_acoustic_events_session ON public.acoustic_events(session_id);
CREATE INDEX idx_acoustic_events_user ON public.acoustic_events(user_id);
CREATE INDEX idx_acoustic_events_user_created ON public.acoustic_events(user_id, created_at DESC);

ALTER TABLE public.acoustic_events ENABLE ROW LEVEL SECURITY;

-- Owner can fully manage
CREATE POLICY "Users can view own acoustic events"
  ON public.acoustic_events FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own acoustic events"
  ON public.acoustic_events FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own acoustic events"
  ON public.acoustic_events FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Therapists: view events for assigned patients (matches existing pattern on disfluency_logs)
CREATE POLICY "Therapists can view assigned patient acoustic events"
  ON public.acoustic_events FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.therapist_assigned_quests taq
    WHERE taq.child_user_id = acoustic_events.user_id
      AND taq.therapist_id = auth.uid()
  ));

-- Admins: full read access for QA / demos
CREATE POLICY "Admins can view all acoustic events"
  ON public.acoustic_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
