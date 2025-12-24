import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface VictoryLog {
  id: string;
  reporter_name: string;
  reporter_role: string;
  victory_text: string;
  created_at: string;
}

export const useVictoryLogs = () => {
  const [victories, setVictories] = useState<VictoryLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVictories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("victory_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setVictories(data || []);
    } catch (error) {
      console.error("Error fetching victories:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addVictory = useCallback(async (reporterName: string, reporterRole: string, victoryText: string) => {
    try {
      const { error } = await supabase
        .from("victory_logs")
        .insert({
          reporter_name: reporterName,
          reporter_role: reporterRole,
          victory_text: victoryText,
        });

      if (error) throw error;
      toast.success("Victory logged! 🎉");
      await fetchVictories();
      return true;
    } catch (error) {
      console.error("Error adding victory:", error);
      toast.error("Failed to log victory");
      return false;
    }
  }, [fetchVictories]);

  const formatVictoryTime = useCallback((dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  }, []);

  useEffect(() => {
    fetchVictories();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('victories-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'victory_logs' }, fetchVictories)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchVictories]);

  return {
    victories,
    loading,
    addVictory,
    formatVictoryTime,
    refetch: fetchVictories,
  };
};
