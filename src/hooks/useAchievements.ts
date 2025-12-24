import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Achievement definitions
export const ACHIEVEMENTS = [
  { id: "first_words", name: "First Words", emoji: "🌟", category: "milestone", description: "Complete your first practice session" },
  { id: "streak_3", name: "3 Day Streak", emoji: "🔥", category: "streak", description: "Practice for 3 days in a row" },
  { id: "streak_7", name: "7 Day Streak", emoji: "🔥", category: "streak", description: "Practice for 7 days in a row" },
  { id: "streak_14", name: "2 Week Warrior", emoji: "⚡", category: "streak", description: "Practice for 14 days in a row" },
  { id: "streak_30", name: "Month Master", emoji: "👑", category: "streak", description: "Practice for 30 days in a row" },
  { id: "fluent_flow", name: "Fluent Flow", emoji: "💎", category: "performance", description: "Achieve 90%+ fluency score" },
  { id: "super_star", name: "Super Star", emoji: "⭐", category: "performance", description: "Earn 50 stars total" },
  { id: "gem_collector", name: "Gem Collector", emoji: "💎", category: "collection", description: "Collect 100 gems" },
  { id: "gem_hoarder", name: "Gem Hoarder", emoji: "💰", category: "collection", description: "Collect 500 gems" },
  { id: "category_master_breathing", name: "Breathing Master", emoji: "🫁", category: "category", description: "Complete all breathing exercises" },
  { id: "category_master_pacing", name: "Pacing Pro", emoji: "🏃", category: "category", description: "Complete all pacing exercises" },
  { id: "category_master_articulation", name: "Articulation Ace", emoji: "👄", category: "category", description: "Complete all articulation exercises" },
  { id: "quest_champion", name: "Quest Champion", emoji: "🏆", category: "quests", description: "Complete 10 quests" },
  { id: "practice_pro", name: "Practice Pro", emoji: "🎯", category: "sessions", description: "Complete 25 practice sessions" },
  { id: "dedication", name: "Dedication", emoji: "💪", category: "sessions", description: "Complete 50 practice sessions" },
];

interface Achievement {
  id: string;
  achievement_id: string;
  achievement_name: string;
  achievement_emoji: string;
  achievement_category: string;
  earned_at: string;
}

export const useAchievements = () => {
  const [earnedAchievements, setEarnedAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAchievements = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("user_achievements")
        .select("*")
        .order("earned_at", { ascending: false });

      if (error) throw error;
      setEarnedAchievements(data || []);
    } catch (error) {
      console.error("Error fetching achievements:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const awardAchievement = useCallback(async (achievementId: string) => {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return false;

    // Check if already earned
    const alreadyEarned = earnedAchievements.some(a => a.achievement_id === achievementId);
    if (alreadyEarned) return false;

    try {
      const { error } = await supabase
        .from("user_achievements")
        .insert({
          achievement_id: achievement.id,
          achievement_name: achievement.name,
          achievement_emoji: achievement.emoji,
          achievement_category: achievement.category,
        });

      if (error) {
        if (error.code === '23505') {
          // Duplicate - already earned
          return false;
        }
        throw error;
      }

      toast.success(`🎉 Achievement Unlocked: ${achievement.name} ${achievement.emoji}`);
      await fetchAchievements();
      return true;
    } catch (error) {
      console.error("Error awarding achievement:", error);
      return false;
    }
  }, [earnedAchievements, fetchAchievements]);

  const checkAndAwardAchievements = useCallback(async (context: {
    totalSessions?: number;
    currentStreak?: number;
    totalGems?: number;
    totalStars?: number;
    fluencyScore?: number;
    completedQuests?: number;
    completedCategories?: string[];
  }) => {
    const toAward: string[] = [];

    // Check session milestones
    if (context.totalSessions && context.totalSessions >= 1) {
      toAward.push("first_words");
    }
    if (context.totalSessions && context.totalSessions >= 25) {
      toAward.push("practice_pro");
    }
    if (context.totalSessions && context.totalSessions >= 50) {
      toAward.push("dedication");
    }

    // Check streak milestones
    if (context.currentStreak && context.currentStreak >= 3) {
      toAward.push("streak_3");
    }
    if (context.currentStreak && context.currentStreak >= 7) {
      toAward.push("streak_7");
    }
    if (context.currentStreak && context.currentStreak >= 14) {
      toAward.push("streak_14");
    }
    if (context.currentStreak && context.currentStreak >= 30) {
      toAward.push("streak_30");
    }

    // Check gem collection
    if (context.totalGems && context.totalGems >= 100) {
      toAward.push("gem_collector");
    }
    if (context.totalGems && context.totalGems >= 500) {
      toAward.push("gem_hoarder");
    }

    // Check star collection
    if (context.totalStars && context.totalStars >= 50) {
      toAward.push("super_star");
    }

    // Check fluency performance
    if (context.fluencyScore && context.fluencyScore >= 90) {
      toAward.push("fluent_flow");
    }

    // Check quest completion
    if (context.completedQuests && context.completedQuests >= 10) {
      toAward.push("quest_champion");
    }

    // Check category mastery
    if (context.completedCategories) {
      if (context.completedCategories.includes("breathing")) {
        toAward.push("category_master_breathing");
      }
      if (context.completedCategories.includes("pacing")) {
        toAward.push("category_master_pacing");
      }
      if (context.completedCategories.includes("articulation")) {
        toAward.push("category_master_articulation");
      }
    }

    // Award each achievement
    for (const achievementId of toAward) {
      await awardAchievement(achievementId);
    }
  }, [awardAchievement]);

  const getAchievementProgress = useCallback(() => {
    const earned = earnedAchievements.length;
    const total = ACHIEVEMENTS.length;
    const percentage = Math.round((earned / total) * 100);
    
    // Find next unearned achievement
    const earnedIds = new Set(earnedAchievements.map(a => a.achievement_id));
    const nextAchievement = ACHIEVEMENTS.find(a => !earnedIds.has(a.id));
    
    return {
      earned,
      total,
      percentage,
      nextAchievement,
    };
  }, [earnedAchievements]);

  const getAllAchievementsWithStatus = useCallback(() => {
    const earnedIds = new Set(earnedAchievements.map(a => a.achievement_id));
    
    return ACHIEVEMENTS.map(achievement => ({
      ...achievement,
      earned: earnedIds.has(achievement.id),
      earnedAt: earnedAchievements.find(a => a.achievement_id === achievement.id)?.earned_at,
    }));
  }, [earnedAchievements]);

  useEffect(() => {
    fetchAchievements();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('achievements-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_achievements' }, fetchAchievements)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAchievements]);

  return {
    earnedAchievements,
    loading,
    awardAchievement,
    checkAndAwardAchievements,
    getAchievementProgress,
    getAllAchievementsWithStatus,
    refetch: fetchAchievements,
  };
};
