import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SyncHistoryEntry {
  id: string;
  device_name: string;
  battery_level: number | null;
  storage_used_mb: number | null;
  storage_total_mb: number | null;
  files_transferred: number | null;
  sync_duration_seconds: number | null;
  sync_status: string;
  synced_at: string;
}

export function useSyncHistory(limit = 10) {
  const [entries, setEntries] = useState<SyncHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("pendant_sync_history")
      .select("id, device_name, battery_level, storage_used_mb, storage_total_mb, files_transferred, sync_duration_seconds, sync_status, synced_at")
      .order("synced_at", { ascending: false })
      .limit(limit);

    setEntries((data as SyncHistoryEntry[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, [limit]);

  return { entries, loading, refresh: fetchHistory };
}
