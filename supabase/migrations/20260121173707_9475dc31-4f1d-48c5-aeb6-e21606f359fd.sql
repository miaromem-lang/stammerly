-- =============================================
-- SECURITY FIX: Create User Roles System
-- =============================================

-- 1. Create role enum (if not exists)
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('kid', 'parent', 'teacher', 'therapist', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create user_roles table (if not exists)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- 3. Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Create security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 5. RLS policies for user_roles table
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own role during signup" ON public.user_roles;
CREATE POLICY "Users can insert their own role during signup"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- =============================================
-- FIX: practice_sessions RLS policies
-- =============================================

DROP POLICY IF EXISTS "Anyone can view sessions" ON practice_sessions;
DROP POLICY IF EXISTS "Anyone can create sessions" ON practice_sessions;
DROP POLICY IF EXISTS "Anyone can update sessions" ON practice_sessions;
DROP POLICY IF EXISTS "Users can view own sessions" ON practice_sessions;
DROP POLICY IF EXISTS "Users can create own sessions" ON practice_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON practice_sessions;

CREATE POLICY "Users can view own sessions"
ON practice_sessions
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create own sessions"
ON practice_sessions
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own sessions"
ON practice_sessions
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- =============================================
-- FIX: user_progress RLS policies
-- =============================================

DROP POLICY IF EXISTS "Anyone can view progress" ON user_progress;
DROP POLICY IF EXISTS "Anyone can create progress" ON user_progress;
DROP POLICY IF EXISTS "Anyone can update progress" ON user_progress;
DROP POLICY IF EXISTS "Users can view own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can create own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON user_progress;

CREATE POLICY "Users can view own progress"
ON user_progress
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create own progress"
ON user_progress
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own progress"
ON user_progress
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- =============================================
-- FIX: user_streaks RLS policies
-- =============================================

DROP POLICY IF EXISTS "Anyone can view streaks" ON user_streaks;
DROP POLICY IF EXISTS "Anyone can create streaks" ON user_streaks;
DROP POLICY IF EXISTS "Anyone can update streaks" ON user_streaks;
DROP POLICY IF EXISTS "Users can view own streaks" ON user_streaks;
DROP POLICY IF EXISTS "Users can create own streaks" ON user_streaks;
DROP POLICY IF EXISTS "Users can update own streaks" ON user_streaks;

CREATE POLICY "Users can view own streaks"
ON user_streaks
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create own streaks"
ON user_streaks
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own streaks"
ON user_streaks
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- =============================================
-- FIX: user_achievements RLS policies
-- =============================================

DROP POLICY IF EXISTS "Anyone can view achievements" ON user_achievements;
DROP POLICY IF EXISTS "Anyone can create achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can create own achievements" ON user_achievements;

CREATE POLICY "Users can view own achievements"
ON user_achievements
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create own achievements"
ON user_achievements
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- =============================================
-- FIX: quest_completions RLS policies
-- =============================================

DROP POLICY IF EXISTS "Anyone can view quest completions" ON quest_completions;
DROP POLICY IF EXISTS "Anyone can create quest completions" ON quest_completions;
DROP POLICY IF EXISTS "Anyone can update quest completions" ON quest_completions;
DROP POLICY IF EXISTS "Users can view own quest completions" ON quest_completions;
DROP POLICY IF EXISTS "Users can create own quest completions" ON quest_completions;
DROP POLICY IF EXISTS "Users can update own quest completions" ON quest_completions;

CREATE POLICY "Users can view own quest completions"
ON quest_completions
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create own quest completions"
ON quest_completions
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own quest completions"
ON quest_completions
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- =============================================
-- FIX: kid_messages RLS policies
-- =============================================

DROP POLICY IF EXISTS "Anyone can view kid messages" ON kid_messages;
DROP POLICY IF EXISTS "Anyone can create kid messages" ON kid_messages;
DROP POLICY IF EXISTS "Anyone can update kid messages" ON kid_messages;
DROP POLICY IF EXISTS "Users can view own messages" ON kid_messages;
DROP POLICY IF EXISTS "Users can create own messages" ON kid_messages;
DROP POLICY IF EXISTS "Users can update own messages" ON kid_messages;

CREATE POLICY "Users can view own messages"
ON kid_messages
FOR SELECT
TO authenticated
USING (child_user_id = auth.uid());

CREATE POLICY "Users can create own messages"
ON kid_messages
FOR INSERT
TO authenticated
WITH CHECK (child_user_id = auth.uid());

CREATE POLICY "Users can update own messages"
ON kid_messages
FOR UPDATE
TO authenticated
USING (child_user_id = auth.uid());

-- =============================================
-- FIX: daily_fluency_ratings RLS policies
-- =============================================

DROP POLICY IF EXISTS "Anyone can view ratings" ON daily_fluency_ratings;
DROP POLICY IF EXISTS "Anyone can create ratings" ON daily_fluency_ratings;
DROP POLICY IF EXISTS "Anyone can update ratings" ON daily_fluency_ratings;
DROP POLICY IF EXISTS "Parents can view ratings for their children" ON daily_fluency_ratings;
DROP POLICY IF EXISTS "Parents can create ratings" ON daily_fluency_ratings;
DROP POLICY IF EXISTS "Parents can update own ratings" ON daily_fluency_ratings;

CREATE POLICY "Parents can view ratings for their children"
ON daily_fluency_ratings
FOR SELECT
TO authenticated
USING (parent_user_id = auth.uid() OR child_user_id = auth.uid());

CREATE POLICY "Parents can create ratings"
ON daily_fluency_ratings
FOR INSERT
TO authenticated
WITH CHECK (parent_user_id = auth.uid());

CREATE POLICY "Parents can update own ratings"
ON daily_fluency_ratings
FOR UPDATE
TO authenticated
USING (parent_user_id = auth.uid());

-- =============================================
-- FIX: context_notes RLS policies
-- =============================================

DROP POLICY IF EXISTS "Anyone can view notes" ON context_notes;
DROP POLICY IF EXISTS "Anyone can create notes" ON context_notes;
DROP POLICY IF EXISTS "Users can view related notes" ON context_notes;
DROP POLICY IF EXISTS "Parents can create notes" ON context_notes;

CREATE POLICY "Users can view related notes"
ON context_notes
FOR SELECT
TO authenticated
USING (parent_user_id = auth.uid() OR child_user_id = auth.uid());

CREATE POLICY "Parents can create notes"
ON context_notes
FOR INSERT
TO authenticated
WITH CHECK (parent_user_id = auth.uid());

-- =============================================
-- FIX: victory_logs RLS policies
-- =============================================

DROP POLICY IF EXISTS "Anyone can view victories" ON victory_logs;
DROP POLICY IF EXISTS "Anyone can create victories" ON victory_logs;
DROP POLICY IF EXISTS "Users can view related victories" ON victory_logs;
DROP POLICY IF EXISTS "Authenticated users can create victories" ON victory_logs;

CREATE POLICY "Users can view related victories"
ON victory_logs
FOR SELECT
TO authenticated
USING (child_user_id = auth.uid());

CREATE POLICY "Authenticated users can create victories"
ON victory_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================
-- FIX: session_reviews RLS policies
-- =============================================

DROP POLICY IF EXISTS "Anyone can view reviews" ON session_reviews;
DROP POLICY IF EXISTS "Anyone can create reviews" ON session_reviews;
DROP POLICY IF EXISTS "Anyone can update reviews" ON session_reviews;
DROP POLICY IF EXISTS "Authenticated users can view reviews" ON session_reviews;
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON session_reviews;
DROP POLICY IF EXISTS "Authenticated users can update reviews" ON session_reviews;

CREATE POLICY "Authenticated users can view reviews"
ON session_reviews
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create reviews"
ON session_reviews
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update reviews"
ON session_reviews
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL);

