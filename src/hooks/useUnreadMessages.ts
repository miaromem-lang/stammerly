import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UnreadCounts {
  [questId: string]: number;
}

const STORAGE_KEY = "quest_messages_last_read";

const getLastReadTimestamps = (): Record<string, string> => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
};

const setLastReadTimestamp = (questId: string) => {
  const timestamps = getLastReadTimestamps();
  timestamps[questId] = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(timestamps));
};

export const useUnreadMessages = (questIds: string[], userRole: string) => {
  const [unreadCounts, setUnreadCounts] = useState<UnreadCounts>({});

  const fetchUnreadCounts = useCallback(async () => {
    if (questIds.length === 0) return;

    const lastReadTimestamps = getLastReadTimestamps();
    const counts: UnreadCounts = {};

    for (const questId of questIds) {
      const lastRead = lastReadTimestamps[questId];
      
      let query = supabase
        .from("quest_messages")
        .select("id, sender_role", { count: "exact" })
        .eq("quest_id", questId)
        .neq("sender_role", userRole);
      
      if (lastRead) {
        query = query.gt("created_at", lastRead);
      }
      
      const { count } = await query;
      counts[questId] = count || 0;
    }

    setUnreadCounts(counts);
  }, [questIds, userRole]);

  useEffect(() => {
    fetchUnreadCounts();

    // Subscribe to realtime updates for all quests
    const channels = questIds.map(questId => 
      supabase
        .channel(`unread-${questId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'quest_messages',
            filter: `quest_id=eq.${questId}`
          },
          (payload) => {
            const newMessage = payload.new as { sender_role: string };
            // Only increment if it's from someone else
            if (newMessage.sender_role !== userRole) {
              setUnreadCounts(prev => ({
                ...prev,
                [questId]: (prev[questId] || 0) + 1
              }));
            }
          }
        )
        .subscribe()
    );

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [questIds, userRole, fetchUnreadCounts]);

  const markAsRead = useCallback((questId: string) => {
    setLastReadTimestamp(questId);
    setUnreadCounts(prev => ({ ...prev, [questId]: 0 }));
  }, []);

  const getTotalUnread = useCallback(() => {
    return Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);
  }, [unreadCounts]);

  return { unreadCounts, markAsRead, getTotalUnread, refetch: fetchUnreadCounts };
};
