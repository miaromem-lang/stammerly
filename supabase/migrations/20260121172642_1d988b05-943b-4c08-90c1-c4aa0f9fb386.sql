-- FIX: daily_analytics view - use SECURITY INVOKER with correct column name
DROP VIEW IF EXISTS daily_analytics;

CREATE VIEW daily_analytics WITH (security_invoker = true) AS
SELECT 
  session_date::date as practice_date,
  SUM(duration_seconds) as total_practice_time,
  COUNT(*) as total_sessions,
  AVG(fluency_score) as avg_fluency,
  AVG(accuracy_score) as avg_accuracy,
  SUM(stars_earned) as total_stars,
  SUM(gems_earned) as total_gems,
  SUM(blocks_count) as total_blocks,
  SUM(repetitions_count) as total_repetitions,
  SUM(prolongations_count) as total_prolongations,
  SUM(interjections_count) as total_interjections
FROM practice_sessions
WHERE user_id = auth.uid()
GROUP BY session_date::date;