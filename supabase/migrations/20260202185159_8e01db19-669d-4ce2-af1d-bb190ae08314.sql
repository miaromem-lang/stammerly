-- Fix security definer views by recreating them with security_invoker = true
-- This ensures RLS policies of the querying user are applied

-- Drop and recreate phoneme_trigger_summary view with security invoker
DROP VIEW IF EXISTS public.phoneme_trigger_summary;
CREATE VIEW public.phoneme_trigger_summary
WITH (security_invoker = true)
AS
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

-- Drop and recreate clinical_metrics_summary view with security invoker
DROP VIEW IF EXISTS public.clinical_metrics_summary;
CREATE VIEW public.clinical_metrics_summary
WITH (security_invoker = true)
AS
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