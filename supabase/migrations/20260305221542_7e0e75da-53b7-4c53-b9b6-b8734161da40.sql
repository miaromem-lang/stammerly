
-- Daily mood/anxiety check-ins from children
CREATE TABLE public.mood_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  mood_score INTEGER NOT NULL CHECK (mood_score BETWEEN 1 AND 5),
  anxiety_level INTEGER CHECK (anxiety_level BETWEEN 0 AND 10),
  mood_emoji TEXT NOT NULL DEFAULT '😊',
  context_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, checkin_date)
);

ALTER TABLE public.mood_checkins ENABLE ROW LEVEL SECURITY;

-- Kids can manage their own check-ins
CREATE POLICY "Users can insert own mood checkins"
ON public.mood_checkins FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own mood checkins"
ON public.mood_checkins FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update own mood checkins"
ON public.mood_checkins FOR UPDATE TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete own mood checkins"
ON public.mood_checkins FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- Therapists can view mood data for their assigned patients
CREATE POLICY "Therapists can view assigned patient mood checkins"
ON public.mood_checkins FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.therapist_assigned_quests taq
    WHERE taq.child_user_id = mood_checkins.user_id
    AND taq.therapist_id = auth.uid()
  )
);

-- Parents can view their child's mood data
CREATE POLICY "Parents can view child mood checkins"
ON public.mood_checkins FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.context_notes cn
    WHERE cn.child_user_id = mood_checkins.user_id
    AND cn.parent_user_id = auth.uid()
  )
);
