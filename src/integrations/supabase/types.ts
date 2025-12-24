export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      practice_sessions: {
        Row: {
          accuracy_score: number | null
          blocks_count: number | null
          created_at: string
          duration_seconds: number | null
          easy_onset_score: number | null
          exercise_category: string
          exercise_difficulty: string
          exercise_name: string
          fluency_score: number | null
          gems_earned: number | null
          id: string
          interjections_count: number | null
          messages_count: number | null
          pacing_score: number | null
          prolongations_count: number | null
          repetitions_count: number | null
          session_date: string
          stars_earned: number | null
          target_phrase: string | null
          topic_id: string | null
          transcript: string | null
          user_id: string | null
        }
        Insert: {
          accuracy_score?: number | null
          blocks_count?: number | null
          created_at?: string
          duration_seconds?: number | null
          easy_onset_score?: number | null
          exercise_category: string
          exercise_difficulty?: string
          exercise_name: string
          fluency_score?: number | null
          gems_earned?: number | null
          id?: string
          interjections_count?: number | null
          messages_count?: number | null
          pacing_score?: number | null
          prolongations_count?: number | null
          repetitions_count?: number | null
          session_date?: string
          stars_earned?: number | null
          target_phrase?: string | null
          topic_id?: string | null
          transcript?: string | null
          user_id?: string | null
        }
        Update: {
          accuracy_score?: number | null
          blocks_count?: number | null
          created_at?: string
          duration_seconds?: number | null
          easy_onset_score?: number | null
          exercise_category?: string
          exercise_difficulty?: string
          exercise_name?: string
          fluency_score?: number | null
          gems_earned?: number | null
          id?: string
          interjections_count?: number | null
          messages_count?: number | null
          pacing_score?: number | null
          prolongations_count?: number | null
          repetitions_count?: number | null
          session_date?: string
          stars_earned?: number | null
          target_phrase?: string | null
          topic_id?: string | null
          transcript?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      quest_completions: {
        Row: {
          completed_at: string
          created_at: string
          exercise_id: string
          id: string
          quest_id: string
          user_id: string | null
        }
        Insert: {
          completed_at?: string
          created_at?: string
          exercise_id: string
          id?: string
          quest_id: string
          user_id?: string | null
        }
        Update: {
          completed_at?: string
          created_at?: string
          exercise_id?: string
          id?: string
          quest_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      session_reviews: {
        Row: {
          created_at: string
          id: string
          progress_rating: number | null
          recommendations: string | null
          reviewed_at: string
          session_id: string
          technique_rating: number | null
          therapist_notes: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          progress_rating?: number | null
          recommendations?: string | null
          reviewed_at?: string
          session_id: string
          technique_rating?: number | null
          therapist_notes?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          progress_rating?: number | null
          recommendations?: string | null
          reviewed_at?: string
          session_id?: string
          technique_rating?: number | null
          therapist_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_reviews_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "practice_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      daily_analytics: {
        Row: {
          avg_accuracy: number | null
          avg_fluency: number | null
          practice_date: string | null
          total_blocks: number | null
          total_gems: number | null
          total_interjections: number | null
          total_practice_time: number | null
          total_prolongations: number | null
          total_repetitions: number | null
          total_sessions: number | null
          total_stars: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
