-- Create table for therapist-assigned quests
CREATE TABLE public.therapist_assigned_quests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  therapist_id UUID,
  child_user_id UUID,
  exercise_category TEXT NOT NULL,
  exercise_id TEXT NOT NULL,
  quest_title TEXT NOT NULL,
  therapist_reason TEXT NOT NULL,
  ai_feedback TEXT,
  ai_agrees BOOLEAN DEFAULT NULL,
  ai_alternative_suggestion TEXT,
  priority TEXT NOT NULL DEFAULT 'high',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.therapist_assigned_quests ENABLE ROW LEVEL SECURITY;

-- Create policies for access
CREATE POLICY "Anyone can view assigned quests"
ON public.therapist_assigned_quests
FOR SELECT
USING (true);

CREATE POLICY "Anyone can create assigned quests"
ON public.therapist_assigned_quests
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update assigned quests"
ON public.therapist_assigned_quests
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete assigned quests"
ON public.therapist_assigned_quests
FOR DELETE
USING (true);