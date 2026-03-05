
-- Teacher-student relationship table
CREATE TABLE public.teacher_student_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_user_id uuid NOT NULL,
  student_user_id uuid NOT NULL,
  assigned_at timestamp with time zone NOT NULL DEFAULT now(),
  notes text,
  UNIQUE (teacher_user_id, student_user_id)
);

ALTER TABLE public.teacher_student_assignments ENABLE ROW LEVEL SECURITY;

-- Teachers can view their own assignments
CREATE POLICY "Teachers can view own assignments"
  ON public.teacher_student_assignments
  FOR SELECT TO authenticated
  USING (teacher_user_id = auth.uid());

-- Teachers can create assignments (only if they have teacher role)
CREATE POLICY "Teachers can create assignments"
  ON public.teacher_student_assignments
  FOR INSERT TO authenticated
  WITH CHECK (
    teacher_user_id = auth.uid()
    AND public.has_role(auth.uid(), 'teacher')
  );

-- Teachers can delete own assignments
CREATE POLICY "Teachers can delete own assignments"
  ON public.teacher_student_assignments
  FOR DELETE TO authenticated
  USING (
    teacher_user_id = auth.uid()
    AND public.has_role(auth.uid(), 'teacher')
  );

-- Students can see who their teachers are
CREATE POLICY "Students can view own teacher assignments"
  ON public.teacher_student_assignments
  FOR SELECT TO authenticated
  USING (student_user_id = auth.uid());

-- Allow teachers to read mood_checkins for their assigned students
CREATE POLICY "Teachers can view assigned student mood checkins"
  ON public.mood_checkins
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teacher_student_assignments tsa
      WHERE tsa.student_user_id = mood_checkins.user_id
        AND tsa.teacher_user_id = auth.uid()
    )
  );

-- Allow teachers to read practice_sessions for assigned students (summary only, no transcripts accessed in code)
CREATE POLICY "Teachers can view assigned student sessions"
  ON public.practice_sessions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teacher_student_assignments tsa
      WHERE tsa.student_user_id = practice_sessions.user_id
        AND tsa.teacher_user_id = auth.uid()
    )
  );
