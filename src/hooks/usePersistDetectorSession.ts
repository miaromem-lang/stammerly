import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { MarkerType } from "@/hooks/useStammerDetector";

interface SaveArgs {
  counts: Partial<Record<MarkerType, number>>;
  sessionStart: Date | null;
  environmentType?: string;
  sessionContext?: string;
}

interface SaveResult {
  saved: boolean;
  id?: string;
  reason?: string;
}

export function usePersistDetectorSession() {
  const saveSession = useCallback(
    async ({
      counts,
      sessionStart,
      environmentType = "quiet",
      sessionContext = "live_detector",
    }: SaveArgs): Promise<SaveResult> => {
      if (!sessionStart) return { saved: false, reason: "no_session_start" };

      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) {
        toast.info("Sign in to save sessions to your therapist analytics.");
        return { saved: false, reason: "not_authenticated" };
      }

      const blocks = counts.BLOCK ?? 0;
      const repetitions = counts.REPETITION ?? 0;
      const prolongations = counts.PROLONGATION ?? 0;
      const interjections = counts.INTERJECTION ?? 0;
      const total = blocks + repetitions + prolongations + interjections;

      const durationSeconds = Math.max(
        1,
        Math.round((Date.now() - sessionStart.getTime()) / 1000)
      );

      const { data, error } = await supabase
        .from("practice_sessions")
        .insert({
          user_id: userId,
          session_date: sessionStart.toISOString(),
          duration_seconds: durationSeconds,
          exercise_category: "live_session",
          exercise_name: "Stammerly Live Session",
          exercise_difficulty: "beginner",
          environment_type: environmentType,
          session_context: sessionContext,
          blocks_count: blocks,
          repetitions_count: repetitions,
          sound_repetitions_count: repetitions,
          prolongations_count: prolongations,
          interjections_count: interjections,
          stars_earned: 1,
          gems_earned: total,
        })
        .select("id")
        .single();

      if (error) {
        console.error("Failed to save session:", error);
        toast.error("Couldn't save session to analytics.");
        return { saved: false, reason: error.message };
      }

      toast.success("Session saved to therapist analytics.");
      return { saved: true, id: data.id };
    },
    []
  );

  return { saveSession };
}
