-- Add comprehensive clinical metrics columns to practice_sessions table
-- Based on the Multi-Dimensional Assessment Framework

-- 1. Surface Command Centre (Acoustic & Fluency)
ALTER TABLE public.practice_sessions 
ADD COLUMN IF NOT EXISTS weighted_stuttering_severity numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS percent_syllables_stuttered numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS sld_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS od_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS syllables_per_minute numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS articulation_rate numeric DEFAULT NULL;

-- 2. Temporal & Prosodic Metrics
ALTER TABLE public.practice_sessions 
ADD COLUMN IF NOT EXISTS initiation_lag_ms numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS naturalness_score integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS pitch_variance numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS volume_variance numeric DEFAULT NULL;

-- 3. Disfluency Detail Counts
ALTER TABLE public.practice_sessions 
ADD COLUMN IF NOT EXISTS sound_repetitions_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS syllable_repetitions_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS word_repetitions_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS phrase_repetitions_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS revisions_count integer DEFAULT 0;

-- 4. Technique Tracking
ALTER TABLE public.practice_sessions 
ADD COLUMN IF NOT EXISTS easy_onset_attempts integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS easy_onset_successes integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS soft_contact_score integer DEFAULT NULL;

-- 5. Phonetic Analysis (JSONB for trigger data)
ALTER TABLE public.practice_sessions 
ADD COLUMN IF NOT EXISTS phoneme_triggers jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS word_avoidances jsonb DEFAULT '[]'::jsonb;

-- 6. Longest Block Durations (for WSS calculation)
ALTER TABLE public.practice_sessions 
ADD COLUMN IF NOT EXISTS longest_block_ms numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS second_longest_block_ms numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS third_longest_block_ms numeric DEFAULT NULL;

-- 7. Context/Environment tagging
ALTER TABLE public.practice_sessions 
ADD COLUMN IF NOT EXISTS session_context text DEFAULT 'app',
ADD COLUMN IF NOT EXISTS environment_type text DEFAULT 'home';

-- 8. Adaptation/Consistency tracking
ALTER TABLE public.practice_sessions 
ADD COLUMN IF NOT EXISTS trial_number integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS adaptation_score numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS consistency_words jsonb DEFAULT '[]'::jsonb;

-- 9. Pause Architecture
ALTER TABLE public.practice_sessions 
ADD COLUMN IF NOT EXISTS linguistic_pauses_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS stutter_hesitations_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS avg_pause_duration_ms numeric DEFAULT NULL;

-- Create a new table for detailed disfluency logs
CREATE TABLE IF NOT EXISTS public.disfluency_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid REFERENCES public.practice_sessions(id) ON DELETE CASCADE,
  user_id uuid DEFAULT NULL,
  disfluency_type text NOT NULL,
  disfluency_category text NOT NULL DEFAULT 'SLD',
  word text NOT NULL,
  phoneme text DEFAULT NULL,
  severity text DEFAULT 'mild',
  duration_ms numeric DEFAULT NULL,
  position_in_word text DEFAULT NULL,
  timestamp_in_session numeric DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on disfluency_logs
ALTER TABLE public.disfluency_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for disfluency_logs
CREATE POLICY "Users can view own disfluency logs"
ON public.disfluency_logs
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create own disfluency logs"
ON public.disfluency_logs
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Create phoneme_trigger_summary view for analytics
CREATE OR REPLACE VIEW public.phoneme_trigger_summary AS
SELECT 
  user_id,
  phoneme,
  disfluency_type,
  COUNT(*) as occurrence_count,
  AVG(duration_ms) as avg_duration_ms,
  DATE_TRUNC('week', created_at) as week_start
FROM public.disfluency_logs
WHERE phoneme IS NOT NULL
GROUP BY user_id, phoneme, disfluency_type, DATE_TRUNC('week', created_at);

-- Create clinical_metrics_summary view for therapist dashboard
CREATE OR REPLACE VIEW public.clinical_metrics_summary AS
SELECT 
  user_id,
  DATE(session_date) as practice_date,
  COUNT(*) as total_sessions,
  AVG(weighted_stuttering_severity) as avg_wss,
  AVG(percent_syllables_stuttered) as avg_percent_ss,
  SUM(sld_count) as total_sld,
  SUM(od_count) as total_od,
  AVG(syllables_per_minute) as avg_spm,
  AVG(articulation_rate) as avg_articulation_rate,
  AVG(initiation_lag_ms) as avg_initiation_lag,
  AVG(naturalness_score) as avg_naturalness,
  SUM(blocks_count) as total_blocks,
  SUM(prolongations_count) as total_prolongations,
  SUM(sound_repetitions_count) as total_sound_reps,
  SUM(word_repetitions_count) as total_word_reps,
  AVG(easy_onset_score) as avg_easy_onset,
  CASE 
    WHEN SUM(easy_onset_attempts) > 0 
    THEN ROUND((SUM(easy_onset_successes)::numeric / SUM(easy_onset_attempts)) * 100, 1)
    ELSE NULL 
  END as technique_success_rate
FROM public.practice_sessions
WHERE user_id IS NOT NULL
GROUP BY user_id, DATE(session_date);

-- Create subjective_ratings table for SUDS tracking
CREATE TABLE IF NOT EXISTS public.subjective_ratings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid DEFAULT NULL,
  session_id uuid REFERENCES public.practice_sessions(id) ON DELETE CASCADE,
  suds_rating integer NOT NULL CHECK (suds_rating >= 0 AND suds_rating <= 10),
  anxiety_before integer DEFAULT NULL CHECK (anxiety_before >= 0 AND anxiety_before <= 10),
  anxiety_after integer DEFAULT NULL CHECK (anxiety_after >= 0 AND anxiety_after <= 10),
  situation_context text DEFAULT NULL,
  notes text DEFAULT NULL,
  rating_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on subjective_ratings
ALTER TABLE public.subjective_ratings ENABLE ROW LEVEL SECURITY;

-- RLS policies for subjective_ratings
CREATE POLICY "Users can view own subjective ratings"
ON public.subjective_ratings
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create own subjective ratings"
ON public.subjective_ratings
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own subjective ratings"
ON public.subjective_ratings
FOR UPDATE
USING (user_id = auth.uid());

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.disfluency_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.subjective_ratings;