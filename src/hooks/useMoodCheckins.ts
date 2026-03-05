import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MoodCheckin {
  id: string;
  user_id: string;
  checkin_date: string;
  mood_score: number;
  anxiety_level: number | null;
  mood_emoji: string;
  context_note: string | null;
  created_at: string;
}

export function useMoodCheckins(userId?: string) {
  const [todayCheckin, setTodayCheckin] = useState<MoodCheckin | null>(null);
  const [recentCheckins, setRecentCheckins] = useState<MoodCheckin[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCheckins = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const targetId = userId || user?.id;
    if (!targetId) { setLoading(false); return; }

    const today = new Date().toISOString().split("T")[0];

    // Fetch today's check-in
    const { data: todayData } = await supabase
      .from("mood_checkins")
      .select("*")
      .eq("user_id", targetId)
      .eq("checkin_date", today)
      .maybeSingle();

    setTodayCheckin(todayData as MoodCheckin | null);

    // Fetch last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentData } = await supabase
      .from("mood_checkins")
      .select("*")
      .eq("user_id", targetId)
      .gte("checkin_date", thirtyDaysAgo.toISOString().split("T")[0])
      .order("checkin_date", { ascending: true });

    setRecentCheckins((recentData as MoodCheckin[]) ?? []);
    setLoading(false);
  }, [userId]);

  const saveCheckin = useCallback(async (
    moodScore: number,
    moodEmoji: string,
    anxietyLevel?: number | null,
    contextNote?: string | null,
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in first");
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    if (todayCheckin) {
      // Update existing
      const { error } = await supabase
        .from("mood_checkins")
        .update({
          mood_score: moodScore,
          mood_emoji: moodEmoji,
          anxiety_level: anxietyLevel ?? null,
          context_note: contextNote ?? null,
        })
        .eq("id", todayCheckin.id);

      if (error) {
        toast.error("Couldn't save your check-in");
        return;
      }
      toast.success("Check-in updated! 🌟");
    } else {
      // Insert new
      const { error } = await supabase
        .from("mood_checkins")
        .insert({
          user_id: user.id,
          checkin_date: today,
          mood_score: moodScore,
          mood_emoji: moodEmoji,
          anxiety_level: anxietyLevel ?? null,
          context_note: contextNote ?? null,
        });

      if (error) {
        toast.error("Couldn't save your check-in");
        return;
      }
      toast.success("Check-in saved! 🎉");
    }

    await fetchCheckins();
  }, [todayCheckin, fetchCheckins]);

  useEffect(() => {
    fetchCheckins();
  }, [fetchCheckins]);

  return {
    todayCheckin,
    recentCheckins,
    loading,
    saveCheckin,
    refresh: fetchCheckins,
  };
}
