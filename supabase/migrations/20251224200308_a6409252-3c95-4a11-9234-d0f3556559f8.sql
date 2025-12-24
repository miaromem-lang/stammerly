-- Add outcome tracking columns to therapist_assigned_quests if needed
-- These already exist per the schema, so we're good there

-- Create a table to track AI chat conversations between therapists and AI
CREATE TABLE public.therapist_ai_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quest_id UUID REFERENCES public.therapist_assigned_quests(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'therapist' or 'ai'
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.therapist_ai_conversations ENABLE ROW LEVEL SECURITY;

-- Policies for therapist AI conversations
CREATE POLICY "Anyone can create AI conversations"
ON public.therapist_ai_conversations
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view AI conversations"
ON public.therapist_ai_conversations
FOR SELECT
USING (true);

-- Create index for faster queries
CREATE INDEX idx_therapist_ai_conversations_quest_id ON public.therapist_ai_conversations(quest_id);

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.therapist_ai_conversations;