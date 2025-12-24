-- Create table to track quest completions
CREATE TABLE public.quest_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  quest_id TEXT NOT NULL,
  exercise_id TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, quest_id)
);

-- Enable RLS
ALTER TABLE public.quest_completions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (matching existing pattern)
CREATE POLICY "Anyone can view quest completions"
ON public.quest_completions
FOR SELECT
USING (true);

CREATE POLICY "Anyone can create quest completions"
ON public.quest_completions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update quest completions"
ON public.quest_completions
FOR UPDATE
USING (true);