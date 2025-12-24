-- Create practice_sessions table to track all exercise sessions
CREATE TABLE public.practice_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  session_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Exercise details
  exercise_category TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  exercise_difficulty TEXT NOT NULL DEFAULT 'beginner',
  target_phrase TEXT,
  transcript TEXT,
  
  -- Scores
  fluency_score INTEGER DEFAULT 0,
  accuracy_score INTEGER DEFAULT 0,
  easy_onset_score INTEGER DEFAULT 0,
  pacing_score INTEGER DEFAULT 0,
  
  -- Disfluency counts
  blocks_count INTEGER DEFAULT 0,
  repetitions_count INTEGER DEFAULT 0,
  prolongations_count INTEGER DEFAULT 0,
  interjections_count INTEGER DEFAULT 0,
  
  -- Session metadata
  duration_seconds INTEGER DEFAULT 0,
  stars_earned INTEGER DEFAULT 1,
  gems_earned INTEGER DEFAULT 0,
  
  -- For Free Talk sessions
  topic_id TEXT,
  messages_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX idx_practice_sessions_user ON public.practice_sessions(user_id);
CREATE INDEX idx_practice_sessions_date ON public.practice_sessions(session_date DESC);
CREATE INDEX idx_practice_sessions_category ON public.practice_sessions(exercise_category);

-- Enable Row Level Security
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert sessions (for anonymous users before auth is implemented)
CREATE POLICY "Anyone can create sessions"
ON public.practice_sessions
FOR INSERT
WITH CHECK (true);

-- Policy: Allow anyone to read all sessions (for now - will be restricted when auth is added)
CREATE POLICY "Anyone can view sessions"
ON public.practice_sessions
FOR SELECT
USING (true);

-- Policy: Allow anyone to update sessions
CREATE POLICY "Anyone can update sessions"
ON public.practice_sessions
FOR UPDATE
USING (true);

-- Create daily_analytics view for aggregated stats
CREATE OR REPLACE VIEW public.daily_analytics AS
SELECT 
  DATE(session_date) as practice_date,
  COUNT(*) as total_sessions,
  ROUND(AVG(fluency_score)) as avg_fluency,
  ROUND(AVG(accuracy_score)) as avg_accuracy,
  SUM(stars_earned) as total_stars,
  SUM(gems_earned) as total_gems,
  SUM(blocks_count) as total_blocks,
  SUM(repetitions_count) as total_repetitions,
  SUM(prolongations_count) as total_prolongations,
  SUM(interjections_count) as total_interjections,
  SUM(duration_seconds) as total_practice_time
FROM public.practice_sessions
GROUP BY DATE(session_date)
ORDER BY practice_date DESC;