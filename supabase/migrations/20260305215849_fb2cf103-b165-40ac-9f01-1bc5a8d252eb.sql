
-- Skip practice_sessions DELETE (already exists)

-- subjective_ratings: DELETE
DO $$ BEGIN
CREATE POLICY "Users can delete own subjective ratings"
ON public.subjective_ratings FOR DELETE TO authenticated
USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
CREATE POLICY "Users can delete own quest completions"
ON public.quest_completions FOR DELETE TO authenticated
USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
CREATE POLICY "Users can delete own streaks"
ON public.user_streaks FOR DELETE TO authenticated
USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
CREATE POLICY "Users can delete own progress"
ON public.user_progress FOR DELETE TO authenticated
USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
CREATE POLICY "Parents can update notes"
ON public.context_notes FOR UPDATE TO authenticated
USING (parent_user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
CREATE POLICY "Parents can delete notes"
ON public.context_notes FOR DELETE TO authenticated
USING (parent_user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
CREATE POLICY "Parents can delete ratings"
ON public.daily_fluency_ratings FOR DELETE TO authenticated
USING (parent_user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
CREATE POLICY "Reporters can update victories"
ON public.victory_logs FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'therapist'::app_role) OR has_role(auth.uid(), 'teacher'::app_role));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
CREATE POLICY "Reporters can delete victories"
ON public.victory_logs FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'therapist'::app_role) OR has_role(auth.uid(), 'teacher'::app_role));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
CREATE POLICY "Users can delete own messages"
ON public.kid_messages FOR DELETE TO authenticated
USING (child_user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
CREATE POLICY "Users can update own disfluency logs"
ON public.disfluency_logs FOR UPDATE TO authenticated
USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
CREATE POLICY "Users can delete own disfluency logs"
ON public.disfluency_logs FOR DELETE TO authenticated
USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
CREATE POLICY "Quest participants can update messages"
ON public.quest_messages FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM therapist_assigned_quests taq
  WHERE taq.id = quest_messages.quest_id
  AND (taq.therapist_id = auth.uid() OR taq.child_user_id = auth.uid())
));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
CREATE POLICY "Quest participants can delete messages"
ON public.quest_messages FOR DELETE TO authenticated
USING (EXISTS (
  SELECT 1 FROM therapist_assigned_quests taq
  WHERE taq.id = quest_messages.quest_id
  AND (taq.therapist_id = auth.uid() OR taq.child_user_id = auth.uid())
));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
CREATE POLICY "Therapists can delete reviews"
ON public.session_reviews FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'therapist'::app_role));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
CREATE POLICY "Therapists can update AI conversations"
ON public.therapist_ai_conversations FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM therapist_assigned_quests taq
  WHERE taq.id = therapist_ai_conversations.quest_id
  AND taq.therapist_id = auth.uid()
));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
CREATE POLICY "Therapists can delete AI conversations"
ON public.therapist_ai_conversations FOR DELETE TO authenticated
USING (EXISTS (
  SELECT 1 FROM therapist_assigned_quests taq
  WHERE taq.id = therapist_ai_conversations.quest_id
  AND taq.therapist_id = auth.uid()
));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
