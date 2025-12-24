import { useCallback } from "react";

const STORAGE_KEY = "stammerly_active_quest";

interface ActiveQuest {
  questId: string;
  chosenRecommendation: "therapist" | "ai";
  exerciseId: string;
  exerciseCategory: string;
  startedAt: string;
}

export const useActiveQuest = () => {
  const setActiveQuest = useCallback((quest: Omit<ActiveQuest, "startedAt">) => {
    const activeQuest: ActiveQuest = {
      ...quest,
      startedAt: new Date().toISOString()
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(activeQuest));
  }, []);

  const getActiveQuest = useCallback((): ActiveQuest | null => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore parse errors
    }
    return null;
  }, []);

  const clearActiveQuest = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  return { setActiveQuest, getActiveQuest, clearActiveQuest };
};
