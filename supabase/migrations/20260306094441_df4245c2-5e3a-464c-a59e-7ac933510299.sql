
-- 1. Add streak freeze columns to user_streaks
ALTER TABLE public.user_streaks 
  ADD COLUMN streak_freeze_active boolean NOT NULL DEFAULT false,
  ADD COLUMN streak_freeze_until date,
  ADD COLUMN streak_freezes_remaining integer NOT NULL DEFAULT 3;

-- 2. Create spaced_repetition_items table
CREATE TABLE public.spaced_repetition_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  phoneme text,
  word text,
  exercise_id text,
  ease_factor numeric NOT NULL DEFAULT 2.5,
  interval_days integer NOT NULL DEFAULT 1,
  next_review_date date NOT NULL DEFAULT CURRENT_DATE,
  repetition_count integer NOT NULL DEFAULT 0,
  last_reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.spaced_repetition_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own spaced repetition items" ON public.spaced_repetition_items FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create own spaced repetition items" ON public.spaced_repetition_items FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own spaced repetition items" ON public.spaced_repetition_items FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own spaced repetition items" ON public.spaced_repetition_items FOR DELETE USING (user_id = auth.uid());

-- 3. Create safeguarding_alerts table
CREATE TABLE public.safeguarding_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_id uuid REFERENCES public.practice_sessions(id),
  alert_type text NOT NULL DEFAULT 'distress',
  reason text NOT NULL,
  audio_file_path text,
  status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.safeguarding_alerts ENABLE ROW LEVEL SECURITY;

-- Only therapists with admin/therapist role can view safeguarding alerts
CREATE POLICY "Therapists can view safeguarding alerts" ON public.safeguarding_alerts FOR SELECT USING (has_role(auth.uid(), 'therapist'::app_role));
CREATE POLICY "Therapists can update safeguarding alerts" ON public.safeguarding_alerts FOR UPDATE USING (has_role(auth.uid(), 'therapist'::app_role));
