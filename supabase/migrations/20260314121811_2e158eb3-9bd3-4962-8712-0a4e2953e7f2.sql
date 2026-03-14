
-- 1. Fix context_notes INSERT: require child_user_id to be in active parent_child_links
DROP POLICY IF EXISTS "Parents can create notes" ON public.context_notes;
CREATE POLICY "Parents can create notes" ON public.context_notes
FOR INSERT TO authenticated
WITH CHECK (
  parent_user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.parent_child_links pcl
    WHERE pcl.parent_user_id = auth.uid()
      AND pcl.child_user_id = context_notes.child_user_id
      AND pcl.is_active = true
  )
);

-- 2. Add RLS to clinical_metrics_summary (view - enable RLS)
ALTER VIEW public.clinical_metrics_summary SET (security_invoker = true);

-- 3. Add RLS to phoneme_trigger_summary (view - enable RLS)  
ALTER VIEW public.phoneme_trigger_summary SET (security_invoker = true);

-- 4. Scope session_reviews INSERT to assigned patients
DROP POLICY IF EXISTS "Therapists can create reviews" ON public.session_reviews;
CREATE POLICY "Therapists can create reviews" ON public.session_reviews
FOR INSERT TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'therapist'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.practice_sessions ps
    JOIN public.therapist_assigned_quests taq ON taq.child_user_id = ps.user_id
    WHERE ps.id = session_reviews.session_id
      AND taq.therapist_id = auth.uid()
  )
);

-- Scope session_reviews UPDATE to assigned patients
DROP POLICY IF EXISTS "Therapists can update reviews" ON public.session_reviews;
CREATE POLICY "Therapists can update reviews" ON public.session_reviews
FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'therapist'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.practice_sessions ps
    JOIN public.therapist_assigned_quests taq ON taq.child_user_id = ps.user_id
    WHERE ps.id = session_reviews.session_id
      AND taq.therapist_id = auth.uid()
  )
);

-- Scope session_reviews DELETE to assigned patients
DROP POLICY IF EXISTS "Therapists can delete reviews" ON public.session_reviews;
CREATE POLICY "Therapists can delete reviews" ON public.session_reviews
FOR DELETE TO authenticated
USING (
  has_role(auth.uid(), 'therapist'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.practice_sessions ps
    JOIN public.therapist_assigned_quests taq ON taq.child_user_id = ps.user_id
    WHERE ps.id = session_reviews.session_id
      AND taq.therapist_id = auth.uid()
  )
);

-- 5. Scope victory_logs INSERT to assigned children
DROP POLICY IF EXISTS "Therapists and teachers can create victories" ON public.victory_logs;
CREATE POLICY "Therapists and teachers can create victories" ON public.victory_logs
FOR INSERT TO authenticated
WITH CHECK (
  (
    has_role(auth.uid(), 'therapist'::app_role)
    AND EXISTS (
      SELECT 1 FROM public.therapist_assigned_quests taq
      WHERE taq.child_user_id = victory_logs.child_user_id
        AND taq.therapist_id = auth.uid()
    )
  )
  OR (
    has_role(auth.uid(), 'teacher'::app_role)
    AND EXISTS (
      SELECT 1 FROM public.teacher_student_assignments tsa
      WHERE tsa.student_user_id = victory_logs.child_user_id
        AND tsa.teacher_user_id = auth.uid()
    )
  )
);

-- Scope victory_logs UPDATE to assigned children
DROP POLICY IF EXISTS "Reporters can update victories" ON public.victory_logs;
CREATE POLICY "Reporters can update victories" ON public.victory_logs
FOR UPDATE TO authenticated
USING (
  (
    has_role(auth.uid(), 'therapist'::app_role)
    AND EXISTS (
      SELECT 1 FROM public.therapist_assigned_quests taq
      WHERE taq.child_user_id = victory_logs.child_user_id
        AND taq.therapist_id = auth.uid()
    )
  )
  OR (
    has_role(auth.uid(), 'teacher'::app_role)
    AND EXISTS (
      SELECT 1 FROM public.teacher_student_assignments tsa
      WHERE tsa.student_user_id = victory_logs.child_user_id
        AND tsa.teacher_user_id = auth.uid()
    )
  )
);

-- Scope victory_logs DELETE to assigned children
DROP POLICY IF EXISTS "Reporters can delete victories" ON public.victory_logs;
CREATE POLICY "Reporters can delete victories" ON public.victory_logs
FOR DELETE TO authenticated
USING (
  (
    has_role(auth.uid(), 'therapist'::app_role)
    AND EXISTS (
      SELECT 1 FROM public.therapist_assigned_quests taq
      WHERE taq.child_user_id = victory_logs.child_user_id
        AND taq.therapist_id = auth.uid()
    )
  )
  OR (
    has_role(auth.uid(), 'teacher'::app_role)
    AND EXISTS (
      SELECT 1 FROM public.teacher_student_assignments tsa
      WHERE tsa.student_user_id = victory_logs.child_user_id
        AND tsa.teacher_user_id = auth.uid()
    )
  )
);
