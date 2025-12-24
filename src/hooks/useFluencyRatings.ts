import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FluencyRating {
  id: string;
  rating: number;
  notes: string | null;
  rating_date: string;
  created_at: string;
}

export const useFluencyRatings = () => {
  const [ratings, setRatings] = useState<FluencyRating[]>([]);
  const [todayRating, setTodayRating] = useState<FluencyRating | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRatings = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from("daily_fluency_ratings")
        .select("*")
        .order("rating_date", { ascending: false })
        .limit(30);

      if (error) throw error;
      
      setRatings(data || []);
      setTodayRating(data?.find(r => r.rating_date === today) || null);
    } catch (error) {
      console.error("Error fetching ratings:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveRating = useCallback(async (rating: number, notes?: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Check if rating already exists for today
      const { data: existing } = await supabase
        .from("daily_fluency_ratings")
        .select("id")
        .eq("rating_date", today)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("daily_fluency_ratings")
          .update({ rating, notes })
          .eq("id", existing.id);

        if (error) throw error;
        toast.success("Rating updated!");
      } else {
        const { error } = await supabase
          .from("daily_fluency_ratings")
          .insert({ rating, notes, rating_date: today });

        if (error) throw error;
        toast.success("Rating logged!");
      }

      await fetchRatings();
      return true;
    } catch (error) {
      console.error("Error saving rating:", error);
      toast.error("Failed to save rating");
      return false;
    }
  }, [fetchRatings]);

  const getWeeklyAverage = useCallback(() => {
    const lastWeek = ratings.slice(0, 7);
    if (lastWeek.length === 0) return 0;
    return Math.round(lastWeek.reduce((acc, r) => acc + r.rating, 0) / lastWeek.length * 10) / 10;
  }, [ratings]);

  const getTrend = useCallback(() => {
    if (ratings.length < 2) return 0;
    const recent = ratings.slice(0, 7);
    const older = ratings.slice(7, 14);
    
    if (older.length === 0) return 0;
    
    const recentAvg = recent.reduce((acc, r) => acc + r.rating, 0) / recent.length;
    const olderAvg = older.reduce((acc, r) => acc + r.rating, 0) / older.length;
    
    // Lower is better for fluency rating (1 = most fluent)
    return Math.round((olderAvg - recentAvg) * 10) / 10;
  }, [ratings]);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  return {
    ratings,
    todayRating,
    loading,
    saveRating,
    getWeeklyAverage,
    getTrend,
    refetch: fetchRatings,
  };
};
