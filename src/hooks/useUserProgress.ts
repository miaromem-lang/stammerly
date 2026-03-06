import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { generateReward, type RewardResult } from "@/lib/rewardEngine";

interface UserProgress {
  totalGems: number;
  totalStars: number;
  totalSessions: number;
  dailyGoalsCompleted: number;
  dailyGoalsTarget: number;
  currentQuestLevel: number;
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string | null;
  todayScore: number;
  weeklyImprovement: number;
}

interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_practice_date: string | null;
}

interface ProgressData {
  total_gems: number;
  total_stars: number;
  total_sessions: number;
  daily_goals_completed: number;
  daily_goals_target: number;
  current_quest_level: number;
}

export const useUserProgress = () => {
  const [progress, setProgress] = useState<UserProgress>({
    totalGems: 0,
    totalStars: 0,
    totalSessions: 0,
    dailyGoalsCompleted: 0,
    dailyGoalsTarget: 3,
    currentQuestLevel: 1,
    currentStreak: 0,
    longestStreak: 0,
    lastPracticeDate: null,
    todayScore: 0,
    weeklyImprovement: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    try {
      // Fetch user progress
      const { data: progressData } = await supabase
        .from("user_progress")
        .select("*")
        .limit(1)
        .maybeSingle();

      // Fetch streak data
      const { data: streakData } = await supabase
        .from("user_streaks")
        .select("*")
        .limit(1)
        .maybeSingle();

      // Fetch today's sessions for score
      const today = new Date().toISOString().split('T')[0];
      const { data: todaySessions } = await supabase
        .from("practice_sessions")
        .select("fluency_score")
        .gte("session_date", today);

      // Fetch last week's sessions for comparison
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      const { data: lastWeekSessions } = await supabase
        .from("practice_sessions")
        .select("fluency_score, session_date")
        .gte("session_date", lastWeek.toISOString());

      // Calculate today's score
      const todayScore = todaySessions?.length 
        ? Math.round(todaySessions.reduce((acc, s) => acc + (s.fluency_score || 0), 0) / todaySessions.length)
        : 0;

      // Calculate weekly improvement
      const thisWeekScores = lastWeekSessions?.filter(s => {
        const sessionDate = new Date(s.session_date);
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        return sessionDate >= threeDaysAgo;
      }) || [];
      
      const lastWeekScores = lastWeekSessions?.filter(s => {
        const sessionDate = new Date(s.session_date);
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return sessionDate < threeDaysAgo && sessionDate >= sevenDaysAgo;
      }) || [];

      const thisWeekAvg = thisWeekScores.length 
        ? thisWeekScores.reduce((acc, s) => acc + (s.fluency_score || 0), 0) / thisWeekScores.length
        : 0;
      const lastWeekAvg = lastWeekScores.length 
        ? lastWeekScores.reduce((acc, s) => acc + (s.fluency_score || 0), 0) / lastWeekScores.length
        : 0;
      
      const weeklyImprovement = lastWeekAvg > 0 
        ? Math.round(((thisWeekAvg - lastWeekAvg) / lastWeekAvg) * 100)
        : thisWeekAvg > 0 ? 100 : 0;

      setProgress({
        totalGems: progressData?.total_gems || 0,
        totalStars: progressData?.total_stars || 0,
        totalSessions: progressData?.total_sessions || 0,
        dailyGoalsCompleted: progressData?.daily_goals_completed || 0,
        dailyGoalsTarget: progressData?.daily_goals_target || 3,
        currentQuestLevel: progressData?.current_quest_level || 1,
        currentStreak: streakData?.current_streak || 0,
        longestStreak: streakData?.longest_streak || 0,
        lastPracticeDate: streakData?.last_practice_date || null,
        todayScore,
        weeklyImprovement,
      });
    } catch (error) {
      console.error("Error fetching progress:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProgress = useCallback(async (updates: Partial<ProgressData>) => {
    try {
      const { data: existing } = await supabase
        .from("user_progress")
        .select("id")
        .limit(1)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("user_progress")
          .update(updates)
          .eq("id", existing.id);
      } else {
        await supabase
          .from("user_progress")
          .insert(updates);
      }
      
      await fetchProgress();
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  }, [fetchProgress]);

  const updateStreak = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: existing } = await supabase
        .from("user_streaks")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (existing) {
        const lastPractice = existing.last_practice_date;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        let newStreak = existing.current_streak;
        
        if (lastPractice === today) {
          // Already practiced today
          return;
        } else if (lastPractice === yesterdayStr) {
          // Continuing streak
          newStreak = existing.current_streak + 1;
        } else {
          // Check if streak freeze is active
          const freezeActive = (existing as any).streak_freeze_active;
          const freezeUntil = (existing as any).streak_freeze_until;
          
          if (freezeActive && freezeUntil && today <= freezeUntil) {
            // Streak is frozen — preserve current streak
            newStreak = existing.current_streak;
          } else {
            // Streak broken, start new
            newStreak = 1;
            // If freeze expired, deactivate it
            if (freezeActive) {
              await supabase
                .from("user_streaks")
                .update({ streak_freeze_active: false, streak_freeze_until: null } as any)
                .eq("id", existing.id);
            }
          }
        }

        await supabase
          .from("user_streaks")
          .update({
            current_streak: newStreak,
            longest_streak: Math.max(newStreak, existing.longest_streak),
            last_practice_date: today,
            total_practice_days: existing.total_practice_days + 1,
          })
          .eq("id", existing.id);
      } else {
        await supabase
          .from("user_streaks")
          .insert({
            current_streak: 1,
            longest_streak: 1,
            last_practice_date: today,
            total_practice_days: 1,
          });
      }

      await fetchProgress();
    } catch (error) {
      console.error("Error updating streak:", error);
    }
  }, [fetchProgress]);

  const activateStreakFreeze = useCallback(async (days: number) => {
    try {
      const { data: existing } = await supabase
        .from("user_streaks")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (!existing) return { success: false, reason: "No streak data" };

      const remaining = (existing as any).streak_freezes_remaining ?? 3;
      if (remaining <= 0) return { success: false, reason: "No freezes remaining this month" };

      const freezeUntil = new Date();
      freezeUntil.setDate(freezeUntil.getDate() + days);

      await supabase
        .from("user_streaks")
        .update({
          streak_freeze_active: true,
          streak_freeze_until: freezeUntil.toISOString().split('T')[0],
          streak_freezes_remaining: remaining - 1,
        } as any)
        .eq("id", existing.id);

      await fetchProgress();
      return { success: true };
    } catch (error) {
      console.error("Error activating streak freeze:", error);
      return { success: false, reason: "Failed to activate" };
    }
  }, [fetchProgress]);

  const addGemsAndStars = useCallback(async (gems: number, stars: number) => {
    try {
      const { data: existing } = await supabase
        .from("user_progress")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("user_progress")
          .update({
            total_gems: existing.total_gems + gems,
            total_stars: existing.total_stars + stars,
            total_sessions: existing.total_sessions + 1,
          })
          .eq("id", existing.id);
      } else {
        await supabase
          .from("user_progress")
          .insert({
            total_gems: gems,
            total_stars: stars,
            total_sessions: 1,
          });
      }

      // Also update streak
      await updateStreak();
    } catch (error) {
      console.error("Error adding gems and stars:", error);
    }
  }, [updateStreak]);

  const incrementDailyGoal = useCallback(async () => {
    try {
      const { data: existing } = await supabase
        .from("user_progress")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (existing && existing.daily_goals_completed < existing.daily_goals_target) {
        await supabase
          .from("user_progress")
          .update({
            daily_goals_completed: existing.daily_goals_completed + 1,
          })
          .eq("id", existing.id);
        await fetchProgress();
      }
    } catch (error) {
      console.error("Error incrementing daily goal:", error);
    }
  }, [fetchProgress]);

  useEffect(() => {
    fetchProgress();

    // Subscribe to realtime updates
    const progressChannel = supabase
      .channel('user-progress-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_progress' }, fetchProgress)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_streaks' }, fetchProgress)
      .subscribe();

    return () => {
      supabase.removeChannel(progressChannel);
    };
  }, [fetchProgress]);

  return {
    progress,
    loading,
    updateProgress,
    updateStreak,
    addGemsAndStars,
    incrementDailyGoal,
    refetch: fetchProgress,
  };
};
