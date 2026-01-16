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
      ad_events: {
        Row: {
          ad_id: string
          created_at: string
          event_type: string
          id: string
          placement: string
          platform: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          ad_id: string
          created_at?: string
          event_type: string
          id?: string
          placement: string
          platform: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          ad_id?: string
          created_at?: string
          event_type?: string
          id?: string
          placement?: string
          platform?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_events_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "admin_ads"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_ad_controls: {
        Row: {
          app_enabled: boolean
          id: number
          kill_switch: boolean
          updated_at: string
          web_enabled: boolean
        }
        Insert: {
          app_enabled?: boolean
          id?: number
          kill_switch?: boolean
          updated_at?: string
          web_enabled?: boolean
        }
        Update: {
          app_enabled?: boolean
          id?: number
          kill_switch?: boolean
          updated_at?: string
          web_enabled?: boolean
        }
        Relationships: []
      }
      admin_ads: {
        Row: {
          ad_code: string
          ad_type: string
          button_text: string | null
          created_at: string
          end_at: string | null
          frequency: number | null
          frequency_per_session: number | null
          id: string
          image_path: string | null
          link_url: string | null
          max_daily_views: number | null
          placement: string | null
          platform: string
          priority: number
          show_after_n_items: number | null
          start_at: string | null
          status: string
          target_platform: string
          title: string
          updated_at: string
          zone: string
        }
        Insert: {
          ad_code: string
          ad_type: string
          button_text?: string | null
          created_at?: string
          end_at?: string | null
          frequency?: number | null
          frequency_per_session?: number | null
          id?: string
          image_path?: string | null
          link_url?: string | null
          max_daily_views?: number | null
          placement?: string | null
          platform?: string
          priority?: number
          show_after_n_items?: number | null
          start_at?: string | null
          status?: string
          target_platform?: string
          title: string
          updated_at?: string
          zone: string
        }
        Update: {
          ad_code?: string
          ad_type?: string
          button_text?: string | null
          created_at?: string
          end_at?: string | null
          frequency?: number | null
          frequency_per_session?: number | null
          id?: string
          image_path?: string | null
          link_url?: string | null
          max_daily_views?: number | null
          placement?: string | null
          platform?: string
          priority?: number
          show_after_n_items?: number | null
          start_at?: string | null
          status?: string
          target_platform?: string
          title?: string
          updated_at?: string
          zone?: string
        }
        Relationships: []
      }
      admin_audit_log: {
        Row: {
          action: string
          actor_id: string
          created_at: string
          id: string
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
        }
        Insert: {
          action: string
          actor_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
        }
        Update: {
          action?: string
          actor_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_content: {
        Row: {
          approval_required: boolean
          approved_at: string | null
          approved_by: string | null
          audio_url: string | null
          category: string | null
          content: string | null
          content_arabic: string | null
          content_en: string | null
          content_hi: string | null
          content_pronunciation: string | null
          content_type: string
          content_ur: string | null
          created_at: string | null
          created_by: string | null
          current_version_id: string | null
          id: string
          image_url: string | null
          is_published: boolean | null
          metadata: Json | null
          order_index: number | null
          pdf_url: string | null
          published_at: string | null
          scheduled_at: string | null
          status: string
          title: string
          title_arabic: string | null
          title_en: string | null
          title_hi: string | null
          title_ur: string | null
          updated_at: string | null
        }
        Insert: {
          approval_required?: boolean
          approved_at?: string | null
          approved_by?: string | null
          audio_url?: string | null
          category?: string | null
          content?: string | null
          content_arabic?: string | null
          content_en?: string | null
          content_hi?: string | null
          content_pronunciation?: string | null
          content_type: string
          content_ur?: string | null
          created_at?: string | null
          created_by?: string | null
          current_version_id?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          metadata?: Json | null
          order_index?: number | null
          pdf_url?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          status?: string
          title: string
          title_arabic?: string | null
          title_en?: string | null
          title_hi?: string | null
          title_ur?: string | null
          updated_at?: string | null
        }
        Update: {
          approval_required?: boolean
          approved_at?: string | null
          approved_by?: string | null
          audio_url?: string | null
          category?: string | null
          content?: string | null
          content_arabic?: string | null
          content_en?: string | null
          content_hi?: string | null
          content_pronunciation?: string | null
          content_type?: string
          content_ur?: string | null
          created_at?: string | null
          created_by?: string | null
          current_version_id?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          metadata?: Json | null
          order_index?: number | null
          pdf_url?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          status?: string
          title?: string
          title_arabic?: string | null
          title_en?: string | null
          title_hi?: string | null
          title_ur?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_content_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_content_current_version_id_fkey"
            columns: ["current_version_id"]
            isOneToOne: false
            referencedRelation: "content_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_notifications: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          message: string
          scheduled_at: string | null
          sent_at: string | null
          status: string | null
          target_role: Database["public"]["Enums"]["app_role"] | null
          target_user_ids: string[] | null
          title: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          message: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          target_role?: Database["public"]["Enums"]["app_role"] | null
          target_user_ids?: string[] | null
          title: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          message?: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          target_role?: Database["public"]["Enums"]["app_role"] | null
          target_user_ids?: string[] | null
          title?: string
        }
        Relationships: []
      }
      admin_passcode_history: {
        Row: {
          created_at: string
          id: string
          passcode_hash: string
        }
        Insert: {
          created_at?: string
          id?: string
          passcode_hash: string
        }
        Update: {
          created_at?: string
          id?: string
          passcode_hash?: string
        }
        Relationships: []
      }
      admin_security_config: {
        Row: {
          admin_email: string
          failed_attempts: number
          id: number
          locked_until: string | null
          passcode_hash: string
          require_fingerprint: boolean
          updated_at: string
        }
        Insert: {
          admin_email?: string
          failed_attempts?: number
          id?: number
          locked_until?: string | null
          passcode_hash: string
          require_fingerprint?: boolean
          updated_at?: string
        }
        Update: {
          admin_email?: string
          failed_attempts?: number
          id?: number
          locked_until?: string | null
          passcode_hash?: string
          require_fingerprint?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      admin_unlock_attempts: {
        Row: {
          created_at: string
          device_fingerprint: string
          id: string
          success: boolean
        }
        Insert: {
          created_at?: string
          device_fingerprint: string
          id?: string
          success?: boolean
        }
        Update: {
          created_at?: string
          device_fingerprint?: string
          id?: string
          success?: boolean
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      content_approvals: {
        Row: {
          approved_by: string | null
          content_id: string
          created_at: string
          id: string
          reason: string | null
          requested_by: string
          status: string
          updated_at: string
          version_id: string | null
        }
        Insert: {
          approved_by?: string | null
          content_id: string
          created_at?: string
          id?: string
          reason?: string | null
          requested_by: string
          status: string
          updated_at?: string
          version_id?: string | null
        }
        Update: {
          approved_by?: string | null
          content_id?: string
          created_at?: string
          id?: string
          reason?: string | null
          requested_by?: string
          status?: string
          updated_at?: string
          version_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_approvals_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_approvals_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "admin_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_approvals_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_approvals_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "content_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      content_review_comments: {
        Row: {
          actor_id: string
          comment: string
          content_id: string
          created_at: string
          id: string
        }
        Insert: {
          actor_id: string
          comment: string
          content_id: string
          created_at?: string
          id?: string
        }
        Update: {
          actor_id?: string
          comment?: string
          content_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_review_comments_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "admin_content"
            referencedColumns: ["id"]
          },
        ]
      }
      content_versions: {
        Row: {
          change_summary: string | null
          content: string | null
          content_arabic: string | null
          content_id: string
          created_at: string
          created_by: string
          id: string
          metadata: Json | null
          title: string
          title_arabic: string | null
          version_number: number
        }
        Insert: {
          change_summary?: string | null
          content?: string | null
          content_arabic?: string | null
          content_id: string
          created_at?: string
          created_by: string
          id?: string
          metadata?: Json | null
          title: string
          title_arabic?: string | null
          version_number: number
        }
        Update: {
          change_summary?: string | null
          content?: string | null
          content_arabic?: string | null
          content_id?: string
          created_at?: string
          created_by?: string
          id?: string
          metadata?: Json | null
          title?: string
          title_arabic?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "content_versions_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "admin_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      role_capabilities: {
        Row: {
          allowed: boolean
          capability: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          allowed?: boolean
          capability: string
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          allowed?: boolean
          capability?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      user_activity: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_mfa_settings: {
        Row: {
          created_at: string
          id: string
          is_mfa_enabled: boolean
          method: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_mfa_enabled?: boolean
          method?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_mfa_enabled?: boolean
          method?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bootstrap_first_super_admin: { Args: never; Returns: boolean }
      ensure_profile_and_user_role: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      set_admin_passcode: { Args: { new_passcode: string }; Returns: boolean }
      update_admin_passcode: {
        Args: { new_passcode: string }
        Returns: boolean
      }
      verify_admin_passcode: {
        Args: { _device_fingerprint: string; _passcode: string }
        Returns: {
          locked_until: string
          ok: boolean
          reason: string
        }[]
      }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "editor" | "user"
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
      app_role: ["super_admin", "admin", "editor", "user"],
    },
  },
} as const
