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
      admin_permissions: {
        Row: {
          created_at: string
          id: string
          permission_area: string
          permission_level: Database["public"]["Enums"]["admin_permission_level"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          permission_area: string
          permission_level?: Database["public"]["Enums"]["admin_permission_level"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          permission_area?: string
          permission_level?: Database["public"]["Enums"]["admin_permission_level"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      algorithm_changelog: {
        Row: {
          created_at: string
          details: string | null
          id: string
          impact_level: string
          model_area: string
          published_at: string
          summary: string
          title: string
          version: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          impact_level?: string
          model_area?: string
          published_at?: string
          summary: string
          title: string
          version: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          impact_level?: string
          model_area?: string
          published_at?: string
          summary?: string
          title?: string
          version?: string
        }
        Relationships: []
      }
      api_rate_limits: {
        Row: {
          created_at: string
          function_name: string
          id: string
          is_enabled: boolean
          max_daily_cost_gbp: number
          max_requests_per_hour: number
          max_requests_per_minute: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          function_name: string
          id?: string
          is_enabled?: boolean
          max_daily_cost_gbp?: number
          max_requests_per_hour?: number
          max_requests_per_minute?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          function_name?: string
          id?: string
          is_enabled?: boolean
          max_daily_cost_gbp?: number
          max_requests_per_hour?: number
          max_requests_per_minute?: number
          updated_at?: string
        }
        Relationships: []
      }
      api_usage_logs: {
        Row: {
          created_at: string
          error_message: string | null
          estimated_cost_gbp: number
          function_name: string
          id: string
          status: string
          tokens_used: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          estimated_cost_gbp?: number
          function_name: string
          id?: string
          status?: string
          tokens_used?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          estimated_cost_gbp?: number
          function_name?: string
          id?: string
          status?: string
          tokens_used?: number
          user_id?: string | null
        }
        Relationships: []
      }
      context_notes: {
        Row: {
          child_user_id: string | null
          created_at: string
          id: string
          note_date: string
          note_text: string
          parent_user_id: string | null
        }
        Insert: {
          child_user_id?: string | null
          created_at?: string
          id?: string
          note_date?: string
          note_text: string
          parent_user_id?: string | null
        }
        Update: {
          child_user_id?: string | null
          created_at?: string
          id?: string
          note_date?: string
          note_text?: string
          parent_user_id?: string | null
        }
        Relationships: []
      }
      daily_fluency_ratings: {
        Row: {
          child_user_id: string | null
          created_at: string
          id: string
          notes: string | null
          parent_user_id: string | null
          rating: number
          rating_date: string
        }
        Insert: {
          child_user_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          parent_user_id?: string | null
          rating: number
          rating_date?: string
        }
        Update: {
          child_user_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          parent_user_id?: string | null
          rating?: number
          rating_date?: string
        }
        Relationships: []
      }
      disfluency_logs: {
        Row: {
          created_at: string
          disfluency_category: string
          disfluency_type: string
          duration_ms: number | null
          id: string
          phoneme: string | null
          position_in_word: string | null
          session_id: string | null
          severity: string | null
          timestamp_in_session: number | null
          user_id: string | null
          word: string
        }
        Insert: {
          created_at?: string
          disfluency_category?: string
          disfluency_type: string
          duration_ms?: number | null
          id?: string
          phoneme?: string | null
          position_in_word?: string | null
          session_id?: string | null
          severity?: string | null
          timestamp_in_session?: number | null
          user_id?: string | null
          word: string
        }
        Update: {
          created_at?: string
          disfluency_category?: string
          disfluency_type?: string
          duration_ms?: number | null
          id?: string
          phoneme?: string | null
          position_in_word?: string | null
          session_id?: string | null
          severity?: string | null
          timestamp_in_session?: number | null
          user_id?: string | null
          word?: string
        }
        Relationships: [
          {
            foreignKeyName: "disfluency_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "practice_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_request_upvotes: {
        Row: {
          created_at: string
          feature_request_id: string
          id: string
          session_fingerprint: string
        }
        Insert: {
          created_at?: string
          feature_request_id: string
          id?: string
          session_fingerprint: string
        }
        Update: {
          created_at?: string
          feature_request_id?: string
          id?: string
          session_fingerprint?: string
        }
        Relationships: [
          {
            foreignKeyName: "feature_request_upvotes_feature_request_id_fkey"
            columns: ["feature_request_id"]
            isOneToOne: false
            referencedRelation: "feature_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_requests: {
        Row: {
          author_name: string
          author_role: string
          category: string
          created_at: string
          description: string
          id: string
          status: string
          title: string
          upvote_count: number
        }
        Insert: {
          author_name?: string
          author_role?: string
          category?: string
          created_at?: string
          description: string
          id?: string
          status?: string
          title: string
          upvote_count?: number
        }
        Update: {
          author_name?: string
          author_role?: string
          category?: string
          created_at?: string
          description?: string
          id?: string
          status?: string
          title?: string
          upvote_count?: number
        }
        Relationships: []
      }
      kid_messages: {
        Row: {
          child_user_id: string | null
          created_at: string
          id: string
          message: string
          read_at: string | null
          recipient_role: string
        }
        Insert: {
          child_user_id?: string | null
          created_at?: string
          id?: string
          message: string
          read_at?: string | null
          recipient_role: string
        }
        Update: {
          child_user_id?: string | null
          created_at?: string
          id?: string
          message?: string
          read_at?: string | null
          recipient_role?: string
        }
        Relationships: []
      }
      low_battery_alerts: {
        Row: {
          acknowledged_at: string | null
          battery_level: number
          created_at: string
          device_name: string
          id: string
          user_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          battery_level: number
          created_at?: string
          device_name?: string
          id?: string
          user_id: string
        }
        Update: {
          acknowledged_at?: string | null
          battery_level?: number
          created_at?: string
          device_name?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      mood_checkins: {
        Row: {
          anxiety_level: number | null
          checkin_date: string
          context_note: string | null
          created_at: string
          id: string
          mood_emoji: string
          mood_score: number
          user_id: string
        }
        Insert: {
          anxiety_level?: number | null
          checkin_date?: string
          context_note?: string | null
          created_at?: string
          id?: string
          mood_emoji?: string
          mood_score: number
          user_id: string
        }
        Update: {
          anxiety_level?: number | null
          checkin_date?: string
          context_note?: string | null
          created_at?: string
          id?: string
          mood_emoji?: string
          mood_score?: number
          user_id?: string
        }
        Relationships: []
      }
      parent_child_links: {
        Row: {
          child_display_name: string
          child_user_id: string
          created_at: string
          id: string
          is_active: boolean
          parent_user_id: string
        }
        Insert: {
          child_display_name?: string
          child_user_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          parent_user_id: string
        }
        Update: {
          child_display_name?: string
          child_user_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          parent_user_id?: string
        }
        Relationships: []
      }
      pendant_sync_history: {
        Row: {
          battery_level: number | null
          created_at: string
          device_name: string
          files_transferred: number | null
          id: string
          storage_total_mb: number | null
          storage_used_mb: number | null
          sync_duration_seconds: number | null
          sync_status: string
          synced_at: string
          user_id: string
        }
        Insert: {
          battery_level?: number | null
          created_at?: string
          device_name?: string
          files_transferred?: number | null
          id?: string
          storage_total_mb?: number | null
          storage_used_mb?: number | null
          sync_duration_seconds?: number | null
          sync_status?: string
          synced_at?: string
          user_id: string
        }
        Update: {
          battery_level?: number | null
          created_at?: string
          device_name?: string
          files_transferred?: number | null
          id?: string
          storage_total_mb?: number | null
          storage_used_mb?: number | null
          sync_duration_seconds?: number | null
          sync_status?: string
          synced_at?: string
          user_id?: string
        }
        Relationships: []
      }
      practice_sessions: {
        Row: {
          accuracy_score: number | null
          adaptation_score: number | null
          articulation_rate: number | null
          audio_file_path: string | null
          avg_pause_duration_ms: number | null
          blocks_count: number | null
          consistency_words: Json | null
          created_at: string
          duration_seconds: number | null
          easy_onset_attempts: number | null
          easy_onset_score: number | null
          easy_onset_successes: number | null
          environment_type: string | null
          exercise_category: string
          exercise_difficulty: string
          exercise_name: string
          fluency_score: number | null
          gems_earned: number | null
          id: string
          initiation_lag_ms: number | null
          interjections_count: number | null
          linguistic_pauses_count: number | null
          longest_block_ms: number | null
          messages_count: number | null
          naturalness_score: number | null
          od_count: number | null
          pacing_score: number | null
          percent_syllables_stuttered: number | null
          phoneme_triggers: Json | null
          phrase_repetitions_count: number | null
          pitch_variance: number | null
          prolongations_count: number | null
          repetitions_count: number | null
          revisions_count: number | null
          second_longest_block_ms: number | null
          session_context: string | null
          session_date: string
          sld_count: number | null
          soft_contact_score: number | null
          sound_repetitions_count: number | null
          stars_earned: number | null
          stutter_hesitations_count: number | null
          syllable_repetitions_count: number | null
          syllables_per_minute: number | null
          target_phrase: string | null
          third_longest_block_ms: number | null
          topic_id: string | null
          transcript: string | null
          trial_number: number | null
          user_id: string | null
          volume_variance: number | null
          weighted_stuttering_severity: number | null
          word_avoidances: Json | null
          word_repetitions_count: number | null
        }
        Insert: {
          accuracy_score?: number | null
          adaptation_score?: number | null
          articulation_rate?: number | null
          audio_file_path?: string | null
          avg_pause_duration_ms?: number | null
          blocks_count?: number | null
          consistency_words?: Json | null
          created_at?: string
          duration_seconds?: number | null
          easy_onset_attempts?: number | null
          easy_onset_score?: number | null
          easy_onset_successes?: number | null
          environment_type?: string | null
          exercise_category: string
          exercise_difficulty?: string
          exercise_name: string
          fluency_score?: number | null
          gems_earned?: number | null
          id?: string
          initiation_lag_ms?: number | null
          interjections_count?: number | null
          linguistic_pauses_count?: number | null
          longest_block_ms?: number | null
          messages_count?: number | null
          naturalness_score?: number | null
          od_count?: number | null
          pacing_score?: number | null
          percent_syllables_stuttered?: number | null
          phoneme_triggers?: Json | null
          phrase_repetitions_count?: number | null
          pitch_variance?: number | null
          prolongations_count?: number | null
          repetitions_count?: number | null
          revisions_count?: number | null
          second_longest_block_ms?: number | null
          session_context?: string | null
          session_date?: string
          sld_count?: number | null
          soft_contact_score?: number | null
          sound_repetitions_count?: number | null
          stars_earned?: number | null
          stutter_hesitations_count?: number | null
          syllable_repetitions_count?: number | null
          syllables_per_minute?: number | null
          target_phrase?: string | null
          third_longest_block_ms?: number | null
          topic_id?: string | null
          transcript?: string | null
          trial_number?: number | null
          user_id?: string | null
          volume_variance?: number | null
          weighted_stuttering_severity?: number | null
          word_avoidances?: Json | null
          word_repetitions_count?: number | null
        }
        Update: {
          accuracy_score?: number | null
          adaptation_score?: number | null
          articulation_rate?: number | null
          audio_file_path?: string | null
          avg_pause_duration_ms?: number | null
          blocks_count?: number | null
          consistency_words?: Json | null
          created_at?: string
          duration_seconds?: number | null
          easy_onset_attempts?: number | null
          easy_onset_score?: number | null
          easy_onset_successes?: number | null
          environment_type?: string | null
          exercise_category?: string
          exercise_difficulty?: string
          exercise_name?: string
          fluency_score?: number | null
          gems_earned?: number | null
          id?: string
          initiation_lag_ms?: number | null
          interjections_count?: number | null
          linguistic_pauses_count?: number | null
          longest_block_ms?: number | null
          messages_count?: number | null
          naturalness_score?: number | null
          od_count?: number | null
          pacing_score?: number | null
          percent_syllables_stuttered?: number | null
          phoneme_triggers?: Json | null
          phrase_repetitions_count?: number | null
          pitch_variance?: number | null
          prolongations_count?: number | null
          repetitions_count?: number | null
          revisions_count?: number | null
          second_longest_block_ms?: number | null
          session_context?: string | null
          session_date?: string
          sld_count?: number | null
          soft_contact_score?: number | null
          sound_repetitions_count?: number | null
          stars_earned?: number | null
          stutter_hesitations_count?: number | null
          syllable_repetitions_count?: number | null
          syllables_per_minute?: number | null
          target_phrase?: string | null
          third_longest_block_ms?: number | null
          topic_id?: string | null
          transcript?: string | null
          trial_number?: number | null
          user_id?: string | null
          volume_variance?: number | null
          weighted_stuttering_severity?: number | null
          word_avoidances?: Json | null
          word_repetitions_count?: number | null
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
      quest_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          quest_id: string
          sender_name: string
          sender_role: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          quest_id: string
          sender_name: string
          sender_role: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          quest_id?: string
          sender_name?: string
          sender_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "quest_messages_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "therapist_assigned_quests"
            referencedColumns: ["id"]
          },
        ]
      }
      safeguarding_alerts: {
        Row: {
          alert_type: string
          audio_file_path: string | null
          created_at: string
          id: string
          reason: string
          reviewed_at: string | null
          reviewed_by: string | null
          session_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          alert_type?: string
          audio_file_path?: string | null
          created_at?: string
          id?: string
          reason: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          session_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          alert_type?: string
          audio_file_path?: string | null
          created_at?: string
          id?: string
          reason?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          session_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "safeguarding_alerts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "practice_sessions"
            referencedColumns: ["id"]
          },
        ]
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
      spaced_repetition_items: {
        Row: {
          created_at: string
          ease_factor: number
          exercise_id: string | null
          id: string
          interval_days: number
          last_reviewed_at: string | null
          next_review_date: string
          phoneme: string | null
          repetition_count: number
          user_id: string
          word: string | null
        }
        Insert: {
          created_at?: string
          ease_factor?: number
          exercise_id?: string | null
          id?: string
          interval_days?: number
          last_reviewed_at?: string | null
          next_review_date?: string
          phoneme?: string | null
          repetition_count?: number
          user_id: string
          word?: string | null
        }
        Update: {
          created_at?: string
          ease_factor?: number
          exercise_id?: string | null
          id?: string
          interval_days?: number
          last_reviewed_at?: string | null
          next_review_date?: string
          phoneme?: string | null
          repetition_count?: number
          user_id?: string
          word?: string | null
        }
        Relationships: []
      }
      subjective_ratings: {
        Row: {
          anxiety_after: number | null
          anxiety_before: number | null
          created_at: string
          id: string
          notes: string | null
          rating_date: string
          session_id: string | null
          situation_context: string | null
          suds_rating: number
          user_id: string | null
        }
        Insert: {
          anxiety_after?: number | null
          anxiety_before?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          rating_date?: string
          session_id?: string | null
          situation_context?: string | null
          suds_rating: number
          user_id?: string | null
        }
        Update: {
          anxiety_after?: number | null
          anxiety_before?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          rating_date?: string
          session_id?: string | null
          situation_context?: string | null
          suds_rating?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subjective_ratings_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "practice_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_student_assignments: {
        Row: {
          assigned_at: string
          id: string
          notes: string | null
          student_user_id: string
          teacher_user_id: string
        }
        Insert: {
          assigned_at?: string
          id?: string
          notes?: string | null
          student_user_id: string
          teacher_user_id: string
        }
        Update: {
          assigned_at?: string
          id?: string
          notes?: string | null
          student_user_id?: string
          teacher_user_id?: string
        }
        Relationships: []
      }
      therapist_ai_conversations: {
        Row: {
          created_at: string
          id: string
          message: string
          quest_id: string | null
          role: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          quest_id?: string | null
          role: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          quest_id?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapist_ai_conversations_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "therapist_assigned_quests"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_annotations: {
        Row: {
          assessment_correct: boolean
          corrected_severity: string | null
          corrected_type: string | null
          created_at: string
          disfluency_log_id: string
          id: string
          notes: string | null
          therapist_id: string
          updated_at: string
        }
        Insert: {
          assessment_correct: boolean
          corrected_severity?: string | null
          corrected_type?: string | null
          created_at?: string
          disfluency_log_id: string
          id?: string
          notes?: string | null
          therapist_id: string
          updated_at?: string
        }
        Update: {
          assessment_correct?: boolean
          corrected_severity?: string | null
          corrected_type?: string | null
          created_at?: string
          disfluency_log_id?: string
          id?: string
          notes?: string | null
          therapist_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapist_annotations_disfluency_log_id_fkey"
            columns: ["disfluency_log_id"]
            isOneToOne: false
            referencedRelation: "disfluency_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_assigned_quests: {
        Row: {
          ai_agrees: boolean | null
          ai_alternative_suggestion: string | null
          ai_feedback: string | null
          child_user_id: string | null
          chosen_recommendation: string | null
          completed_at: string | null
          created_at: string
          exercise_category: string
          exercise_id: string
          id: string
          linked_session_id: string | null
          outcome_accuracy_score: number | null
          outcome_fluency_score: number | null
          outcome_notes: string | null
          priority: string
          quest_title: string
          status: string
          therapist_id: string | null
          therapist_reason: string
          updated_at: string
        }
        Insert: {
          ai_agrees?: boolean | null
          ai_alternative_suggestion?: string | null
          ai_feedback?: string | null
          child_user_id?: string | null
          chosen_recommendation?: string | null
          completed_at?: string | null
          created_at?: string
          exercise_category: string
          exercise_id: string
          id?: string
          linked_session_id?: string | null
          outcome_accuracy_score?: number | null
          outcome_fluency_score?: number | null
          outcome_notes?: string | null
          priority?: string
          quest_title: string
          status?: string
          therapist_id?: string | null
          therapist_reason: string
          updated_at?: string
        }
        Update: {
          ai_agrees?: boolean | null
          ai_alternative_suggestion?: string | null
          ai_feedback?: string | null
          child_user_id?: string | null
          chosen_recommendation?: string | null
          completed_at?: string | null
          created_at?: string
          exercise_category?: string
          exercise_id?: string
          id?: string
          linked_session_id?: string | null
          outcome_accuracy_score?: number | null
          outcome_fluency_score?: number | null
          outcome_notes?: string | null
          priority?: string
          quest_title?: string
          status?: string
          therapist_id?: string | null
          therapist_reason?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapist_assigned_quests_linked_session_id_fkey"
            columns: ["linked_session_id"]
            isOneToOne: false
            referencedRelation: "practice_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_category: string
          achievement_emoji: string
          achievement_id: string
          achievement_name: string
          created_at: string
          earned_at: string
          id: string
          user_id: string | null
        }
        Insert: {
          achievement_category?: string
          achievement_emoji: string
          achievement_id: string
          achievement_name: string
          created_at?: string
          earned_at?: string
          id?: string
          user_id?: string | null
        }
        Update: {
          achievement_category?: string
          achievement_emoji?: string
          achievement_id?: string
          achievement_name?: string
          created_at?: string
          earned_at?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          created_at: string
          current_quest_level: number
          daily_goals_completed: number
          daily_goals_target: number
          id: string
          total_gems: number
          total_sessions: number
          total_stars: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          current_quest_level?: number
          daily_goals_completed?: number
          daily_goals_target?: number
          id?: string
          total_gems?: number
          total_sessions?: number
          total_stars?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          current_quest_level?: number
          daily_goals_completed?: number
          daily_goals_target?: number
          id?: string
          total_gems?: number
          total_sessions?: number
          total_stars?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          last_practice_date: string | null
          longest_streak: number
          streak_freeze_active: boolean
          streak_freeze_until: string | null
          streak_freezes_remaining: number
          total_practice_days: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          last_practice_date?: string | null
          longest_streak?: number
          streak_freeze_active?: boolean
          streak_freeze_until?: string | null
          streak_freezes_remaining?: number
          total_practice_days?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          last_practice_date?: string | null
          longest_streak?: number
          streak_freeze_active?: boolean
          streak_freeze_until?: string | null
          streak_freezes_remaining?: number
          total_practice_days?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      victory_logs: {
        Row: {
          child_user_id: string | null
          created_at: string
          id: string
          reporter_name: string
          reporter_role: string
          victory_text: string
        }
        Insert: {
          child_user_id?: string | null
          created_at?: string
          id?: string
          reporter_name: string
          reporter_role?: string
          victory_text: string
        }
        Update: {
          child_user_id?: string | null
          created_at?: string
          id?: string
          reporter_name?: string
          reporter_role?: string
          victory_text?: string
        }
        Relationships: []
      }
      waitlist_signups: {
        Row: {
          created_at: string
          email: string
          id: string
          user_type: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          user_type?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          user_type?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      clinical_metrics_summary: {
        Row: {
          avg_articulation_rate: number | null
          avg_easy_onset: number | null
          avg_initiation_lag: number | null
          avg_naturalness: number | null
          avg_percent_ss: number | null
          avg_spm: number | null
          avg_wss: number | null
          practice_date: string | null
          technique_success_rate: number | null
          total_blocks: number | null
          total_od: number | null
          total_prolongations: number | null
          total_sessions: number | null
          total_sld: number | null
          total_sound_reps: number | null
          total_word_reps: number | null
          user_id: string | null
        }
        Relationships: []
      }
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
      phoneme_trigger_summary: {
        Row: {
          avg_duration_ms: number | null
          disfluency_type: string | null
          occurrence_count: number | null
          phoneme: string | null
          user_id: string | null
          week_start: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_rate_limit: {
        Args: { _function_name: string; _user_id?: string }
        Returns: Json
      }
      cleanup_expired_audio: { Args: never; Returns: undefined }
      current_user_has_role: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      admin_permission_level: "none" | "read" | "write" | "full"
      app_role: "kid" | "parent" | "teacher" | "therapist" | "admin"
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
    Enums: {
      admin_permission_level: ["none", "read", "write", "full"],
      app_role: ["kid", "parent", "teacher", "therapist", "admin"],
    },
  },
} as const
