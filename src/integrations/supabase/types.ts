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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      article_interactions: {
        Row: {
          article_id: string
          created_at: string
          id: string
          interaction_type: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          article_id: string
          created_at?: string
          id?: string
          interaction_type: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          article_id?: string
          created_at?: string
          id?: string
          interaction_type?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "article_interactions_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          canonical_hash: string | null
          canonical_url: string
          description: string | null
          id: string
          image_url: string | null
          ingested_at: string
          primary_lane: string
          published_at: string | null
          raw_provider: Json | null
          secondary_tags: Json | null
          source: string | null
          source_id: string | null
          title: string
          url: string
        }
        Insert: {
          canonical_hash?: string | null
          canonical_url: string
          description?: string | null
          id?: string
          image_url?: string | null
          ingested_at?: string
          primary_lane?: string
          published_at?: string | null
          raw_provider?: Json | null
          secondary_tags?: Json | null
          source?: string | null
          source_id?: string | null
          title: string
          url: string
        }
        Update: {
          canonical_hash?: string | null
          canonical_url?: string
          description?: string | null
          id?: string
          image_url?: string | null
          ingested_at?: string
          primary_lane?: string
          published_at?: string | null
          raw_provider?: Json | null
          secondary_tags?: Json | null
          source?: string | null
          source_id?: string | null
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "articles_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_summaries: {
        Row: {
          created_at: string
          id: string
          lane: string
          summary_date: string
          summary_text: string | null
          top_article_ids: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          lane: string
          summary_date: string
          summary_text?: string | null
          top_article_ids?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          lane?: string
          summary_date?: string
          summary_text?: string | null
          top_article_ids?: Json | null
        }
        Relationships: []
      }
      email_campaign_articles: {
        Row: {
          article_id: string
          campaign_id: string
        }
        Insert: {
          article_id: string
          campaign_id: string
        }
        Update: {
          article_id?: string
          campaign_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_campaign_articles_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_campaign_articles_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaigns: {
        Row: {
          campaign_type: string
          content_html: string | null
          content_text: string | null
          created_at: string
          id: string
          scheduled_for: string | null
          sent_at: string | null
          status: string
          subject: string | null
        }
        Insert: {
          campaign_type: string
          content_html?: string | null
          content_text?: string | null
          created_at?: string
          id?: string
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string
          subject?: string | null
        }
        Update: {
          campaign_type?: string
          content_html?: string | null
          content_text?: string | null
          created_at?: string
          id?: string
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string
          subject?: string | null
        }
        Relationships: []
      }
      ingestion_runs: {
        Row: {
          articles_fetched: number | null
          articles_inserted: number | null
          duplicates_skipped: number | null
          ended_at: string | null
          error_message: string | null
          failed_count: number | null
          id: string
          malformed_skipped: number | null
          query_used: string | null
          source_name: string | null
          started_at: string
          status: string
        }
        Insert: {
          articles_fetched?: number | null
          articles_inserted?: number | null
          duplicates_skipped?: number | null
          ended_at?: string | null
          error_message?: string | null
          failed_count?: number | null
          id?: string
          malformed_skipped?: number | null
          query_used?: string | null
          source_name?: string | null
          started_at?: string
          status?: string
        }
        Update: {
          articles_fetched?: number | null
          articles_inserted?: number | null
          duplicates_skipped?: number | null
          ended_at?: string | null
          error_message?: string | null
          failed_count?: number | null
          id?: string
          malformed_skipped?: number | null
          query_used?: string | null
          source_name?: string | null
          started_at?: string
          status?: string
        }
        Relationships: []
      }
      sources: {
        Row: {
          base_url: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          source_category: string | null
          type: string
        }
        Insert: {
          base_url?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          source_category?: string | null
          type: string
        }
        Update: {
          base_url?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          source_category?: string | null
          type?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string | null
          status: string
          wants_builder_lab: boolean
          wants_business_impact: boolean
          wants_daily_brief: boolean
          wants_tool_radar: boolean
          wants_weekly_roundup: boolean
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string | null
          status?: string
          wants_builder_lab?: boolean
          wants_business_impact?: boolean
          wants_daily_brief?: boolean
          wants_tool_radar?: boolean
          wants_weekly_roundup?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string | null
          status?: string
          wants_builder_lab?: boolean
          wants_business_impact?: boolean
          wants_daily_brief?: boolean
          wants_tool_radar?: boolean
          wants_weekly_roundup?: boolean
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          builder_weight: number
          business_weight: number
          created_at: string
          preferred_lanes: Json
          preferred_sources: Json
          preferred_tags: Json
          pulse_weight: number
          tools_weight: number
          updated_at: string
          user_id: string
        }
        Insert: {
          builder_weight?: number
          business_weight?: number
          created_at?: string
          preferred_lanes?: Json
          preferred_sources?: Json
          preferred_tags?: Json
          pulse_weight?: number
          tools_weight?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          builder_weight?: number
          business_weight?: number
          created_at?: string
          preferred_lanes?: Json
          preferred_sources?: Json
          preferred_tags?: Json
          pulse_weight?: number
          tools_weight?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
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
      weekly_digests: {
        Row: {
          article_ids: Json | null
          generated_at: string
          id: string
          intro: string | null
          sections: Json
          status: string
          title: string
          week_end: string
          week_start: string
          wildcard_picks: Json | null
        }
        Insert: {
          article_ids?: Json | null
          generated_at?: string
          id?: string
          intro?: string | null
          sections?: Json
          status?: string
          title: string
          week_end: string
          week_start: string
          wildcard_picks?: Json | null
        }
        Update: {
          article_ids?: Json | null
          generated_at?: string
          id?: string
          intro?: string | null
          sections?: Json
          status?: string
          title?: string
          week_end?: string
          week_start?: string
          wildcard_picks?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
