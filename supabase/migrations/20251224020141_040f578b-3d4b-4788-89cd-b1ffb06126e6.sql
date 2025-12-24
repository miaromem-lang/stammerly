-- First create the update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create user_streaks table to track daily practice streaks
CREATE TABLE public.user_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_practice_date DATE,
  total_practice_days INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_achievements table to track earned achievements/badges
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  achievement_id TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  achievement_emoji TEXT NOT NULL,
  achievement_category TEXT NOT NULL DEFAULT 'general',
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Create user_progress table to track gems, goals, and overall progress
CREATE TABLE public.user_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  total_gems INTEGER NOT NULL DEFAULT 0,
  total_stars INTEGER NOT NULL DEFAULT 0,
  total_sessions INTEGER NOT NULL DEFAULT 0,
  daily_goals_completed INTEGER NOT NULL DEFAULT 0,
  daily_goals_target INTEGER NOT NULL DEFAULT 3,
  current_quest_level INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create daily_fluency_ratings table to track parent ratings
CREATE TABLE public.daily_fluency_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_user_id UUID,
  parent_user_id UUID,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
  notes TEXT,
  rating_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(child_user_id, rating_date)
);

-- Create victory_logs table for teacher/therapist victories
CREATE TABLE public.victory_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_user_id UUID,
  reporter_name TEXT NOT NULL,
  reporter_role TEXT NOT NULL DEFAULT 'teacher',
  victory_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create context_notes table for parent context notes
CREATE TABLE public.context_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_user_id UUID,
  parent_user_id UUID,
  note_text TEXT NOT NULL,
  note_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_fluency_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.victory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.context_notes ENABLE ROW LEVEL SECURITY;

-- Create policies for user_streaks
CREATE POLICY "Anyone can view streaks" ON public.user_streaks FOR SELECT USING (true);
CREATE POLICY "Anyone can create streaks" ON public.user_streaks FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update streaks" ON public.user_streaks FOR UPDATE USING (true);

-- Create policies for user_achievements
CREATE POLICY "Anyone can view achievements" ON public.user_achievements FOR SELECT USING (true);
CREATE POLICY "Anyone can create achievements" ON public.user_achievements FOR INSERT WITH CHECK (true);

-- Create policies for user_progress
CREATE POLICY "Anyone can view progress" ON public.user_progress FOR SELECT USING (true);
CREATE POLICY "Anyone can create progress" ON public.user_progress FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update progress" ON public.user_progress FOR UPDATE USING (true);

-- Create policies for daily_fluency_ratings
CREATE POLICY "Anyone can view ratings" ON public.daily_fluency_ratings FOR SELECT USING (true);
CREATE POLICY "Anyone can create ratings" ON public.daily_fluency_ratings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update ratings" ON public.daily_fluency_ratings FOR UPDATE USING (true);

-- Create policies for victory_logs
CREATE POLICY "Anyone can view victories" ON public.victory_logs FOR SELECT USING (true);
CREATE POLICY "Anyone can create victories" ON public.victory_logs FOR INSERT WITH CHECK (true);

-- Create policies for context_notes
CREATE POLICY "Anyone can view notes" ON public.context_notes FOR SELECT USING (true);
CREATE POLICY "Anyone can create notes" ON public.context_notes FOR INSERT WITH CHECK (true);

-- Create trigger for automatic timestamp updates on user_streaks
CREATE TRIGGER update_user_streaks_updated_at
BEFORE UPDATE ON public.user_streaks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for automatic timestamp updates on user_progress
CREATE TRIGGER update_user_progress_updated_at
BEFORE UPDATE ON public.user_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_streaks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_achievements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE public.victory_logs;