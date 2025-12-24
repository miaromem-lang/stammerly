-- Add columns to track which recommendation was chosen and outcome metrics
ALTER TABLE public.therapist_assigned_quests
ADD COLUMN chosen_recommendation text CHECK (chosen_recommendation IN ('therapist', 'ai', null)),
ADD COLUMN completed_at timestamp with time zone,
ADD COLUMN outcome_fluency_score integer,
ADD COLUMN outcome_accuracy_score integer,
ADD COLUMN outcome_notes text;

-- Create index for efficient querying of completed quests
CREATE INDEX idx_therapist_quests_completed ON public.therapist_assigned_quests (completed_at) WHERE completed_at IS NOT NULL;