-- =============================================
-- FIX: quest_messages RLS policies
-- =============================================

DROP POLICY IF EXISTS "Anyone can view quest messages" ON quest_messages;
DROP POLICY IF EXISTS "Anyone can create quest messages" ON quest_messages;
DROP POLICY IF EXISTS "Authenticated users can view quest messages" ON quest_messages;
DROP POLICY IF EXISTS "Authenticated users can create quest messages" ON quest_messages;

CREATE POLICY "Authenticated users can view quest messages"
ON quest_messages
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create quest messages"
ON quest_messages
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================
-- FIX: therapist_ai_conversations RLS policies
-- =============================================

DROP POLICY IF EXISTS "Anyone can view AI conversations" ON therapist_ai_conversations;
DROP POLICY IF EXISTS "Anyone can create AI conversations" ON therapist_ai_conversations;
DROP POLICY IF EXISTS "Authenticated users can view AI conversations" ON therapist_ai_conversations;
DROP POLICY IF EXISTS "Authenticated users can create AI conversations" ON therapist_ai_conversations;

CREATE POLICY "Authenticated users can view AI conversations"
ON therapist_ai_conversations
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create AI conversations"
ON therapist_ai_conversations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================
-- FIX: therapist_assigned_quests RLS policies
-- =============================================

DROP POLICY IF EXISTS "Anyone can view assigned quests" ON therapist_assigned_quests;
DROP POLICY IF EXISTS "Anyone can create assigned quests" ON therapist_assigned_quests;
DROP POLICY IF EXISTS "Anyone can update assigned quests" ON therapist_assigned_quests;
DROP POLICY IF EXISTS "Anyone can delete assigned quests" ON therapist_assigned_quests;
DROP POLICY IF EXISTS "Users can view related quests" ON therapist_assigned_quests;
DROP POLICY IF EXISTS "Therapists can create quests" ON therapist_assigned_quests;
DROP POLICY IF EXISTS "Users can update related quests" ON therapist_assigned_quests;
DROP POLICY IF EXISTS "Therapists can delete own quests" ON therapist_assigned_quests;

CREATE POLICY "Users can view related quests"
ON therapist_assigned_quests
FOR SELECT
TO authenticated
USING (therapist_id = auth.uid() OR child_user_id = auth.uid());

CREATE POLICY "Therapists can create quests"
ON therapist_assigned_quests
FOR INSERT
TO authenticated
WITH CHECK (therapist_id = auth.uid());

CREATE POLICY "Users can update related quests"
ON therapist_assigned_quests
FOR UPDATE
TO authenticated
USING (therapist_id = auth.uid() OR child_user_id = auth.uid());

CREATE POLICY "Therapists can delete own quests"
ON therapist_assigned_quests
FOR DELETE
TO authenticated
USING (therapist_id = auth.uid());