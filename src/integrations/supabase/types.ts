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
          content_pronunciation_en: string | null
          content_pronunciation_hi: string | null
          content_pronunciation_ur: string | null
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
          content_pronunciation_en?: string | null
          content_pronunciation_hi?: string | null
          content_pronunciation_ur?: string | null
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
          content_pronunciation_en?: string | null
          content_pronunciation_hi?: string | null
          content_pronunciation_ur?: string | null
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
      admin_layout_settings: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          layout_key: string
          order_index: number
          platform: string
          section_key: string
          settings: Json
          size: string | null
          updated_at: string
          updated_by: string | null
          visible: boolean
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          layout_key: string
          order_index?: number
          platform: string
          section_key: string
          settings?: Json
          size?: string | null
          updated_at?: string
          updated_by?: string | null
          visible?: boolean
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          layout_key?: string
          order_index?: number
          platform?: string
          section_key?: string
          settings?: Json
          size?: string | null
          updated_at?: string
          updated_by?: string | null
          visible?: boolean
        }
        Relationships: []
      }
      admin_layout_settings_versions: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          layout_key: string
          platform: string
          snapshot: Json
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          layout_key: string
          platform: string
          snapshot: Json
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          layout_key?: string
          platform?: string
          snapshot?: Json
        }
        Relationships: []
      }
      admin_notifications: {
        Row: {
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          message: string
          scheduled_at: string | null
          sent_at: string | null
          status: string | null
          target_role: Database["public"]["Enums"]["app_role"] | null
          target_user_ids: string[] | null
          ticker_active: boolean
          ticker_style: Json | null
          title: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          message: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          target_role?: Database["public"]["Enums"]["app_role"] | null
          target_user_ids?: string[] | null
          ticker_active?: boolean
          ticker_style?: Json | null
          title: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          message?: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          target_role?: Database["public"]["Enums"]["app_role"] | null
          target_user_ids?: string[] | null
          ticker_active?: boolean
          ticker_style?: Json | null
          title?: string
        }
        Relationships: []
      }
      admin_occasions: {
        Row: {
          card_css: string | null
          container_class_name: string | null
          created_at: string
          css_code: string | null
          display_order: number
          dua_text: string | null
          end_date: string
          html_code: string | null
          id: string
          image_url: string | null
          is_active: boolean
          message: string | null
          platform: Database["public"]["Enums"]["occasion_platform"]
          start_date: string
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          card_css?: string | null
          container_class_name?: string | null
          created_at?: string
          css_code?: string | null
          display_order?: number
          dua_text?: string | null
          end_date: string
          html_code?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          message?: string | null
          platform?: Database["public"]["Enums"]["occasion_platform"]
          start_date: string
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          card_css?: string | null
          container_class_name?: string | null
          created_at?: string
          css_code?: string | null
          display_order?: number
          dua_text?: string | null
          end_date?: string
          html_code?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          message?: string | null
          platform?: Database["public"]["Enums"]["occasion_platform"]
          start_date?: string
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_page_sections: {
        Row: {
          created_at: string
          id: string
          page: string
          platform: string
          position: number
          section_key: string
          settings: Json
          title: string
          updated_at: string
          visible: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          page: string
          platform?: string
          position?: number
          section_key: string
          settings?: Json
          title?: string
          updated_at?: string
          visible?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          page?: string
          platform?: string
          position?: number
          section_key?: string
          settings?: Json
          title?: string
          updated_at?: string
          visible?: boolean
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
      admin_passcode_reset_tokens: {
        Row: {
          admin_email: string
          code_hash: string
          code_salt: string
          created_at: string
          expires_at: string
          id: string
          requested_ip: string | null
          requested_user_id: string | null
          used_at: string | null
        }
        Insert: {
          admin_email: string
          code_hash: string
          code_salt?: string
          created_at?: string
          expires_at: string
          id?: string
          requested_ip?: string | null
          requested_user_id?: string | null
          used_at?: string | null
        }
        Update: {
          admin_email?: string
          code_hash?: string
          code_salt?: string
          created_at?: string
          expires_at?: string
          id?: string
          requested_ip?: string | null
          requested_user_id?: string | null
          used_at?: string | null
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
      admin_splash_screens: {
        Row: {
          created_at: string | null
          created_by: string | null
          duration: number | null
          end_date: string
          fade_out_duration: number | null
          id: string
          is_active: boolean | null
          lottie_url: string
          platform: string | null
          priority: number | null
          start_date: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          duration?: number | null
          end_date: string
          fade_out_duration?: number | null
          id?: string
          is_active?: boolean | null
          lottie_url: string
          platform?: string | null
          priority?: number | null
          start_date: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          duration?: number | null
          end_date?: string
          fade_out_duration?: number | null
          id?: string
          is_active?: boolean | null
          lottie_url?: string
          platform?: string | null
          priority?: number | null
          start_date?: string
          title?: string
          updated_at?: string | null
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
      celebrate_posts: {
        Row: {
          body: string | null
          created_at: string
          created_by: string | null
          cta_text: string | null
          expires_at: string | null
          id: string
          link_url: string | null
          media_path: string | null
          media_type: string | null
          starts_at: string
          target_platform: string
          title: string | null
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          cta_text?: string | null
          expires_at?: string | null
          id?: string
          link_url?: string | null
          media_path?: string | null
          media_type?: string | null
          starts_at?: string
          target_platform?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          cta_text?: string | null
          expires_at?: string | null
          id?: string
          link_url?: string | null
          media_path?: string | null
          media_type?: string | null
          starts_at?: string
          target_platform?: string
          title?: string | null
          updated_at?: string
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
      device_push_tokens: {
        Row: {
          created_at: string
          device_id: string | null
          enabled: boolean
          id: string
          last_seen_at: string
          platform: string
          token: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          device_id?: string | null
          enabled?: boolean
          id?: string
          last_seen_at?: string
          platform: string
          token: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          device_id?: string | null
          enabled?: boolean
          id?: string
          last_seen_at?: string
          platform?: string
          token?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      indexnow_config: {
        Row: {
          api_key: string
          created_at: string
          host: string
          id: number
          key_location: string | null
          last_tested_at: string | null
          test_status: string | null
          updated_at: string
        }
        Insert: {
          api_key: string
          created_at?: string
          host: string
          id?: number
          key_location?: string | null
          last_tested_at?: string | null
          test_status?: string | null
          updated_at?: string
        }
        Update: {
          api_key?: string
          created_at?: string
          host?: string
          id?: number
          key_location?: string | null
          last_tested_at?: string | null
          test_status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      notification_deliveries: {
        Row: {
          browser: string | null
          delivered_at: string
          endpoint_host: string | null
          error_code: string | null
          error_message: string | null
          id: string
          notification_id: string
          platform: string
          provider_message_id: string | null
          stage: string | null
          status: string
          subscription_endpoint: string | null
          subscription_id: string | null
          token_id: string | null
        }
        Insert: {
          browser?: string | null
          delivered_at?: string
          endpoint_host?: string | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          notification_id: string
          platform: string
          provider_message_id?: string | null
          stage?: string | null
          status: string
          subscription_endpoint?: string | null
          subscription_id?: string | null
          token_id?: string | null
        }
        Update: {
          browser?: string | null
          delivered_at?: string
          endpoint_host?: string | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          notification_id?: string
          platform?: string
          provider_message_id?: string | null
          stage?: string | null
          status?: string
          subscription_endpoint?: string | null
          subscription_id?: string | null
          token_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_deliveries_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_deliveries_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "device_push_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_templates: {
        Row: {
          body: string
          category: string
          created_at: string
          created_by: string
          deep_link: string | null
          id: string
          image_url: string | null
          name: string
          target_platform: string
          title: string
          updated_at: string
        }
        Insert: {
          body: string
          category?: string
          created_at?: string
          created_by: string
          deep_link?: string | null
          id?: string
          image_url?: string | null
          name: string
          target_platform?: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          category?: string
          created_at?: string
          created_by?: string
          deep_link?: string | null
          id?: string
          image_url?: string | null
          name?: string
          target_platform?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          created_by: string
          deep_link: string | null
          id: string
          image_url: string | null
          scheduled_at: string | null
          sent_at: string | null
          status: string
          target_platform: string
          title: string
        }
        Insert: {
          body: string
          created_at?: string
          created_by: string
          deep_link?: string | null
          id?: string
          image_url?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          target_platform?: string
          title: string
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string
          deep_link?: string | null
          id?: string
          image_url?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          target_platform?: string
          title?: string
        }
        Relationships: []
      }
      prayer_notification_log: {
        Row: {
          id: string
          notification_id: string | null
          prayer_date: string
          prayer_name: string
          prayer_time: string
          preference_id: string
          sent_at: string
        }
        Insert: {
          id?: string
          notification_id?: string | null
          prayer_date: string
          prayer_name: string
          prayer_time: string
          preference_id: string
          sent_at?: string
        }
        Update: {
          id?: string
          notification_id?: string | null
          prayer_date?: string
          prayer_name?: string
          prayer_time?: string
          preference_id?: string
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prayer_notification_log_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prayer_notification_log_preference_id_fkey"
            columns: ["preference_id"]
            isOneToOne: false
            referencedRelation: "user_notification_preferences"
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
      quiz_questions: {
        Row: {
          category: string
          correct_answer: number
          created_at: string | null
          created_by: string | null
          difficulty: string | null
          id: string
          is_active: boolean | null
          options: Json
          options_bn: Json | null
          options_en: Json | null
          order_index: number | null
          question: string
          question_bn: string | null
          question_en: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          correct_answer: number
          created_at?: string | null
          created_by?: string | null
          difficulty?: string | null
          id?: string
          is_active?: boolean | null
          options: Json
          options_bn?: Json | null
          options_en?: Json | null
          order_index?: number | null
          question: string
          question_bn?: string | null
          question_en?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          correct_answer?: number
          created_at?: string | null
          created_by?: string | null
          difficulty?: string | null
          id?: string
          is_active?: boolean | null
          options?: Json
          options_bn?: Json | null
          options_en?: Json | null
          order_index?: number | null
          question?: string
          question_bn?: string | null
          question_en?: string | null
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
      seo_pages: {
        Row: {
          canonical_url: string | null
          created_at: string
          description: string | null
          id: string
          json_ld: Json | null
          path: string
          robots: string | null
          title: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          canonical_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          json_ld?: Json | null
          path: string
          robots?: string | null
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          canonical_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          json_ld?: Json | null
          path?: string
          robots?: string | null
          title?: string | null
          updated_at?: string
          updated_by?: string | null
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
      user_notification_preferences: {
        Row: {
          calculation_method: string
          created_at: string
          device_id: string
          enabled: boolean
          enabled_prayers: Json
          id: string
          latitude: number
          longitude: number
          notification_offset: number
          timezone: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          calculation_method?: string
          created_at?: string
          device_id: string
          enabled?: boolean
          enabled_prayers?: Json
          id?: string
          latitude: number
          longitude: number
          notification_offset?: number
          timezone?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          calculation_method?: string
          created_at?: string
          device_id?: string
          enabled?: boolean
          enabled_prayers?: Json
          id?: string
          latitude?: number
          longitude?: number
          notification_offset?: number
          timezone?: string
          updated_at?: string
          user_id?: string | null
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
      fetch_ads_for_slot: {
        Args: {
          _limit?: number
          _placement: string
          _platform: string
          _session_id: string
        }
        Returns: {
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
        }[]
        SetofOptions: {
          from: "*"
          to: "admin_ads"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_recent_admin_passcode: {
        Args: { _limit?: number; _passcode: string }
        Returns: boolean
      }
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
      occasion_platform: "web" | "app" | "both"
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
      occasion_platform: ["web", "app", "both"],
    },
  },
} as const
