import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ContextNote {
  id: string;
  note_text: string;
  note_date: string;
  created_at: string;
}

export const useContextNotes = () => {
  const [notes, setNotes] = useState<ContextNote[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("context_notes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addNote = useCallback(async (noteText: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from("context_notes")
        .insert({
          note_text: noteText,
          note_date: today,
        });

      if (error) throw error;
      toast.success("Note shared with team");
      await fetchNotes();
      return true;
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error("Failed to save note");
      return false;
    }
  }, [fetchNotes]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return {
    notes,
    loading,
    addNote,
    refetch: fetchNotes,
  };
};
