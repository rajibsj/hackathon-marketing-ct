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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      activecollab_credentials: {
        Row: {
          api_url: string
          bearer_token: string | null
          created_at: string | null
          created_by: string | null
          email: string
          id: string
          is_active: boolean | null
          password_encrypted: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          api_url: string
          bearer_token?: string | null
          created_at?: string | null
          created_by?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          password_encrypted: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          api_url?: string
          bearer_token?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          password_encrypted?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      activecollab_sync_logs: {
        Row: {
          created_at: string | null
          entity_count: number | null
          entity_type: string
          error_message: string | null
          id: string
          status: string
          sync_type: string
          triggered_by: string | null
        }
        Insert: {
          created_at?: string | null
          entity_count?: number | null
          entity_type: string
          error_message?: string | null
          id?: string
          status?: string
          sync_type: string
          triggered_by?: string | null
        }
        Update: {
          created_at?: string | null
          entity_count?: number | null
          entity_type?: string
          error_message?: string | null
          id?: string
          status?: string
          sync_type?: string
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activecollab_sync_logs_triggered_by_fkey"
            columns: ["triggered_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      activecollab_task_data: {
        Row: {
          assignee_id: string | null
          created_at: string | null
          external_task_id: string
          hours_logged: number | null
          id: string
          last_comment: string | null
          last_comment_date: string | null
          project_id: string | null
          raw_data: Json | null
          status: string | null
          sync_date: string
          task_name: string
          updated_at: string | null
        }
        Insert: {
          assignee_id?: string | null
          created_at?: string | null
          external_task_id: string
          hours_logged?: number | null
          id?: string
          last_comment?: string | null
          last_comment_date?: string | null
          project_id?: string | null
          raw_data?: Json | null
          status?: string | null
          sync_date: string
          task_name: string
          updated_at?: string | null
        }
        Update: {
          assignee_id?: string | null
          created_at?: string | null
          external_task_id?: string
          hours_logged?: number | null
          id?: string
          last_comment?: string | null
          last_comment_date?: string | null
          project_id?: string | null
          raw_data?: Json | null
          status?: string | null
          sync_date?: string
          task_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activecollab_task_data_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activecollab_task_data_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      activities: {
        Row: {
          activity_date: string | null
          activity_type: string
          body: string | null
          client_id: string
          created_at: string
          deal_id: string | null
          duration_minutes: number | null
          hubspot_id: string | null
          id: string
          outcome: string | null
          subject: string | null
          updated_at: string
        }
        Insert: {
          activity_date?: string | null
          activity_type: string
          body?: string | null
          client_id: string
          created_at?: string
          deal_id?: string | null
          duration_minutes?: number | null
          hubspot_id?: string | null
          id?: string
          outcome?: string | null
          subject?: string | null
          updated_at?: string
        }
        Update: {
          activity_date?: string | null
          activity_type?: string
          body?: string | null
          client_id?: string
          created_at?: string
          deal_id?: string | null
          duration_minutes?: number | null
          hubspot_id?: string | null
          id?: string
          outcome?: string | null
          subject?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_google_drive_folders: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          file_count: number | null
          folder_id: string
          id: string
          is_active: boolean | null
          last_synced: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          file_count?: number | null
          folder_id: string
          id?: string
          is_active?: boolean | null
          last_synced?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          file_count?: number | null
          folder_id?: string
          id?: string
          is_active?: boolean | null
          last_synced?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      agent_execution_steps: {
        Row: {
          action_type: string
          completion_tokens: number | null
          cost_usd: number | null
          created_at: string | null
          duration_ms: number | null
          id: string
          model_used: string | null
          prompt_tokens: number | null
          reasoning: string | null
          run_id: string | null
          step_number: number
          tokens_used: number | null
          tool_input: Json | null
          tool_name: string | null
          tool_result: Json | null
        }
        Insert: {
          action_type: string
          completion_tokens?: number | null
          cost_usd?: number | null
          created_at?: string | null
          duration_ms?: number | null
          id?: string
          model_used?: string | null
          prompt_tokens?: number | null
          reasoning?: string | null
          run_id?: string | null
          step_number: number
          tokens_used?: number | null
          tool_input?: Json | null
          tool_name?: string | null
          tool_result?: Json | null
        }
        Update: {
          action_type?: string
          completion_tokens?: number | null
          cost_usd?: number | null
          created_at?: string | null
          duration_ms?: number | null
          id?: string
          model_used?: string | null
          prompt_tokens?: number | null
          reasoning?: string | null
          run_id?: string | null
          step_number?: number
          tokens_used?: number | null
          tool_input?: Json | null
          tool_name?: string | null
          tool_result?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_execution_steps_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "ai_agent_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_memories: {
        Row: {
          agent_id: string
          content: string
          created_at: string | null
          embedding: string | null
          expires_at: string | null
          id: string
          memory_type: string
          metadata: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          agent_id: string
          content: string
          created_at?: string | null
          embedding?: string | null
          expires_at?: string | null
          id?: string
          memory_type?: string
          metadata?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          agent_id?: string
          content?: string
          created_at?: string | null
          embedding?: string | null
          expires_at?: string | null
          id?: string
          memory_type?: string
          metadata?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_memories_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_pending_approvals: {
        Row: {
          action_payload: Json
          action_type: string
          expires_at: string | null
          id: string
          requested_at: string | null
          requested_by: string | null
          resolution: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          risk_level: string | null
          run_id: string | null
          step_id: string | null
        }
        Insert: {
          action_payload: Json
          action_type: string
          expires_at?: string | null
          id?: string
          requested_at?: string | null
          requested_by?: string | null
          resolution?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          risk_level?: string | null
          run_id?: string | null
          step_id?: string | null
        }
        Update: {
          action_payload?: Json
          action_type?: string
          expires_at?: string | null
          id?: string
          requested_at?: string | null
          requested_by?: string | null
          resolution?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          risk_level?: string | null
          run_id?: string | null
          step_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_pending_approvals_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "ai_agent_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_pending_approvals_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "agent_execution_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_session_memory: {
        Row: {
          access_count: number | null
          agent_id: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          importance_score: number | null
          last_accessed_at: string | null
          memory_key: string
          memory_type: string | null
          memory_value: Json
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          access_count?: number | null
          agent_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          importance_score?: number | null
          last_accessed_at?: string | null
          memory_key: string
          memory_type?: string | null
          memory_value: Json
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          access_count?: number | null
          agent_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          importance_score?: number | null
          last_accessed_at?: string | null
          memory_key?: string
          memory_type?: string | null
          memory_value?: Json
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_session_memory_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_tool_definitions: {
        Row: {
          agent_id: string | null
          avg_execution_time_ms: number | null
          created_at: string | null
          id: string
          is_enabled: boolean | null
          parameters_schema: Json
          requires_approval: boolean | null
          tool_category: string | null
          tool_description: string
          tool_name: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          agent_id?: string | null
          avg_execution_time_ms?: number | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          parameters_schema: Json
          requires_approval?: boolean | null
          tool_category?: string | null
          tool_description: string
          tool_name: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          agent_id?: string | null
          avg_execution_time_ms?: number | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          parameters_schema?: Json
          requires_approval?: boolean | null
          tool_category?: string | null
          tool_description?: string
          tool_name?: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_tool_definitions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agent_knowledge_selection: {
        Row: {
          agent_id: string
          category_id: string
          created_at: string | null
          id: string
          is_enabled: boolean | null
          priority: number | null
          updated_at: string | null
        }
        Insert: {
          agent_id: string
          category_id: string
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          priority?: number | null
          updated_at?: string | null
        }
        Update: {
          agent_id?: string
          category_id?: string
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          priority?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_agent_knowledge_selection_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_agent_knowledge_selection_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "knowledge_base_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agent_runs: {
        Row: {
          agent_id: string
          ai_summary: Json
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          business_context: string | null
          category: string | null
          completion_tokens: number | null
          cost_usd: number | null
          created_at: string | null
          error_message: string | null
          executed_by: string | null
          execution_context: Json | null
          execution_time_ms: number | null
          generated_tasks: Json | null
          id: string
          model_provider: string | null
          model_version: string | null
          prompt_tokens: number | null
          status: string | null
          tags: Json | null
          title: string | null
          total_tokens: number | null
        }
        Insert: {
          agent_id: string
          ai_summary?: Json
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          business_context?: string | null
          category?: string | null
          completion_tokens?: number | null
          cost_usd?: number | null
          created_at?: string | null
          error_message?: string | null
          executed_by?: string | null
          execution_context?: Json | null
          execution_time_ms?: number | null
          generated_tasks?: Json | null
          id?: string
          model_provider?: string | null
          model_version?: string | null
          prompt_tokens?: number | null
          status?: string | null
          tags?: Json | null
          title?: string | null
          total_tokens?: number | null
        }
        Update: {
          agent_id?: string
          ai_summary?: Json
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          business_context?: string | null
          category?: string | null
          completion_tokens?: number | null
          cost_usd?: number | null
          created_at?: string | null
          error_message?: string | null
          executed_by?: string | null
          execution_context?: Json | null
          execution_time_ms?: number | null
          generated_tasks?: Json | null
          id?: string
          model_provider?: string | null
          model_version?: string | null
          prompt_tokens?: number | null
          status?: string | null
          tags?: Json | null
          title?: string | null
          total_tokens?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_agent_runs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agents: {
        Row: {
          category: string
          config: Json | null
          created_at: string | null
          created_by: string | null
          data_sources: Json
          description: string | null
          id: string
          is_enabled: boolean | null
          name: string
          output_actions: Json | null
          required_role: Database["public"]["Enums"]["app_role"] | null
          schedule_config: Json | null
          scope: string | null
          slug: string
          system_prompt: string
          updated_at: string | null
        }
        Insert: {
          category: string
          config?: Json | null
          created_at?: string | null
          created_by?: string | null
          data_sources?: Json
          description?: string | null
          id?: string
          is_enabled?: boolean | null
          name: string
          output_actions?: Json | null
          required_role?: Database["public"]["Enums"]["app_role"] | null
          schedule_config?: Json | null
          scope?: string | null
          slug: string
          system_prompt: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          config?: Json | null
          created_at?: string | null
          created_by?: string | null
          data_sources?: Json
          description?: string | null
          id?: string
          is_enabled?: boolean | null
          name?: string
          output_actions?: Json | null
          required_role?: Database["public"]["Enums"]["app_role"] | null
          schedule_config?: Json | null
          scope?: string | null
          slug?: string
          system_prompt?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_configurations: {
        Row: {
          configuration_data: Json
          configuration_type: string
          created_at: string | null
          created_by: string | null
          id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          configuration_data?: Json
          configuration_type: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          configuration_data?: Json
          configuration_type?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      ai_generated_images: {
        Row: {
          aspect_ratio: string | null
          cost_cents: number | null
          created_at: string | null
          deleted_at: string | null
          edit_instruction: string | null
          error_details: Json | null
          error_message: string | null
          error_type: string | null
          expires_at: string | null
          generation_status: string | null
          generation_time_ms: number | null
          id: string
          image_hash: string | null
          image_url: string | null
          is_shared: boolean | null
          model_name: string | null
          override_by: string | null
          override_used: boolean | null
          parent_id: string | null
          prompt: string
          provider: string | null
          request_id: string | null
          safety_scores: Json | null
          shared_folder_id: string | null
          size: string | null
          status: string | null
          storage_bucket: string | null
          storage_path: string | null
          style: string | null
          synthid_embedded: boolean | null
          user_id: string
          version_number: number | null
        }
        Insert: {
          aspect_ratio?: string | null
          cost_cents?: number | null
          created_at?: string | null
          deleted_at?: string | null
          edit_instruction?: string | null
          error_details?: Json | null
          error_message?: string | null
          error_type?: string | null
          expires_at?: string | null
          generation_status?: string | null
          generation_time_ms?: number | null
          id?: string
          image_hash?: string | null
          image_url?: string | null
          is_shared?: boolean | null
          model_name?: string | null
          override_by?: string | null
          override_used?: boolean | null
          parent_id?: string | null
          prompt: string
          provider?: string | null
          request_id?: string | null
          safety_scores?: Json | null
          shared_folder_id?: string | null
          size?: string | null
          status?: string | null
          storage_bucket?: string | null
          storage_path?: string | null
          style?: string | null
          synthid_embedded?: boolean | null
          user_id: string
          version_number?: number | null
        }
        Update: {
          aspect_ratio?: string | null
          cost_cents?: number | null
          created_at?: string | null
          deleted_at?: string | null
          edit_instruction?: string | null
          error_details?: Json | null
          error_message?: string | null
          error_type?: string | null
          expires_at?: string | null
          generation_status?: string | null
          generation_time_ms?: number | null
          id?: string
          image_hash?: string | null
          image_url?: string | null
          is_shared?: boolean | null
          model_name?: string | null
          override_by?: string | null
          override_used?: boolean | null
          parent_id?: string | null
          prompt?: string
          provider?: string | null
          request_id?: string | null
          safety_scores?: Json | null
          shared_folder_id?: string | null
          size?: string | null
          status?: string | null
          storage_bucket?: string | null
          storage_path?: string | null
          style?: string | null
          synthid_embedded?: boolean | null
          user_id?: string
          version_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_generated_images_override_by_fkey"
            columns: ["override_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_generated_images_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "ai_generated_images"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_generated_images_shared_folder_id_fkey"
            columns: ["shared_folder_id"]
            isOneToOne: false
            referencedRelation: "image_shared_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_shared_resources: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          openai_resource_id: string
          resource_name: string
          resource_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          openai_resource_id: string
          resource_name: string
          resource_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          openai_resource_id?: string
          resource_name?: string
          resource_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      analytics_api_keys: {
        Row: {
          allowed_actions: string[] | null
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_name: string
          last_used_at: string | null
          rate_limit_per_minute: number | null
          updated_at: string | null
        }
        Insert: {
          allowed_actions?: string[] | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_name: string
          last_used_at?: string | null
          rate_limit_per_minute?: number | null
          updated_at?: string | null
        }
        Update: {
          allowed_actions?: string[] | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_name?: string
          last_used_at?: string | null
          rate_limit_per_minute?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      api_rate_limits: {
        Row: {
          api_key_hash: string
          created_at: string | null
          id: string
          request_count: number | null
          window_start: string
        }
        Insert: {
          api_key_hash: string
          created_at?: string | null
          id?: string
          request_count?: number | null
          window_start: string
        }
        Update: {
          api_key_hash?: string
          created_at?: string | null
          id?: string
          request_count?: number | null
          window_start?: string
        }
        Relationships: []
      }
      brand_analytics_data: {
        Row: {
          brand_id: string
          created_at: string | null
          data_type: string
          date_range_end: string
          date_range_start: string
          dimensions: Json | null
          id: string
          integration_id: string | null
          metrics: Json
          raw_data: Json | null
          received_at: string | null
        }
        Insert: {
          brand_id: string
          created_at?: string | null
          data_type: string
          date_range_end: string
          date_range_start: string
          dimensions?: Json | null
          id?: string
          integration_id?: string | null
          metrics: Json
          raw_data?: Json | null
          received_at?: string | null
        }
        Update: {
          brand_id?: string
          created_at?: string | null
          data_type?: string
          date_range_end?: string
          date_range_start?: string
          dimensions?: Json | null
          id?: string
          integration_id?: string | null
          metrics?: Json
          raw_data?: Json | null
          received_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_analytics_data_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_analytics_data_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "brand_analytics_integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_analytics_data_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "brand_analytics_integrations_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_analytics_integrations: {
        Row: {
          access_token_encrypted: string | null
          brand_id: string
          created_at: string | null
          created_by: string | null
          data_sources: Json | null
          ga4_property_id: string | null
          id: string
          integration_type: string
          is_active: boolean | null
          last_sync_at: string | null
          metadata: Json | null
          metrics_config: Json | null
          n8n_workflow_id: string | null
          refresh_token_encrypted: string | null
          service_account_email: string | null
          service_account_key_encrypted: string | null
          sync_frequency: string | null
          token_expires_at: string | null
          updated_at: string | null
          webhook_secret: string | null
          webhook_url: string
        }
        Insert: {
          access_token_encrypted?: string | null
          brand_id: string
          created_at?: string | null
          created_by?: string | null
          data_sources?: Json | null
          ga4_property_id?: string | null
          id?: string
          integration_type?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          metadata?: Json | null
          metrics_config?: Json | null
          n8n_workflow_id?: string | null
          refresh_token_encrypted?: string | null
          service_account_email?: string | null
          service_account_key_encrypted?: string | null
          sync_frequency?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          webhook_secret?: string | null
          webhook_url: string
        }
        Update: {
          access_token_encrypted?: string | null
          brand_id?: string
          created_at?: string | null
          created_by?: string | null
          data_sources?: Json | null
          ga4_property_id?: string | null
          id?: string
          integration_type?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          metadata?: Json | null
          metrics_config?: Json | null
          n8n_workflow_id?: string | null
          refresh_token_encrypted?: string | null
          service_account_email?: string | null
          service_account_key_encrypted?: string | null
          sync_frequency?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          webhook_secret?: string | null
          webhook_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_analytics_integrations_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_analytics_integrations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_file_comments: {
        Row: {
          comment: string
          created_at: string | null
          file_id: string
          id: string
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string | null
          file_id: string
          id?: string
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string | null
          file_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_file_comments_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "brand_knowledge_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_file_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_generated_posts: {
        Row: {
          brand_id: string
          extra_payload: Json | null
          generated_at: string | null
          id: string
          leader_id: string | null
          post_body: string
          post_title: string
          source_reference: string | null
          source_type: string
          updated_at: string | null
        }
        Insert: {
          brand_id: string
          extra_payload?: Json | null
          generated_at?: string | null
          id?: string
          leader_id?: string | null
          post_body: string
          post_title: string
          source_reference?: string | null
          source_type: string
          updated_at?: string | null
        }
        Update: {
          brand_id?: string
          extra_payload?: Json | null
          generated_at?: string | null
          id?: string
          leader_id?: string | null
          post_body?: string
          post_title?: string
          source_reference?: string | null
          source_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_generated_posts_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_generated_posts_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "thought_leaders"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_knowledge_embeddings: {
        Row: {
          brand_id: string
          chunk_index: number
          chunk_text: string
          created_at: string | null
          embedding: string | null
          file_id: string
          id: string
          metadata: Json | null
          updated_at: string | null
        }
        Insert: {
          brand_id: string
          chunk_index?: number
          chunk_text: string
          created_at?: string | null
          embedding?: string | null
          file_id: string
          id?: string
          metadata?: Json | null
          updated_at?: string | null
        }
        Update: {
          brand_id?: string
          chunk_index?: number
          chunk_text?: string
          created_at?: string | null
          embedding?: string | null
          file_id?: string
          id?: string
          metadata?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_knowledge_embeddings_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_knowledge_embeddings_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "knowledge_files"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_knowledge_files: {
        Row: {
          brand_id: string
          created_at: string | null
          embedding_count: number | null
          file_indexed_at: string | null
          file_name: string
          file_size: number | null
          file_summary: string | null
          file_type: string
          file_url: string
          id: string
          mime_type: string | null
          reindex_required: boolean | null
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          brand_id: string
          created_at?: string | null
          embedding_count?: number | null
          file_indexed_at?: string | null
          file_name: string
          file_size?: number | null
          file_summary?: string | null
          file_type?: string
          file_url: string
          id?: string
          mime_type?: string | null
          reindex_required?: boolean | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          brand_id?: string
          created_at?: string | null
          embedding_count?: number | null
          file_indexed_at?: string | null
          file_name?: string
          file_size?: number | null
          file_summary?: string | null
          file_type?: string
          file_url?: string
          id?: string
          mime_type?: string | null
          reindex_required?: boolean | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_knowledge_files_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_knowledge_files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_kpis: {
        Row: {
          brand_id: string
          created_at: string | null
          current_value: number
          description: string | null
          display_order: number | null
          id: string
          name: string
          source: string
          target_value: number | null
          type: string
          updated_at: string | null
        }
        Insert: {
          brand_id: string
          created_at?: string | null
          current_value?: number
          description?: string | null
          display_order?: number | null
          id?: string
          name: string
          source: string
          target_value?: number | null
          type: string
          updated_at?: string | null
        }
        Update: {
          brand_id?: string
          created_at?: string | null
          current_value?: number
          description?: string | null
          display_order?: number | null
          id?: string
          name?: string
          source?: string
          target_value?: number | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_kpis_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          active_integrations: string[] | null
          co_owner_id: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          monthly_budget: number | null
          name: string
          owner_id: string | null
          slug: string
          status: string
          team_members: string[] | null
          type: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          active_integrations?: string[] | null
          co_owner_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          monthly_budget?: number | null
          name: string
          owner_id?: string | null
          slug: string
          status?: string
          team_members?: string[] | null
          type?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          active_integrations?: string[] | null
          co_owner_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          monthly_budget?: number | null
          name?: string
          owner_id?: string | null
          slug?: string
          status?: string
          team_members?: string[] | null
          type?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brands_co_owner_id_fkey"
            columns: ["co_owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brands_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      client_communications: {
        Row: {
          client_id: string
          content: string | null
          created_at: string
          created_by: string
          direction: string
          id: string
          project_id: string | null
          subject: string | null
          type: string
        }
        Insert: {
          client_id: string
          content?: string | null
          created_at?: string
          created_by: string
          direction?: string
          id?: string
          project_id?: string | null
          subject?: string | null
          type?: string
        }
        Update: {
          client_id?: string
          content?: string | null
          created_at?: string
          created_by?: string
          direction?: string
          id?: string
          project_id?: string | null
          subject?: string | null
          type?: string
        }
        Relationships: []
      }
      client_testimonials: {
        Row: {
          approved_at: string | null
          assigned_to: string | null
          brand_id: string | null
          client_id: string | null
          client_name: string
          client_title: string | null
          company_name: string | null
          content: string | null
          created_at: string | null
          detected_from: string | null
          external_url: string | null
          id: string
          last_signal: string | null
          positive_signals: string[] | null
          project_id: string | null
          published_at: string | null
          received_at: string | null
          requested_at: string | null
          sentiment_score: number | null
          source_reference: string | null
          status: string
          type: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          approved_at?: string | null
          assigned_to?: string | null
          brand_id?: string | null
          client_id?: string | null
          client_name: string
          client_title?: string | null
          company_name?: string | null
          content?: string | null
          created_at?: string | null
          detected_from?: string | null
          external_url?: string | null
          id?: string
          last_signal?: string | null
          positive_signals?: string[] | null
          project_id?: string | null
          published_at?: string | null
          received_at?: string | null
          requested_at?: string | null
          sentiment_score?: number | null
          source_reference?: string | null
          status?: string
          type?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          approved_at?: string | null
          assigned_to?: string | null
          brand_id?: string | null
          client_id?: string | null
          client_name?: string
          client_title?: string | null
          company_name?: string | null
          content?: string | null
          created_at?: string | null
          detected_from?: string | null
          external_url?: string | null
          id?: string
          last_signal?: string | null
          positive_signals?: string[] | null
          project_id?: string | null
          published_at?: string | null
          received_at?: string | null
          requested_at?: string | null
          sentiment_score?: number | null
          source_reference?: string | null
          status?: string
          type?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_testimonials_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_testimonials_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_testimonials_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_testimonials_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      client_health_snapshots: {
        Row: {
          analyzed_at: string
          churn_probability: number
          churn_window_days: number | null
          client_id: string
          created_at: string
          explanation: string | null
          health_score: number
          heuristic_score: number | null
          id: string
          recommended_actions: Json | null
          recovery_plan: Json | null
          risk_band: string
          root_causes: Json | null
          signals: Json | null
          summary: string | null
        }
        Insert: {
          analyzed_at?: string
          churn_probability: number
          churn_window_days?: number | null
          client_id: string
          created_at?: string
          explanation?: string | null
          health_score: number
          heuristic_score?: number | null
          id?: string
          recommended_actions?: Json | null
          recovery_plan?: Json | null
          risk_band: string
          root_causes?: Json | null
          signals?: Json | null
          summary?: string | null
        }
        Update: {
          analyzed_at?: string
          churn_probability?: number
          churn_window_days?: number | null
          client_id?: string
          created_at?: string
          explanation?: string | null
          health_score?: number
          heuristic_score?: number | null
          id?: string
          recommended_actions?: Json | null
          recovery_plan?: Json | null
          risk_band?: string
          root_causes?: Json | null
          signals?: Json | null
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_health_snapshots_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          assigned_manager: string | null
          churn_risk_band: string | null
          city: string | null
          company: string | null
          company_revenue: number | null
          contact_person: string | null
          country: string | null
          created_at: string
          data_completeness_score: number | null
          email: string | null
          founded_year: number | null
          health_score: number | null
          hubspot_id: string | null
          hubspot_last_sync: string | null
          hubspot_sync_metadata: Json | null
          hubspot_sync_status: string | null
          id: string
          industry: string | null
          last_health_analysis_at: string | null
          monthly_billing: number | null
          name: string
          notes: string | null
          phone: string | null
          satisfaction_score: number | null
          source: string | null
          state: string | null
          status: string
          team_size: number | null
          total_revenue: number | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          assigned_manager?: string | null
          churn_risk_band?: string | null
          city?: string | null
          company?: string | null
          company_revenue?: number | null
          contact_person?: string | null
          country?: string | null
          created_at?: string
          data_completeness_score?: number | null
          email?: string | null
          founded_year?: number | null
          health_score?: number | null
          hubspot_id?: string | null
          hubspot_last_sync?: string | null
          hubspot_sync_metadata?: Json | null
          hubspot_sync_status?: string | null
          id?: string
          industry?: string | null
          last_health_analysis_at?: string | null
          monthly_billing?: number | null
          name: string
          notes?: string | null
          phone?: string | null
          satisfaction_score?: number | null
          source?: string | null
          state?: string | null
          status?: string
          team_size?: number | null
          total_revenue?: number | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          assigned_manager?: string | null
          churn_risk_band?: string | null
          city?: string | null
          company?: string | null
          company_revenue?: number | null
          contact_person?: string | null
          country?: string | null
          created_at?: string
          data_completeness_score?: number | null
          email?: string | null
          founded_year?: number | null
          health_score?: number | null
          hubspot_id?: string | null
          hubspot_last_sync?: string | null
          hubspot_sync_metadata?: Json | null
          hubspot_sync_status?: string | null
          id?: string
          industry?: string | null
          last_health_analysis_at?: string | null
          monthly_billing?: number | null
          name?: string
          notes?: string | null
          phone?: string | null
          satisfaction_score?: number | null
          source?: string | null
          state?: string | null
          status?: string
          team_size?: number | null
          total_revenue?: number | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      code_analysis_results: {
        Row: {
          analysis_type: string | null
          analyzed_at: string | null
          id: string
          repository_id: string | null
          results: Json | null
        }
        Insert: {
          analysis_type?: string | null
          analyzed_at?: string | null
          id?: string
          repository_id?: string | null
          results?: Json | null
        }
        Update: {
          analysis_type?: string | null
          analyzed_at?: string | null
          id?: string
          repository_id?: string | null
          results?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "code_analysis_results_repository_id_fkey"
            columns: ["repository_id"]
            isOneToOne: false
            referencedRelation: "code_repositories"
            referencedColumns: ["id"]
          },
        ]
      }
      code_generation_templates: {
        Row: {
          category: string | null
          created_at: string | null
          framework: string | null
          id: string
          language: string | null
          name: string
          template: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          framework?: string | null
          id?: string
          language?: string | null
          name: string
          template: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          framework?: string | null
          id?: string
          language?: string | null
          name?: string
          template?: string
        }
        Relationships: []
      }
      code_repositories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          platform: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          platform?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          platform?: string | null
          url?: string | null
        }
        Relationships: []
      }
      collabai_agents: {
        Row: {
          config: Json | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          client_id: string
          created_at: string
          email: string | null
          first_name: string | null
          hubspot_id: string | null
          hubspot_last_sync: string | null
          hubspot_sync_status: string | null
          id: string
          is_primary: boolean | null
          job_title: string | null
          last_name: string | null
          lead_status: string | null
          lifecycle_stage: string | null
          phone: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          email?: string | null
          first_name?: string | null
          hubspot_id?: string | null
          hubspot_last_sync?: string | null
          hubspot_sync_status?: string | null
          id?: string
          is_primary?: boolean | null
          job_title?: string | null
          last_name?: string | null
          lead_status?: string | null
          lifecycle_stage?: string | null
          phone?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          email?: string | null
          first_name?: string | null
          hubspot_id?: string | null
          hubspot_last_sync?: string | null
          hubspot_sync_status?: string | null
          id?: string
          is_primary?: boolean | null
          job_title?: string | null
          last_name?: string | null
          lead_status?: string | null
          lifecycle_stage?: string | null
          phone?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      content_performance_metrics: {
        Row: {
          audience: string | null
          comment_quality_score: number | null
          conversion_actions: number | null
          created_at: string | null
          engagement_score: number | null
          hook_style: string | null
          id: string
          impressions: number | null
          leader_id: string | null
          notes: string | null
          post_id: string | null
          post_type: string | null
          post_url: string | null
          posted_date: string | null
          reach_count: number | null
          updated_at: string | null
        }
        Insert: {
          audience?: string | null
          comment_quality_score?: number | null
          conversion_actions?: number | null
          created_at?: string | null
          engagement_score?: number | null
          hook_style?: string | null
          id?: string
          impressions?: number | null
          leader_id?: string | null
          notes?: string | null
          post_id?: string | null
          post_type?: string | null
          post_url?: string | null
          posted_date?: string | null
          reach_count?: number | null
          updated_at?: string | null
        }
        Update: {
          audience?: string | null
          comment_quality_score?: number | null
          conversion_actions?: number | null
          created_at?: string | null
          engagement_score?: number | null
          hook_style?: string | null
          id?: string
          impressions?: number | null
          leader_id?: string | null
          notes?: string | null
          post_id?: string | null
          post_type?: string | null
          post_url?: string | null
          posted_date?: string | null
          reach_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_performance_metrics_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "thought_leaders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_performance_metrics_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "generated_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      content_safety_reports: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          id: string
          image_id: string | null
          prompt: string
          reason: string | null
          report_type: string
          reviewed_at: string | null
          reviewer_id: string | null
          safety_ratings: Json | null
          status: string | null
          triggered_categories: Json | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          id?: string
          image_id?: string | null
          prompt: string
          reason?: string | null
          report_type: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          safety_ratings?: Json | null
          status?: string | null
          triggered_categories?: Json | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          id?: string
          image_id?: string | null
          prompt?: string
          reason?: string | null
          report_type?: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          safety_ratings?: Json | null
          status?: string | null
          triggered_categories?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_safety_reports_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "ai_generated_images"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_safety_reports_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_safety_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      control_tower_api_keys: {
        Row: {
          api_key_encrypted: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          key_name: string
          last_used_at: string | null
          rate_limit_per_hour: number | null
          scopes: string[]
          updated_at: string | null
        }
        Insert: {
          api_key_encrypted: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          key_name: string
          last_used_at?: string | null
          rate_limit_per_hour?: number | null
          scopes?: string[]
          updated_at?: string | null
        }
        Update: {
          api_key_encrypted?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          key_name?: string
          last_used_at?: string | null
          rate_limit_per_hour?: number | null
          scopes?: string[]
          updated_at?: string | null
        }
        Relationships: []
      }
      control_tower_sync_logs: {
        Row: {
          completed_at: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          records_failed: number | null
          records_fetched: number | null
          records_synced: number | null
          started_at: string | null
          status: string
          sync_type: string
          triggered_by: string | null
        }
        Insert: {
          completed_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          records_failed?: number | null
          records_fetched?: number | null
          records_synced?: number | null
          started_at?: string | null
          status?: string
          sync_type: string
          triggered_by?: string | null
        }
        Update: {
          completed_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          records_failed?: number | null
          records_fetched?: number | null
          records_synced?: number | null
          started_at?: string | null
          status?: string
          sync_type?: string
          triggered_by?: string | null
        }
        Relationships: []
      }
      daily_head_starts: {
        Row: {
          blockers: string | null
          created_at: string
          date: string
          goals: string | null
          id: string
          mood: string | null
          priorities: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          blockers?: string | null
          created_at?: string
          date?: string
          goals?: string | null
          id?: string
          mood?: string | null
          priorities?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          blockers?: string | null
          created_at?: string
          date?: string
          goals?: string | null
          id?: string
          mood?: string | null
          priorities?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_head_starts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          amount: number | null
          client_id: string
          close_date: string | null
          created_at: string
          deal_type: string | null
          hubspot_created_at: string | null
          hubspot_id: string | null
          hubspot_updated_at: string | null
          id: string
          name: string
          pipeline: string | null
          probability: number | null
          stage: string | null
          updated_at: string
        }
        Insert: {
          amount?: number | null
          client_id: string
          close_date?: string | null
          created_at?: string
          deal_type?: string | null
          hubspot_created_at?: string | null
          hubspot_id?: string | null
          hubspot_updated_at?: string | null
          id?: string
          name: string
          pipeline?: string | null
          probability?: number | null
          stage?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number | null
          client_id?: string
          close_date?: string | null
          created_at?: string
          deal_type?: string | null
          hubspot_created_at?: string | null
          hubspot_id?: string | null
          hubspot_updated_at?: string | null
          id?: string
          name?: string
          pipeline?: string | null
          probability?: number | null
          stage?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      documentation_output_config: {
        Row: {
          config_name: string
          created_at: string | null
          id: string
          output_format: string | null
          settings: Json | null
        }
        Insert: {
          config_name: string
          created_at?: string | null
          id?: string
          output_format?: string | null
          settings?: Json | null
        }
        Update: {
          config_name?: string
          created_at?: string | null
          id?: string
          output_format?: string | null
          settings?: Json | null
        }
        Relationships: []
      }
      documentation_repository_links: {
        Row: {
          created_at: string | null
          documentation_url: string | null
          id: string
          link_type: string | null
          repository_id: string | null
        }
        Insert: {
          created_at?: string | null
          documentation_url?: string | null
          id?: string
          link_type?: string | null
          repository_id?: string | null
        }
        Update: {
          created_at?: string | null
          documentation_url?: string | null
          id?: string
          link_type?: string | null
          repository_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documentation_repository_links_repository_id_fkey"
            columns: ["repository_id"]
            isOneToOne: false
            referencedRelation: "code_repositories"
            referencedColumns: ["id"]
          },
        ]
      }
      documentation_rules: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          rule: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          rule: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          rule?: string
        }
        Relationships: []
      }
      documentation_templates: {
        Row: {
          category: string | null
          created_at: string | null
          doc_category: string | null
          id: string
          is_active: boolean | null
          name: string
          output_format: string | null
          sections_template: Json | null
          system_prompt: string | null
          template: string
          template_name: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          doc_category?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          output_format?: string | null
          sections_template?: Json | null
          system_prompt?: string | null
          template: string
          template_name?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          doc_category?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          output_format?: string | null
          sections_template?: Json | null
          system_prompt?: string | null
          template?: string
          template_name?: string | null
        }
        Relationships: []
      }
      email_notifications_log: {
        Row: {
          email_type: string
          error_message: string | null
          id: string
          metadata: Json | null
          recipient_email: string
          recipient_user_id: string | null
          sent_at: string
          status: string
          subject: string
        }
        Insert: {
          email_type: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          recipient_email: string
          recipient_user_id?: string | null
          sent_at?: string
          status?: string
          subject: string
        }
        Update: {
          email_type?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          recipient_email?: string
          recipient_user_id?: string | null
          sent_at?: string
          status?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_notifications_log_recipient_user_id_fkey"
            columns: ["recipient_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_user_mapping: {
        Row: {
          employee_id: string
          id: string
          linked_at: string | null
          user_id: string
        }
        Insert: {
          employee_id: string
          id?: string
          linked_at?: string | null
          user_id: string
        }
        Update: {
          employee_id?: string
          id?: string
          linked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_user_mapping_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_user_mapping_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          api_metadata: Json | null
          created_at: string | null
          department: string | null
          email: string
          employee_id: string
          first_name: string
          id: string
          is_active: boolean | null
          job_title: string | null
          last_name: string
          office_location: string | null
          phone: string | null
          synced_at: string | null
          updated_at: string | null
        }
        Insert: {
          api_metadata?: Json | null
          created_at?: string | null
          department?: string | null
          email: string
          employee_id: string
          first_name: string
          id?: string
          is_active?: boolean | null
          job_title?: string | null
          last_name: string
          office_location?: string | null
          phone?: string | null
          synced_at?: string | null
          updated_at?: string | null
        }
        Update: {
          api_metadata?: Json | null
          created_at?: string | null
          department?: string | null
          email?: string
          employee_id?: string
          first_name?: string
          id?: string
          is_active?: boolean | null
          job_title?: string | null
          last_name?: string
          office_location?: string | null
          phone?: string | null
          synced_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      estimate_items: {
        Row: {
          base_price: number
          created_at: string | null
          effort_hours: number
          estimate_id: string | null
          final_price: number
          id: string
          quantity: number
          requirements_html: string | null
          service_id: string | null
          service_name: string
          sort_order: number | null
        }
        Insert: {
          base_price?: number
          created_at?: string | null
          effort_hours?: number
          estimate_id?: string | null
          final_price?: number
          id?: string
          quantity?: number
          requirements_html?: string | null
          service_id?: string | null
          service_name: string
          sort_order?: number | null
        }
        Update: {
          base_price?: number
          created_at?: string | null
          effort_hours?: number
          estimate_id?: string | null
          final_price?: number
          id?: string
          quantity?: number
          requirements_html?: string | null
          service_id?: string | null
          service_name?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "estimate_items_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimate_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      estimates: {
        Row: {
          billing_type: string | null
          client_name: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_template: boolean | null
          notes: string | null
          project_name: string
          status: string | null
          template_name: string | null
          total_hours: number | null
          total_price: number | null
          updated_at: string | null
        }
        Insert: {
          billing_type?: string | null
          client_name?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_template?: boolean | null
          notes?: string | null
          project_name: string
          status?: string | null
          template_name?: string | null
          total_hours?: number | null
          total_price?: number | null
          updated_at?: string | null
        }
        Update: {
          billing_type?: string | null
          client_name?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_template?: boolean | null
          notes?: string | null
          project_name?: string
          status?: string | null
          template_name?: string | null
          total_hours?: number | null
          total_price?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      feedback_comments: {
        Row: {
          comment: string
          created_at: string
          feedback_id: string
          id: string
          user_id: string | null
        }
        Insert: {
          comment: string
          created_at?: string
          feedback_id: string
          id?: string
          user_id?: string | null
        }
        Update: {
          comment?: string
          created_at?: string
          feedback_id?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_comments_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "feedback_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_reports: {
        Row: {
          attachment_url: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string
          email: string | null
          feedback_number: number
          id: string
          module: string | null
          priority: string | null
          reviewed_by: string | null
          status: string
          subject: string
          submitted_by: string | null
          type: string
          updated_at: string
          upvotes: number
          user_id: string | null
        }
        Insert: {
          attachment_url?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description: string
          email?: string | null
          feedback_number?: number
          id?: string
          module?: string | null
          priority?: string | null
          reviewed_by?: string | null
          status?: string
          subject: string
          submitted_by?: string | null
          type: string
          updated_at?: string
          upvotes?: number
          user_id?: string | null
        }
        Update: {
          attachment_url?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string
          email?: string | null
          feedback_number?: number
          id?: string
          module?: string | null
          priority?: string | null
          reviewed_by?: string | null
          status?: string
          subject?: string
          submitted_by?: string | null
          type?: string
          updated_at?: string
          upvotes?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_reports_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_upvotes: {
        Row: {
          created_at: string
          feedback_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          feedback_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_upvotes_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "feedback_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_upvotes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      gemini_videos: {
        Row: {
          aspect_ratio: string | null
          completed_at: string | null
          created_at: string | null
          duration: number | null
          error: Json | null
          has_audio: boolean | null
          id: string
          metadata: Json | null
          negative_prompt: string | null
          operation_name: string
          prompt: string
          resolution: string | null
          status: string
          thumbnail_url: string | null
          user_id: string | null
          video_url: string | null
        }
        Insert: {
          aspect_ratio?: string | null
          completed_at?: string | null
          created_at?: string | null
          duration?: number | null
          error?: Json | null
          has_audio?: boolean | null
          id: string
          metadata?: Json | null
          negative_prompt?: string | null
          operation_name: string
          prompt: string
          resolution?: string | null
          status?: string
          thumbnail_url?: string | null
          user_id?: string | null
          video_url?: string | null
        }
        Update: {
          aspect_ratio?: string | null
          completed_at?: string | null
          created_at?: string | null
          duration?: number | null
          error?: Json | null
          has_audio?: boolean | null
          id?: string
          metadata?: Json | null
          negative_prompt?: string | null
          operation_name?: string
          prompt?: string
          resolution?: string | null
          status?: string
          thumbnail_url?: string | null
          user_id?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      generated_posts: {
        Row: {
          extra_payload: Json
          generated_at: string
          id: string
          leader_id: string
          linkedin_post_url: string | null
          post_body: string
          post_title: string
          post_type: string | null
          published_at: string | null
          scheduled_for: string | null
          source_reference: string | null
          source_type: Database["public"]["Enums"]["linkedin_post_source"]
          status: string | null
          updated_at: string
        }
        Insert: {
          extra_payload?: Json
          generated_at?: string
          id?: string
          leader_id: string
          linkedin_post_url?: string | null
          post_body: string
          post_title: string
          post_type?: string | null
          published_at?: string | null
          scheduled_for?: string | null
          source_reference?: string | null
          source_type?: Database["public"]["Enums"]["linkedin_post_source"]
          status?: string | null
          updated_at?: string
        }
        Update: {
          extra_payload?: Json
          generated_at?: string
          id?: string
          leader_id?: string
          linkedin_post_url?: string | null
          post_body?: string
          post_title?: string
          post_type?: string | null
          published_at?: string | null
          scheduled_for?: string | null
          source_reference?: string | null
          source_type?: Database["public"]["Enums"]["linkedin_post_source"]
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_posts_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "thought_leaders"
            referencedColumns: ["id"]
          },
        ]
      }
      gohighlevel_contacts: {
        Row: {
          contact_id: string
          created_at: string | null
          email: string | null
          id: string
          integration_id: string
          name: string | null
          phone: string | null
          status: string | null
        }
        Insert: {
          contact_id: string
          created_at?: string | null
          email?: string | null
          id?: string
          integration_id: string
          name?: string | null
          phone?: string | null
          status?: string | null
        }
        Update: {
          contact_id?: string
          created_at?: string | null
          email?: string | null
          id?: string
          integration_id?: string
          name?: string | null
          phone?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gohighlevel_contacts_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "gohighlevel_integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gohighlevel_contacts_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "gohighlevel_integrations_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      gohighlevel_integrations: {
        Row: {
          api_key_encrypted: string
          created_at: string | null
          id: string
          is_active: boolean | null
          location_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          api_key_encrypted: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          location_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          api_key_encrypted?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          location_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_ghl_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      google_drive_settings: {
        Row: {
          created_at: string | null
          id: string
          service_account_json: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          service_account_json: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          service_account_json?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      hackathon_events: {
        Row: {
          allow_individual_participation: boolean | null
          auto_team_assignment: boolean | null
          created_at: string | null
          created_by: string | null
          demo_day: string | null
          description: string | null
          domains: Json | null
          end_date: string
          id: string
          location: string | null
          rules: string | null
          start_date: string
          status: string | null
          team_size_max: number | null
          team_size_min: number | null
          theme: string | null
          title: string
          updated_at: string | null
          winner_announcement_date: string | null
        }
        Insert: {
          allow_individual_participation?: boolean | null
          auto_team_assignment?: boolean | null
          created_at?: string | null
          created_by?: string | null
          demo_day?: string | null
          description?: string | null
          domains?: Json | null
          end_date: string
          id?: string
          location?: string | null
          rules?: string | null
          start_date: string
          status?: string | null
          team_size_max?: number | null
          team_size_min?: number | null
          theme?: string | null
          title: string
          updated_at?: string | null
          winner_announcement_date?: string | null
        }
        Update: {
          allow_individual_participation?: boolean | null
          auto_team_assignment?: boolean | null
          created_at?: string | null
          created_by?: string | null
          demo_day?: string | null
          description?: string | null
          domains?: Json | null
          end_date?: string
          id?: string
          location?: string | null
          rules?: string | null
          start_date?: string
          status?: string | null
          team_size_max?: number | null
          team_size_min?: number | null
          theme?: string | null
          title?: string
          updated_at?: string | null
          winner_announcement_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hackathon_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      hackathon_judges: {
        Row: {
          assigned_at: string | null
          event_id: string
          expertise_domains: Json | null
          id: string
          judge_name: string
          judge_title: string | null
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          event_id: string
          expertise_domains?: Json | null
          id?: string
          judge_name: string
          judge_title?: string | null
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          event_id?: string
          expertise_domains?: Json | null
          id?: string
          judge_name?: string
          judge_title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hackathon_judges_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "hackathon_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hackathon_judges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      hackathon_participants: {
        Row: {
          employee_id: string
          event_id: string
          id: string
          preferred_domains: Json | null
          preferred_role: string | null
          registered_at: string | null
          skills: Json | null
          status: string | null
          team_id: string | null
          user_id: string | null
        }
        Insert: {
          employee_id: string
          event_id: string
          id?: string
          preferred_domains?: Json | null
          preferred_role?: string | null
          registered_at?: string | null
          skills?: Json | null
          status?: string | null
          team_id?: string | null
          user_id?: string | null
        }
        Update: {
          employee_id?: string
          event_id?: string
          id?: string
          preferred_domains?: Json | null
          preferred_role?: string | null
          registered_at?: string | null
          skills?: Json | null
          status?: string | null
          team_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hackathon_participants_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hackathon_participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "hackathon_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hackathon_participants_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "hackathon_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hackathon_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      hackathon_scores: {
        Row: {
          comments: string | null
          decision: string | null
          execution_score: number | null
          id: string
          impact_score: number | null
          innovation_score: number | null
          judge_id: string
          presentation_score: number | null
          scored_at: string | null
          submission_id: string
          technical_score: number | null
          total_score: number | null
          usefulness_score: number | null
        }
        Insert: {
          comments?: string | null
          decision?: string | null
          execution_score?: number | null
          id?: string
          impact_score?: number | null
          innovation_score?: number | null
          judge_id: string
          presentation_score?: number | null
          scored_at?: string | null
          submission_id: string
          technical_score?: number | null
          total_score?: number | null
          usefulness_score?: number | null
        }
        Update: {
          comments?: string | null
          decision?: string | null
          execution_score?: number | null
          id?: string
          impact_score?: number | null
          innovation_score?: number | null
          judge_id?: string
          presentation_score?: number | null
          scored_at?: string | null
          submission_id?: string
          technical_score?: number | null
          total_score?: number | null
          usefulness_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hackathon_scores_judge_id_fkey"
            columns: ["judge_id"]
            isOneToOne: false
            referencedRelation: "hackathon_judges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hackathon_scores_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "hackathon_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      hackathon_submissions: {
        Row: {
          core_features: Json | null
          created_at: string | null
          event_id: string
          github_url: string | null
          id: string
          live_demo_url: string | null
          problem_statement: string
          slide_url: string | null
          solution_summary: string
          status: string | null
          submitted_at: string | null
          team_id: string
          tech_stack: Json | null
          updated_at: string | null
          video_demo_url: string | null
        }
        Insert: {
          core_features?: Json | null
          created_at?: string | null
          event_id: string
          github_url?: string | null
          id?: string
          live_demo_url?: string | null
          problem_statement: string
          slide_url?: string | null
          solution_summary: string
          status?: string | null
          submitted_at?: string | null
          team_id: string
          tech_stack?: Json | null
          updated_at?: string | null
          video_demo_url?: string | null
        }
        Update: {
          core_features?: Json | null
          created_at?: string | null
          event_id?: string
          github_url?: string | null
          id?: string
          live_demo_url?: string | null
          problem_statement?: string
          slide_url?: string | null
          solution_summary?: string
          status?: string | null
          submitted_at?: string | null
          team_id?: string
          tech_stack?: Json | null
          updated_at?: string | null
          video_demo_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hackathon_submissions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "hackathon_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hackathon_submissions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "hackathon_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      hackathon_team_members: {
        Row: {
          id: string
          joined_at: string | null
          participant_id: string
          role: string | null
          team_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          participant_id: string
          role?: string | null
          team_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          participant_id?: string
          role?: string | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hackathon_team_members_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "hackathon_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hackathon_team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "hackathon_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      hackathon_teams: {
        Row: {
          award: string | null
          created_at: string | null
          domain: string
          event_id: string
          final_rank: number | null
          final_score: number | null
          id: string
          status: string | null
          team_lead_id: string
          team_name: string
          updated_at: string | null
        }
        Insert: {
          award?: string | null
          created_at?: string | null
          domain: string
          event_id: string
          final_rank?: number | null
          final_score?: number | null
          id?: string
          status?: string | null
          team_lead_id: string
          team_name: string
          updated_at?: string | null
        }
        Update: {
          award?: string | null
          created_at?: string | null
          domain?: string
          event_id?: string
          final_rank?: number | null
          final_score?: number | null
          id?: string
          status?: string | null
          team_lead_id?: string
          team_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hackathon_teams_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "hackathon_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hackathon_teams_team_lead_id_fkey"
            columns: ["team_lead_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_section_generation_logs: {
        Row: {
          attempt_number: number
          completion_tokens: number | null
          cost_usd: number | null
          created_at: string | null
          error_message: string | null
          execution_time_ms: number | null
          hero_generation_id: string
          id: string
          input_data: Json | null
          model_used: string | null
          output_data: Json | null
          prompt_tokens: number | null
          status: string | null
          step_name: string
          step_number: number
          tokens_used: number | null
        }
        Insert: {
          attempt_number: number
          completion_tokens?: number | null
          cost_usd?: number | null
          created_at?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          hero_generation_id: string
          id?: string
          input_data?: Json | null
          model_used?: string | null
          output_data?: Json | null
          prompt_tokens?: number | null
          status?: string | null
          step_name: string
          step_number: number
          tokens_used?: number | null
        }
        Update: {
          attempt_number?: number
          completion_tokens?: number | null
          cost_usd?: number | null
          created_at?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          hero_generation_id?: string
          id?: string
          input_data?: Json | null
          model_used?: string | null
          output_data?: Json | null
          prompt_tokens?: number | null
          status?: string | null
          step_name?: string
          step_number?: number
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hero_section_generation_logs_hero_generation_id_fkey"
            columns: ["hero_generation_id"]
            isOneToOne: false
            referencedRelation: "hero_section_generations"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_section_generations: {
        Row: {
          additional_context: string | null
          agent_run_id: string | null
          attention_span: string | null
          audience: string
          audience_type: string | null
          awareness_level: string | null
          benefit_strength_score: number | null
          brand_context_used: string | null
          brand_id: string
          brand_tone: string | null
          buying_intent: string | null
          clarity_score: number | null
          completion_tokens: number | null
          confidence_score: number | null
          cost_usd: number | null
          created_at: string | null
          error_message: string | null
          evaluation_feedback: Json | null
          generation_attempts: number | null
          generation_time_ms: number | null
          goal: string
          headline: string
          id: string
          industry: string
          llm_model_evaluation: string | null
          llm_model_generation: string | null
          price_point: string | null
          primary_cta: string
          product_service: string
          prompt_tokens: number | null
          secondary_line: string | null
          specificity_score: number | null
          status: string | null
          strategy_reasoning: string | null
          strategy_used: string
          subheadline: string
          total_tokens_used: number | null
          traffic_source: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          additional_context?: string | null
          agent_run_id?: string | null
          attention_span?: string | null
          audience: string
          audience_type?: string | null
          awareness_level?: string | null
          benefit_strength_score?: number | null
          brand_context_used?: string | null
          brand_id: string
          brand_tone?: string | null
          buying_intent?: string | null
          clarity_score?: number | null
          completion_tokens?: number | null
          confidence_score?: number | null
          cost_usd?: number | null
          created_at?: string | null
          error_message?: string | null
          evaluation_feedback?: Json | null
          generation_attempts?: number | null
          generation_time_ms?: number | null
          goal: string
          headline: string
          id?: string
          industry: string
          llm_model_evaluation?: string | null
          llm_model_generation?: string | null
          price_point?: string | null
          primary_cta: string
          product_service: string
          prompt_tokens?: number | null
          secondary_line?: string | null
          specificity_score?: number | null
          status?: string | null
          strategy_reasoning?: string | null
          strategy_used: string
          subheadline: string
          total_tokens_used?: number | null
          traffic_source?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          additional_context?: string | null
          agent_run_id?: string | null
          attention_span?: string | null
          audience?: string
          audience_type?: string | null
          awareness_level?: string | null
          benefit_strength_score?: number | null
          brand_context_used?: string | null
          brand_id?: string
          brand_tone?: string | null
          buying_intent?: string | null
          clarity_score?: number | null
          completion_tokens?: number | null
          confidence_score?: number | null
          cost_usd?: number | null
          created_at?: string | null
          error_message?: string | null
          evaluation_feedback?: Json | null
          generation_attempts?: number | null
          generation_time_ms?: number | null
          goal?: string
          headline?: string
          id?: string
          industry?: string
          llm_model_evaluation?: string | null
          llm_model_generation?: string | null
          price_point?: string | null
          primary_cta?: string
          product_service?: string
          prompt_tokens?: number | null
          secondary_line?: string | null
          specificity_score?: number | null
          status?: string | null
          strategy_reasoning?: string | null
          strategy_used?: string
          subheadline?: string
          total_tokens_used?: number | null
          traffic_source?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hero_section_generations_agent_run_id_fkey"
            columns: ["agent_run_id"]
            isOneToOne: false
            referencedRelation: "ai_agent_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_section_generations_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      image_aspect_ratios: {
        Row: {
          cost_multiplier: number | null
          created_at: string | null
          display_label: string
          height: number
          icon_name: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          width: number
        }
        Insert: {
          cost_multiplier?: number | null
          created_at?: string | null
          display_label: string
          height: number
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          width: number
        }
        Update: {
          cost_multiplier?: number | null
          created_at?: string | null
          display_label?: string
          height?: number
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          width?: number
        }
        Relationships: []
      }
      image_generation_stats: {
        Row: {
          avg_generation_time_ms: number | null
          blocked_generations: number | null
          computed_at: string | null
          date: string
          failed_generations: number | null
          id: string
          model_name: string | null
          successful_generations: number | null
          total_cost_cents: number | null
          total_generations: number | null
          user_id: string | null
        }
        Insert: {
          avg_generation_time_ms?: number | null
          blocked_generations?: number | null
          computed_at?: string | null
          date: string
          failed_generations?: number | null
          id?: string
          model_name?: string | null
          successful_generations?: number | null
          total_cost_cents?: number | null
          total_generations?: number | null
          user_id?: string | null
        }
        Update: {
          avg_generation_time_ms?: number | null
          blocked_generations?: number | null
          computed_at?: string | null
          date?: string
          failed_generations?: number | null
          id?: string
          model_name?: string | null
          successful_generations?: number | null
          total_cost_cents?: number | null
          total_generations?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "image_generation_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      image_prompt_templates: {
        Row: {
          avg_success_rate: number | null
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          prompt_template: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          avg_success_rate?: number | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          prompt_template: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          avg_success_rate?: number | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          prompt_template?: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "image_prompt_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      image_safety_blocks: {
        Row: {
          admin_notes: string | null
          admin_status: string | null
          appealed_at: string | null
          blocked_categories: Json
          created_at: string | null
          id: string
          image_id: string | null
          override_at: string | null
          override_by: string | null
          prompt: string
          safety_scores: Json | null
          user_appeal_reason: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          admin_status?: string | null
          appealed_at?: string | null
          blocked_categories: Json
          created_at?: string | null
          id?: string
          image_id?: string | null
          override_at?: string | null
          override_by?: string | null
          prompt: string
          safety_scores?: Json | null
          user_appeal_reason?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          admin_status?: string | null
          appealed_at?: string | null
          blocked_categories?: Json
          created_at?: string | null
          id?: string
          image_id?: string | null
          override_at?: string | null
          override_by?: string | null
          prompt?: string
          safety_scores?: Json | null
          user_appeal_reason?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "image_safety_blocks_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "ai_generated_images"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "image_safety_blocks_override_by_fkey"
            columns: ["override_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "image_safety_blocks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      image_shared_folders: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          team_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          team_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          team_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "image_shared_folders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      image_style_presets: {
        Row: {
          avg_success_rate: number | null
          category: string | null
          created_at: string | null
          description: string | null
          display_name: string
          id: string
          is_active: boolean | null
          name: string
          prompt_modifier: string | null
          sort_order: number | null
          thumbnail_url: string | null
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          avg_success_rate?: number | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          name: string
          prompt_modifier?: string | null
          sort_order?: number | null
          thumbnail_url?: string | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          avg_success_rate?: number | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          name?: string
          prompt_modifier?: string | null
          sort_order?: number | null
          thumbnail_url?: string | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      image_user_quotas: {
        Row: {
          created_at: string | null
          current_daily_count: number | null
          current_monthly_cost_cents: number | null
          daily_limit: number | null
          has_unlimited: boolean | null
          id: string
          last_monthly_reset: string | null
          last_reset_date: string | null
          monthly_cost_limit_cents: number | null
          override_at: string | null
          override_by: string | null
          override_reason: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_daily_count?: number | null
          current_monthly_cost_cents?: number | null
          daily_limit?: number | null
          has_unlimited?: boolean | null
          id?: string
          last_monthly_reset?: string | null
          last_reset_date?: string | null
          monthly_cost_limit_cents?: number | null
          override_at?: string | null
          override_by?: string | null
          override_reason?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_daily_count?: number | null
          current_monthly_cost_cents?: number | null
          daily_limit?: number | null
          has_unlimited?: boolean | null
          id?: string
          last_monthly_reset?: string | null
          last_reset_date?: string | null
          monthly_cost_limit_cents?: number | null
          override_at?: string | null
          override_by?: string | null
          override_reason?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "image_user_quotas_override_by_fkey"
            columns: ["override_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "image_user_quotas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      influencer_style_library: {
        Row: {
          created_at: string | null
          document_url: string | null
          id: string
          influencer_name: string
          is_active: boolean | null
          key_characteristics: Json | null
          platform: string | null
          sample_posts: string[] | null
          style_description: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          document_url?: string | null
          id?: string
          influencer_name: string
          is_active?: boolean | null
          key_characteristics?: Json | null
          platform?: string | null
          sample_posts?: string[] | null
          style_description?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          document_url?: string | null
          id?: string
          influencer_name?: string
          is_active?: boolean | null
          key_characteristics?: Json | null
          platform?: string | null
          sample_posts?: string[] | null
          style_description?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      integration_logs: {
        Row: {
          action: string
          created_at: string
          error_message: string | null
          execution_time_ms: number | null
          id: string
          integration_type: string
          performed_by: string | null
          request_payload: Json
          response_data: Json | null
          status: string
        }
        Insert: {
          action: string
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          integration_type: string
          performed_by?: string | null
          request_payload?: Json
          response_data?: Json | null
          status: string
        }
        Update: {
          action?: string
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          integration_type?: string
          performed_by?: string | null
          request_payload?: Json
          response_data?: Json | null
          status?: string
        }
        Relationships: []
      }
      keyword_blog_usage: {
        Row: {
          blog_id: string
          created_at: string | null
          id: string
          keyword_id: string
          keyword_type: string
        }
        Insert: {
          blog_id: string
          created_at?: string | null
          id?: string
          keyword_id: string
          keyword_type: string
        }
        Update: {
          blog_id?: string
          created_at?: string | null
          id?: string
          keyword_id?: string
          keyword_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "keyword_blog_usage_blog_id_fkey"
            columns: ["blog_id"]
            isOneToOne: false
            referencedRelation: "seo_blog_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "keyword_blog_usage_keyword_id_fkey"
            columns: ["keyword_id"]
            isOneToOne: false
            referencedRelation: "keyword_research"
            referencedColumns: ["id"]
          },
        ]
      }
      keyword_ranking_history: {
        Row: {
          checked_at: string | null
          id: string
          keyword_id: string
          page_url: string | null
          rank: number
          search_volume: number | null
        }
        Insert: {
          checked_at?: string | null
          id?: string
          keyword_id: string
          page_url?: string | null
          rank: number
          search_volume?: number | null
        }
        Update: {
          checked_at?: string | null
          id?: string
          keyword_id?: string
          page_url?: string | null
          rank?: number
          search_volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "keyword_ranking_history_keyword_id_fkey"
            columns: ["keyword_id"]
            isOneToOne: false
            referencedRelation: "keyword_research"
            referencedColumns: ["id"]
          },
        ]
      }
      keyword_research: {
        Row: {
          brand_id: string
          competition: string | null
          created_at: string | null
          current_rank: number | null
          difficulty_score: number | null
          id: string
          keyword: string
          keyword_normalized: string
          last_checked_at: string | null
          last_used_in_blog: string | null
          notes: string | null
          priority: string | null
          search_volume: number | null
          status: string | null
          tags: string[] | null
          target_rank: number | null
          updated_at: string | null
          used_in_blog_count: number | null
          user_id: string
        }
        Insert: {
          brand_id: string
          competition?: string | null
          created_at?: string | null
          current_rank?: number | null
          difficulty_score?: number | null
          id?: string
          keyword: string
          keyword_normalized: string
          last_checked_at?: string | null
          last_used_in_blog?: string | null
          notes?: string | null
          priority?: string | null
          search_volume?: number | null
          status?: string | null
          tags?: string[] | null
          target_rank?: number | null
          updated_at?: string | null
          used_in_blog_count?: number | null
          user_id: string
        }
        Update: {
          brand_id?: string
          competition?: string | null
          created_at?: string | null
          current_rank?: number | null
          difficulty_score?: number | null
          id?: string
          keyword?: string
          keyword_normalized?: string
          last_checked_at?: string | null
          last_used_in_blog?: string | null
          notes?: string | null
          priority?: string | null
          search_volume?: number | null
          status?: string | null
          tags?: string[] | null
          target_rank?: number | null
          updated_at?: string | null
          used_in_blog_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "keyword_research_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      keyword_suggestions: {
        Row: {
          brand_id: string
          created_at: string | null
          expires_at: string | null
          id: string
          model_used: string | null
          prompt_used: string | null
          seed_keyword: string
          suggestions: Json
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          brand_id: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          model_used?: string | null
          prompt_used?: string | null
          seed_keyword: string
          suggestions: Json
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          brand_id?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          model_used?: string | null
          prompt_used?: string | null
          seed_keyword?: string
          suggestions?: Json
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "keyword_suggestions_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_base: {
        Row: {
          content: string
          created_at: string | null
          effective_date: string | null
          id: string
          is_active: boolean | null
          keywords: string[] | null
          knowledge_type: string
          migrated_to_file_id: string | null
          title: string
          updated_at: string | null
          updated_by: string | null
          version: number | null
        }
        Insert: {
          content: string
          created_at?: string | null
          effective_date?: string | null
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          knowledge_type: string
          migrated_to_file_id?: string | null
          title: string
          updated_at?: string | null
          updated_by?: string | null
          version?: number | null
        }
        Update: {
          content?: string
          created_at?: string | null
          effective_date?: string | null
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          knowledge_type?: string
          migrated_to_file_id?: string | null
          title?: string
          updated_at?: string | null
          updated_by?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "company_knowledge_base_migrated_to_file_id_fkey"
            columns: ["migrated_to_file_id"]
            isOneToOne: false
            referencedRelation: "knowledge_files"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_base_categories: {
        Row: {
          brand_id: string | null
          description: string | null
          id: string
          inserted_at: string
          is_active: boolean | null
          last_synced: string | null
          name: string
          scope: string | null
          updated_at: string
        }
        Insert: {
          brand_id?: string | null
          description?: string | null
          id?: string
          inserted_at?: string
          is_active?: boolean | null
          last_synced?: string | null
          name: string
          scope?: string | null
          updated_at?: string
        }
        Update: {
          brand_id?: string | null
          description?: string | null
          id?: string
          inserted_at?: string
          is_active?: boolean | null
          last_synced?: string | null
          name?: string
          scope?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_base_categories_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_base_files: {
        Row: {
          created_at: string | null
          file_name: string
          file_size: number | null
          id: string
          knowledge_id: string | null
          knowledge_type: string
          openai_file_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_size?: number | null
          id?: string
          knowledge_id?: string | null
          knowledge_type: string
          openai_file_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_size?: number | null
          id?: string
          knowledge_id?: string | null
          knowledge_type?: string
          openai_file_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_knowledge_files_knowledge_id_fkey"
            columns: ["knowledge_id"]
            isOneToOne: false
            referencedRelation: "knowledge_base"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_embeddings: {
        Row: {
          category_id: string
          chunk_index: number | null
          content: string | null
          content_hash: string | null
          created_at: string
          embedding: string
          file_id: string
          id: string
          indexed_at: string | null
          metadata: Json | null
          total_chunks: number | null
        }
        Insert: {
          category_id: string
          chunk_index?: number | null
          content?: string | null
          content_hash?: string | null
          created_at?: string
          embedding: string
          file_id: string
          id?: string
          indexed_at?: string | null
          metadata?: Json | null
          total_chunks?: number | null
        }
        Update: {
          category_id?: string
          chunk_index?: number | null
          content?: string | null
          content_hash?: string | null
          created_at?: string
          embedding?: string
          file_id?: string
          id?: string
          indexed_at?: string | null
          metadata?: Json | null
          total_chunks?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_embeddings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "knowledge_base_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_embeddings_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "knowledge_files"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_files: {
        Row: {
          brand_id: string | null
          created_at: string | null
          embedding_count: number | null
          error_timestamp: string | null
          file_type: string | null
          id: string
          inserted_at: string
          is_indexed: boolean | null
          last_error: string | null
          last_indexed: string | null
          metadata: Json | null
          name: string
          path: string | null
          processing_status:
            | Database["public"]["Enums"]["processing_status"]
            | null
          reindex_required: boolean | null
          retry_count: number | null
          source_id: string | null
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          brand_id?: string | null
          created_at?: string | null
          embedding_count?: number | null
          error_timestamp?: string | null
          file_type?: string | null
          id?: string
          inserted_at?: string
          is_indexed?: boolean | null
          last_error?: string | null
          last_indexed?: string | null
          metadata?: Json | null
          name: string
          path?: string | null
          processing_status?:
            | Database["public"]["Enums"]["processing_status"]
            | null
          reindex_required?: boolean | null
          retry_count?: number | null
          source_id?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          brand_id?: string | null
          created_at?: string | null
          embedding_count?: number | null
          error_timestamp?: string | null
          file_type?: string | null
          id?: string
          inserted_at?: string
          is_indexed?: boolean | null
          last_error?: string | null
          last_indexed?: string | null
          metadata?: Json | null
          name?: string
          path?: string | null
          processing_status?:
            | Database["public"]["Enums"]["processing_status"]
            | null
          reindex_required?: boolean | null
          retry_count?: number | null
          source_id?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_files_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_files_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "knowledge_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_sources: {
        Row: {
          brand_id: string | null
          category_id: string | null
          config: Json | null
          id: string
          inserted_at: string
          is_active: boolean | null
          last_synced: string | null
          name: string
          type: string | null
          updated_at: string
        }
        Insert: {
          brand_id?: string | null
          category_id?: string | null
          config?: Json | null
          id?: string
          inserted_at?: string
          is_active?: boolean | null
          last_synced?: string | null
          name: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          brand_id?: string | null
          category_id?: string | null
          config?: Json | null
          id?: string
          inserted_at?: string
          is_active?: boolean | null
          last_synced?: string | null
          name?: string
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_sources_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_sources_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "knowledge_base_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      leader_uploads: {
        Row: {
          created_at: string
          file_indexed_at: string | null
          file_name: string
          file_size: number | null
          file_summary: string | null
          file_type: string
          file_url: string
          id: string
          leader_id: string
          mime_type: string | null
          openai_file_id: string | null
          openai_vector_store_id: string | null
          source_type: string | null
        }
        Insert: {
          created_at?: string
          file_indexed_at?: string | null
          file_name: string
          file_size?: number | null
          file_summary?: string | null
          file_type?: string
          file_url: string
          id?: string
          leader_id: string
          mime_type?: string | null
          openai_file_id?: string | null
          openai_vector_store_id?: string | null
          source_type?: string | null
        }
        Update: {
          created_at?: string
          file_indexed_at?: string | null
          file_name?: string
          file_size?: number | null
          file_summary?: string | null
          file_type?: string
          file_url?: string
          id?: string
          leader_id?: string
          mime_type?: string | null
          openai_file_id?: string | null
          openai_vector_store_id?: string | null
          source_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leader_uploads_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "thought_leaders"
            referencedColumns: ["id"]
          },
        ]
      }
      linkedin_agent_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          cta_styles: Json
          forbidden_words: string[] | null
          formatting_rules: Json
          id: string
          influencer_references: Json | null
          is_active: boolean | null
          persona_tone: string
          role_category: string
          system_prompt: string
          target_audiences: Json
          template_name: string
          updated_at: string | null
          voice_characteristics: Json
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          cta_styles?: Json
          forbidden_words?: string[] | null
          formatting_rules?: Json
          id?: string
          influencer_references?: Json | null
          is_active?: boolean | null
          persona_tone: string
          role_category: string
          system_prompt: string
          target_audiences?: Json
          template_name: string
          updated_at?: string | null
          voice_characteristics?: Json
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          cta_styles?: Json
          forbidden_words?: string[] | null
          formatting_rules?: Json
          id?: string
          influencer_references?: Json | null
          is_active?: boolean | null
          persona_tone?: string
          role_category?: string
          system_prompt?: string
          target_audiences?: Json
          template_name?: string
          updated_at?: string | null
          voice_characteristics?: Json
        }
        Relationships: []
      }
      linkedin_analytics_upload: {
        Row: {
          brand_id: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          metric_date: string | null
          metric_name: string | null
          metric_value: number | null
        }
        Insert: {
          brand_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_date?: string | null
          metric_name?: string | null
          metric_value?: number | null
        }
        Update: {
          brand_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_date?: string | null
          metric_name?: string | null
          metric_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "linkedin_analytics_upload_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      linkedin_content_metadata: {
        Row: {
          brand_id: string | null
          comments: number | null
          created_at: string | null
          engagement_rate: number | null
          id: string
          impressions: number | null
          likes: number | null
          metadata: Json | null
          post_id: string | null
          shares: number | null
        }
        Insert: {
          brand_id?: string | null
          comments?: number | null
          created_at?: string | null
          engagement_rate?: number | null
          id?: string
          impressions?: number | null
          likes?: number | null
          metadata?: Json | null
          post_id?: string | null
          shares?: number | null
        }
        Update: {
          brand_id?: string | null
          comments?: number | null
          created_at?: string | null
          engagement_rate?: number | null
          id?: string
          impressions?: number | null
          likes?: number | null
          metadata?: Json | null
          post_id?: string | null
          shares?: number | null
        }
        Relationships: []
      }
      marketing_team_members: {
        Row: {
          brand_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          brand_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          brand_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_team_members_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      n8n_workflow_configs: {
        Row: {
          api_key_encrypted: string | null
          base_url: string
          created_at: string | null
          created_by: string | null
          id: string
          is_enabled: boolean | null
          metadata: Json | null
          updated_at: string | null
          workflow_name: string
          workflow_slug: string
        }
        Insert: {
          api_key_encrypted?: string | null
          base_url: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_enabled?: boolean | null
          metadata?: Json | null
          updated_at?: string | null
          workflow_name: string
          workflow_slug: string
        }
        Update: {
          api_key_encrypted?: string | null
          base_url?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_enabled?: boolean | null
          metadata?: Json | null
          updated_at?: string | null
          workflow_name?: string
          workflow_slug?: string
        }
        Relationships: []
      }
      n8n_workflow_executions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          input_data: Json | null
          output_data: Json | null
          started_at: string | null
          status: string | null
          workflow_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          started_at?: string | null
          status?: string | null
          workflow_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          started_at?: string | null
          status?: string | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "n8n_workflow_executions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "n8n_workflow_configs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "n8n_workflow_executions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "n8n_workflow_configs_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      newsletter_drafts: {
        Row: {
          created_at: string
          generated_content: Json
          html_content: string | null
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          generated_content?: Json
          html_content?: string | null
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          generated_content?: Json
          html_content?: string | null
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      newsletter_sources: {
        Row: {
          category: string
          created_at: string
          created_by: string
          feed_url: string
          id: string
          is_active: boolean
          keywords: string[]
          name: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          created_by: string
          feed_url: string
          id?: string
          is_active?: boolean
          keywords?: string[]
          name: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string
          feed_url?: string
          id?: string
          is_active?: boolean
          keywords?: string[]
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      organization_integrations: {
        Row: {
          config: Json | null
          connected: boolean | null
          created_at: string | null
          created_by: string | null
          id: string
          integration: string
          last_checked_at: string | null
          updated_at: string | null
        }
        Insert: {
          config?: Json | null
          connected?: boolean | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          integration: string
          last_checked_at?: string | null
          updated_at?: string | null
        }
        Update: {
          config?: Json | null
          connected?: boolean | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          integration?: string
          last_checked_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      organizations: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      perplexity_settings: {
        Row: {
          created_at: string
          default_prompt: string
          id: string
          max_tokens: number
          model: string
          temperature: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          default_prompt?: string
          id?: string
          max_tokens?: number
          model?: string
          temperature?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          default_prompt?: string
          id?: string
          max_tokens?: number
          model?: string
          temperature?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pod_members: {
        Row: {
          created_at: string | null
          employee_id: string
          id: string
          joined_at: string | null
          pod_id: string
          synced_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          employee_id: string
          id?: string
          joined_at?: string | null
          pod_id: string
          synced_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          employee_id?: string
          id?: string
          joined_at?: string | null
          pod_id?: string
          synced_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pod_members_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "pod_members_pod_id_fkey"
            columns: ["pod_id"]
            isOneToOne: false
            referencedRelation: "pods"
            referencedColumns: ["pod_id"]
          },
        ]
      }
      pods: {
        Row: {
          api_metadata: Json | null
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          member_count: number | null
          name: string
          pod_id: string
          synced_at: string | null
          updated_at: string | null
        }
        Insert: {
          api_metadata?: Json | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          member_count?: number | null
          name: string
          pod_id: string
          synced_at?: string | null
          updated_at?: string | null
        }
        Update: {
          api_metadata?: Json | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          member_count?: number | null
          name?: string
          pod_id?: string
          synced_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      post_agent_references: {
        Row: {
          agent_name: string
          agent_summary: string | null
          created_at: string | null
          external_agent_id: string
          id: string
          post_id: string
        }
        Insert: {
          agent_name: string
          agent_summary?: string | null
          created_at?: string | null
          external_agent_id: string
          id?: string
          post_id: string
        }
        Update: {
          agent_name?: string
          agent_summary?: string | null
          created_at?: string | null
          external_agent_id?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_agent_references_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "brand_generated_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      project_knowledge_embeddings: {
        Row: {
          chunk_index: number
          chunk_text: string
          created_at: string | null
          embedding: string | null
          file_id: string
          id: string
          metadata: Json | null
          project_id: string
          updated_at: string | null
        }
        Insert: {
          chunk_index?: number
          chunk_text: string
          created_at?: string | null
          embedding?: string | null
          file_id: string
          id?: string
          metadata?: Json | null
          project_id: string
          updated_at?: string | null
        }
        Update: {
          chunk_index?: number
          chunk_text?: string
          created_at?: string | null
          embedding?: string | null
          file_id?: string
          id?: string
          metadata?: Json | null
          project_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_knowledge_embeddings_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "project_knowledge_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_knowledge_embeddings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_knowledge_files: {
        Row: {
          created_at: string | null
          embedding_count: number | null
          error_timestamp: string | null
          external_id: string | null
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          is_indexed: boolean | null
          last_error: string | null
          last_indexed: string | null
          metadata: Json | null
          mime_type: string | null
          name: string | null
          path: string | null
          processing_status: string | null
          project_id: string
          retry_count: number | null
          source_id: string
          sync_status: string | null
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          embedding_count?: number | null
          error_timestamp?: string | null
          external_id?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string
          file_url: string
          id?: string
          is_indexed?: boolean | null
          last_error?: string | null
          last_indexed?: string | null
          metadata?: Json | null
          mime_type?: string | null
          name?: string | null
          path?: string | null
          processing_status?: string | null
          project_id: string
          retry_count?: number | null
          source_id: string
          sync_status?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          embedding_count?: number | null
          error_timestamp?: string | null
          external_id?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          is_indexed?: boolean | null
          last_error?: string | null
          last_indexed?: string | null
          metadata?: Json | null
          mime_type?: string | null
          name?: string | null
          path?: string | null
          processing_status?: string | null
          project_id?: string
          retry_count?: number | null
          source_id?: string
          sync_status?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_knowledge_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_knowledge_files_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "project_knowledge_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      project_knowledge_sources: {
        Row: {
          config: Json
          created_at: string | null
          id: string
          is_active: boolean | null
          last_synced_at: string | null
          name: string
          project_id: string
          source_type: string
          updated_at: string | null
        }
        Insert: {
          config?: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          name: string
          project_id: string
          source_type: string
          updated_at?: string | null
        }
        Update: {
          config?: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          name?: string
          project_id?: string
          source_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_knowledge_sources_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_meetings: {
        Row: {
          attendees: string[] | null
          created_at: string | null
          end_time: string
          id: string
          location: string | null
          meeting_data: Json | null
          meeting_description: string | null
          meeting_id: string
          meeting_link: string | null
          meeting_title: string
          meeting_type: string | null
          organizer: string | null
          project_id: string
          start_time: string
          updated_at: string | null
        }
        Insert: {
          attendees?: string[] | null
          created_at?: string | null
          end_time: string
          id?: string
          location?: string | null
          meeting_data?: Json | null
          meeting_description?: string | null
          meeting_id: string
          meeting_link?: string | null
          meeting_title: string
          meeting_type?: string | null
          organizer?: string | null
          project_id: string
          start_time: string
          updated_at?: string | null
        }
        Update: {
          attendees?: string[] | null
          created_at?: string | null
          end_time?: string
          id?: string
          location?: string | null
          meeting_data?: Json | null
          meeting_description?: string | null
          meeting_id?: string
          meeting_link?: string | null
          meeting_title?: string
          meeting_type?: string | null
          organizer?: string | null
          project_id?: string
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_meetings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_task_comments: {
        Row: {
          activecollab_comment_id: string
          comment: string | null
          comment_body: string | null
          created_at: string | null
          created_by: string | null
          created_by_email: string | null
          created_by_name: string | null
          deleted_at: string | null
          id: string
          is_deleted: boolean | null
          synced_at: string | null
          task_id: string
        }
        Insert: {
          activecollab_comment_id: string
          comment?: string | null
          comment_body?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_email?: string | null
          created_by_name?: string | null
          deleted_at?: string | null
          id?: string
          is_deleted?: boolean | null
          synced_at?: string | null
          task_id: string
        }
        Update: {
          activecollab_comment_id?: string
          comment?: string | null
          comment_body?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_email?: string | null
          created_by_name?: string | null
          deleted_at?: string | null
          id?: string
          is_deleted?: boolean | null
          synced_at?: string | null
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_task_comments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tasks: {
        Row: {
          activecollab_created_on: string | null
          activecollab_sync_at: string | null
          activecollab_task_id: string | null
          activecollab_updated_on: string | null
          actual_hours: number | null
          assigned_to: string | null
          brand_id: string | null
          category: string | null
          client_id: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          external_task_id: string | null
          id: string
          imported_hours: number | null
          last_hours_import: string | null
          past_assignees: string[] | null
          priority: string
          project_id: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          activecollab_created_on?: string | null
          activecollab_sync_at?: string | null
          activecollab_task_id?: string | null
          activecollab_updated_on?: string | null
          actual_hours?: number | null
          assigned_to?: string | null
          brand_id?: string | null
          category?: string | null
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          external_task_id?: string | null
          id?: string
          imported_hours?: number | null
          last_hours_import?: string | null
          past_assignees?: string[] | null
          priority?: string
          project_id?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          activecollab_created_on?: string | null
          activecollab_sync_at?: string | null
          activecollab_task_id?: string | null
          activecollab_updated_on?: string | null
          actual_hours?: number | null
          assigned_to?: string | null
          brand_id?: string | null
          category?: string | null
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          external_task_id?: string | null
          id?: string
          imported_hours?: number | null
          last_hours_import?: string | null
          past_assignees?: string[] | null
          priority?: string
          project_id?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          activecollab_budget: number | null
          activecollab_id: number | null
          activecollab_metadata: Json | null
          activecollab_project_id: string | null
          activecollab_sync_at: string | null
          actual_cost: number | null
          assigned_team: string[] | null
          budget: number | null
          client_id: string | null
          control_tower_last_synced_at: string | null
          control_tower_project_id: string | null
          created_at: string
          deadline: string | null
          description: string | null
          end_date: string | null
          external_project_id: string | null
          id: string
          last_hours_import: string | null
          metadata: Json | null
          name: string
          priority: string
          progress: number | null
          project_manager: string | null
          project_manager_id: string | null
          slug: string | null
          start_date: string | null
          status: string
          tags: string[] | null
          total_logged_hours: number | null
          updated_at: string
        }
        Insert: {
          activecollab_budget?: number | null
          activecollab_id?: number | null
          activecollab_metadata?: Json | null
          activecollab_project_id?: string | null
          activecollab_sync_at?: string | null
          actual_cost?: number | null
          assigned_team?: string[] | null
          budget?: number | null
          client_id?: string | null
          control_tower_last_synced_at?: string | null
          control_tower_project_id?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          end_date?: string | null
          external_project_id?: string | null
          id?: string
          last_hours_import?: string | null
          metadata?: Json | null
          name: string
          priority?: string
          progress?: number | null
          project_manager?: string | null
          project_manager_id?: string | null
          slug?: string | null
          start_date?: string | null
          status?: string
          tags?: string[] | null
          total_logged_hours?: number | null
          updated_at?: string
        }
        Update: {
          activecollab_budget?: number | null
          activecollab_id?: number | null
          activecollab_metadata?: Json | null
          activecollab_project_id?: string | null
          activecollab_sync_at?: string | null
          actual_cost?: number | null
          assigned_team?: string[] | null
          budget?: number | null
          client_id?: string | null
          control_tower_last_synced_at?: string | null
          control_tower_project_id?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          end_date?: string | null
          external_project_id?: string | null
          id?: string
          last_hours_import?: string | null
          metadata?: Json | null
          name?: string
          priority?: string
          progress?: number | null
          project_manager?: string | null
          project_manager_id?: string | null
          slug?: string | null
          start_date?: string | null
          status?: string
          tags?: string[] | null
          total_logged_hours?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_project_manager_id_fkey"
            columns: ["project_manager_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_items: {
        Row: {
          created_at: string | null
          description: string
          id: string
          quantity: number | null
          quote_id: string | null
          sort_order: number | null
          total_price: number | null
          unit_price: number | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          quantity?: number | null
          quote_id?: string | null
          sort_order?: number | null
          total_price?: number | null
          unit_price?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          quantity?: number | null
          quote_id?: string | null
          sort_order?: number | null
          total_price?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          client_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          metadata: Json | null
          status: string | null
          title: string
          total_amount: number | null
          updated_at: string | null
          valid_until: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          status?: string | null
          title: string
          total_amount?: number | null
          updated_at?: string | null
          valid_until?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          status?: string | null
          title?: string
          total_amount?: number | null
          updated_at?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reel_hook_generation_logs: {
        Row: {
          attempt_number: number
          completion_tokens: number | null
          cost_usd: number | null
          created_at: string | null
          error_message: string | null
          execution_time_ms: number | null
          id: string
          input_data: Json | null
          model_used: string | null
          output_data: Json | null
          prompt_tokens: number | null
          reel_hook_generation_id: string
          status: string | null
          step_name: string
          tokens_used: number | null
        }
        Insert: {
          attempt_number: number
          completion_tokens?: number | null
          cost_usd?: number | null
          created_at?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          input_data?: Json | null
          model_used?: string | null
          output_data?: Json | null
          prompt_tokens?: number | null
          reel_hook_generation_id: string
          status?: string | null
          step_name: string
          tokens_used?: number | null
        }
        Update: {
          attempt_number?: number
          completion_tokens?: number | null
          cost_usd?: number | null
          created_at?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          input_data?: Json | null
          model_used?: string | null
          output_data?: Json | null
          prompt_tokens?: number | null
          reel_hook_generation_id?: string
          status?: string | null
          step_name?: string
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reel_hook_generation_logs_reel_hook_generation_id_fkey"
            columns: ["reel_hook_generation_id"]
            isOneToOne: false
            referencedRelation: "reel_hook_generations"
            referencedColumns: ["id"]
          },
        ]
      }
      reel_hook_generations: {
        Row: {
          ab_test_suggestion: Json | null
          additional_context: string | null
          agent_run_id: string | null
          avg_quality_score: number | null
          awareness_level: string | null
          brand_id: string
          clarity_avg: number | null
          competitor_hooks: string[] | null
          completion_tokens: number | null
          content_format: string | null
          cost_usd: number | null
          created_at: string | null
          creator_persona: string | null
          emotional_pull_avg: number | null
          error_message: string | null
          generation_attempts: number | null
          generation_time_ms: number | null
          hook_length: string | null
          id: string
          llm_model_generation: string | null
          llm_model_scoring: string | null
          past_performing_hooks: string[] | null
          platform: string
          platform_note: string | null
          primary_goal: string
          primary_hook_category: string
          prompt_tokens: number | null
          regeneration_reason: string | null
          scroll_state: string | null
          scroll_stop_avg: number | null
          secondary_hook_category: string | null
          specificity_avg: number | null
          status: string | null
          strategy_reasoning: string | null
          strategy_used: string
          target_audience: string
          tone: string
          top_hooks: Json
          topic: string
          total_tokens_used: number | null
          trust_level: string | null
          updated_at: string | null
          urgency_level: string | null
          user_id: string
        }
        Insert: {
          ab_test_suggestion?: Json | null
          additional_context?: string | null
          agent_run_id?: string | null
          avg_quality_score?: number | null
          awareness_level?: string | null
          brand_id: string
          clarity_avg?: number | null
          competitor_hooks?: string[] | null
          completion_tokens?: number | null
          content_format?: string | null
          cost_usd?: number | null
          created_at?: string | null
          creator_persona?: string | null
          emotional_pull_avg?: number | null
          error_message?: string | null
          generation_attempts?: number | null
          generation_time_ms?: number | null
          hook_length?: string | null
          id?: string
          llm_model_generation?: string | null
          llm_model_scoring?: string | null
          past_performing_hooks?: string[] | null
          platform: string
          platform_note?: string | null
          primary_goal: string
          primary_hook_category: string
          prompt_tokens?: number | null
          regeneration_reason?: string | null
          scroll_state?: string | null
          scroll_stop_avg?: number | null
          secondary_hook_category?: string | null
          specificity_avg?: number | null
          status?: string | null
          strategy_reasoning?: string | null
          strategy_used: string
          target_audience: string
          tone: string
          top_hooks?: Json
          topic: string
          total_tokens_used?: number | null
          trust_level?: string | null
          updated_at?: string | null
          urgency_level?: string | null
          user_id: string
        }
        Update: {
          ab_test_suggestion?: Json | null
          additional_context?: string | null
          agent_run_id?: string | null
          avg_quality_score?: number | null
          awareness_level?: string | null
          brand_id?: string
          clarity_avg?: number | null
          competitor_hooks?: string[] | null
          completion_tokens?: number | null
          content_format?: string | null
          cost_usd?: number | null
          created_at?: string | null
          creator_persona?: string | null
          emotional_pull_avg?: number | null
          error_message?: string | null
          generation_attempts?: number | null
          generation_time_ms?: number | null
          hook_length?: string | null
          id?: string
          llm_model_generation?: string | null
          llm_model_scoring?: string | null
          past_performing_hooks?: string[] | null
          platform?: string
          platform_note?: string | null
          primary_goal?: string
          primary_hook_category?: string
          prompt_tokens?: number | null
          regeneration_reason?: string | null
          scroll_state?: string | null
          scroll_stop_avg?: number | null
          secondary_hook_category?: string | null
          specificity_avg?: number | null
          status?: string | null
          strategy_reasoning?: string | null
          strategy_used?: string
          target_audience?: string
          tone?: string
          top_hooks?: Json
          topic?: string
          total_tokens_used?: number | null
          trust_level?: string | null
          updated_at?: string | null
          urgency_level?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reel_hook_generations_agent_run_id_fkey"
            columns: ["agent_run_id"]
            isOneToOne: false
            referencedRelation: "ai_agent_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reel_hook_generations_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string
          id: string
          permissions: Json
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          permissions?: Json
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          permissions?: Json
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      seo_blog_content: {
        Row: {
          additional_notes: string | null
          audience: string | null
          brand_id: string
          brand_name: string
          completion_tokens: number | null
          cost_usd: number | null
          created_at: string | null
          generation_attempts: number | null
          generation_time_ms: number | null
          id: string
          is_valid: boolean | null
          leader_id: string | null
          llm_model: string | null
          paragraphs: Json | null
          primary_keyword: string
          primary_reference: string | null
          primary_reference_summary: string | null
          prompt_tokens: number | null
          published_at: string | null
          secondary_keyword: string | null
          status: string | null
          third_keyword: string | null
          title: string | null
          tone: string | null
          total_tokens_used: number | null
          updated_at: string | null
          user_id: string
          validation_errors: string[] | null
          validation_result: Json | null
          validation_warnings: string[] | null
        }
        Insert: {
          additional_notes?: string | null
          audience?: string | null
          brand_id: string
          brand_name: string
          completion_tokens?: number | null
          cost_usd?: number | null
          created_at?: string | null
          generation_attempts?: number | null
          generation_time_ms?: number | null
          id?: string
          is_valid?: boolean | null
          leader_id?: string | null
          llm_model?: string | null
          paragraphs?: Json | null
          primary_keyword: string
          primary_reference?: string | null
          primary_reference_summary?: string | null
          prompt_tokens?: number | null
          published_at?: string | null
          secondary_keyword?: string | null
          status?: string | null
          third_keyword?: string | null
          title?: string | null
          tone?: string | null
          total_tokens_used?: number | null
          updated_at?: string | null
          user_id: string
          validation_errors?: string[] | null
          validation_result?: Json | null
          validation_warnings?: string[] | null
        }
        Update: {
          additional_notes?: string | null
          audience?: string | null
          brand_id?: string
          brand_name?: string
          completion_tokens?: number | null
          cost_usd?: number | null
          created_at?: string | null
          generation_attempts?: number | null
          generation_time_ms?: number | null
          id?: string
          is_valid?: boolean | null
          leader_id?: string | null
          llm_model?: string | null
          paragraphs?: Json | null
          primary_keyword?: string
          primary_reference?: string | null
          primary_reference_summary?: string | null
          prompt_tokens?: number | null
          published_at?: string | null
          secondary_keyword?: string | null
          status?: string | null
          third_keyword?: string | null
          title?: string | null
          tone?: string | null
          total_tokens_used?: number | null
          updated_at?: string | null
          user_id?: string
          validation_errors?: string[] | null
          validation_result?: Json | null
          validation_warnings?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "seo_blog_content_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seo_blog_content_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "thought_leaders"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_blog_generation_logs: {
        Row: {
          attempt_number: number
          attempt_type: string
          blog_id: string
          completion_tokens: number | null
          created_at: string | null
          id: string
          llm_raw_response: Json | null
          llm_response: string | null
          prompt_tokens: number | null
          system_prompt: string | null
          tokens_used: number | null
          user_prompt: string | null
          validation_errors: Json | null
          validation_warnings: Json | null
          was_valid: boolean | null
        }
        Insert: {
          attempt_number: number
          attempt_type: string
          blog_id: string
          completion_tokens?: number | null
          created_at?: string | null
          id?: string
          llm_raw_response?: Json | null
          llm_response?: string | null
          prompt_tokens?: number | null
          system_prompt?: string | null
          tokens_used?: number | null
          user_prompt?: string | null
          validation_errors?: Json | null
          validation_warnings?: Json | null
          was_valid?: boolean | null
        }
        Update: {
          attempt_number?: number
          attempt_type?: string
          blog_id?: string
          completion_tokens?: number | null
          created_at?: string | null
          id?: string
          llm_raw_response?: Json | null
          llm_response?: string | null
          prompt_tokens?: number | null
          system_prompt?: string | null
          tokens_used?: number | null
          user_prompt?: string | null
          validation_errors?: Json | null
          validation_warnings?: Json | null
          was_valid?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "seo_blog_generation_logs_blog_id_fkey"
            columns: ["blog_id"]
            isOneToOne: false
            referencedRelation: "seo_blog_content"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_reference_summaries: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          model_used: string | null
          reference_hash: string | null
          reference_url: string | null
          summary: string
          tokens_used: number | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          model_used?: string | null
          reference_hash?: string | null
          reference_url?: string | null
          summary: string
          tokens_used?: number | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          model_used?: string | null
          reference_hash?: string | null
          reference_url?: string | null
          summary?: string
          tokens_used?: number | null
        }
        Relationships: []
      }
      service_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          base_price: number
          category_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          effort_hours: number
          id: string
          is_active: boolean | null
          name: string
          requirements_html: string | null
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          base_price?: number
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          effort_hours?: number
          id?: string
          is_active?: boolean | null
          name: string
          requirements_html?: string | null
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          base_price?: number
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          effort_hours?: number
          id?: string
          is_active?: boolean | null
          name?: string
          requirements_html?: string | null
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      sora_videos: {
        Row: {
          aspect_ratio: string | null
          brand_id: string | null
          completed_at: string | null
          created_at: string | null
          duration: number | null
          error: Json | null
          file_size_bytes: number | null
          has_audio: boolean | null
          id: string
          metadata: Json | null
          model: string | null
          prompt: string
          resolution: string | null
          status: string
          storage_path: string | null
          thumbnail_storage_path: string | null
          thumbnail_url: string | null
          title: string | null
          user_id: string | null
          video_url: string | null
        }
        Insert: {
          aspect_ratio?: string | null
          brand_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          duration?: number | null
          error?: Json | null
          file_size_bytes?: number | null
          has_audio?: boolean | null
          id: string
          metadata?: Json | null
          model?: string | null
          prompt: string
          resolution?: string | null
          status?: string
          storage_path?: string | null
          thumbnail_storage_path?: string | null
          thumbnail_url?: string | null
          title?: string | null
          user_id?: string | null
          video_url?: string | null
        }
        Update: {
          aspect_ratio?: string | null
          brand_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          duration?: number | null
          error?: Json | null
          file_size_bytes?: number | null
          has_audio?: boolean | null
          id?: string
          metadata?: Json | null
          model?: string | null
          prompt?: string
          resolution?: string | null
          status?: string
          storage_path?: string | null
          thumbnail_storage_path?: string | null
          thumbnail_url?: string | null
          title?: string | null
          user_id?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      task_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          task_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          task_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          task_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      team_daily_summaries: {
        Row: {
          agent_run_id: string | null
          ai_summary: Json
          concerns: string[] | null
          created_at: string | null
          eod_submission_id: string | null
          hours_logged: number | null
          id: string
          key_accomplishments: string[] | null
          productivity_score: number | null
          summary_date: string
          tasks_completed: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          agent_run_id?: string | null
          ai_summary?: Json
          concerns?: string[] | null
          created_at?: string | null
          eod_submission_id?: string | null
          hours_logged?: number | null
          id?: string
          key_accomplishments?: string[] | null
          productivity_score?: number | null
          summary_date: string
          tasks_completed?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          agent_run_id?: string | null
          ai_summary?: Json
          concerns?: string[] | null
          created_at?: string | null
          eod_submission_id?: string | null
          hours_logged?: number | null
          id?: string
          key_accomplishments?: string[] | null
          productivity_score?: number | null
          summary_date?: string
          tasks_completed?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_daily_summaries_agent_run_id_fkey"
            columns: ["agent_run_id"]
            isOneToOne: false
            referencedRelation: "ai_agent_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_daily_summaries_eod_submission_id_fkey"
            columns: ["eod_submission_id"]
            isOneToOne: false
            referencedRelation: "team_eod_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_daily_summaries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      team_eod_submissions: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          submission_date: string
          task_links: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          submission_date: string
          task_links?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          submission_date?: string
          task_links?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_eod_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          employee_id: string
          id: string
          is_captain: boolean | null
          joined_at: string
          team_id: string
        }
        Insert: {
          employee_id: string
          id?: string
          is_captain?: boolean | null
          joined_at?: string
          team_id: string
        }
        Update: {
          employee_id?: string
          id?: string
          is_captain?: boolean | null
          joined_at?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          team_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          team_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          team_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      testimonial_submission_tokens: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          testimonial_id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          testimonial_id: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          testimonial_id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "testimonial_submission_tokens_testimonial_id_fkey"
            columns: ["testimonial_id"]
            isOneToOne: false
            referencedRelation: "client_testimonials"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          author_name: string
          author_title: string | null
          company: string | null
          content: string
          created_at: string | null
          id: string
          is_approved: boolean | null
          rating: number | null
        }
        Insert: {
          author_name: string
          author_title?: string | null
          company?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          rating?: number | null
        }
        Update: {
          author_name?: string
          author_title?: string | null
          company?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          rating?: number | null
        }
        Relationships: []
      }
      thought_leaders: {
        Row: {
          agent_template_id: string | null
          ai_pipeline_config: Json | null
          brand_id: string | null
          content_phase: string | null
          content_phase_start_date: string | null
          created_at: string
          default_prompt: string
          department: string | null
          guide_text: string | null
          id: string
          linkedin_url: string | null
          name: string
          niche_domain: string | null
          niche_keyword: string | null
          openai_vector_store_id: string | null
          persona_tone: string
          personal_context: Json | null
          posts_this_week: Json | null
          posts_week_start: string | null
          style_overrides: Json | null
          target_audience: Json
          target_client_segments: string[] | null
          title: string
          updated_at: string
          url_slug: string | null
          user_id: string | null
          weekly_rhythm: Json | null
        }
        Insert: {
          agent_template_id?: string | null
          ai_pipeline_config?: Json | null
          brand_id?: string | null
          content_phase?: string | null
          content_phase_start_date?: string | null
          created_at?: string
          default_prompt: string
          department?: string | null
          guide_text?: string | null
          id?: string
          linkedin_url?: string | null
          name: string
          niche_domain?: string | null
          niche_keyword?: string | null
          openai_vector_store_id?: string | null
          persona_tone: string
          personal_context?: Json | null
          posts_this_week?: Json | null
          posts_week_start?: string | null
          style_overrides?: Json | null
          target_audience?: Json
          target_client_segments?: string[] | null
          title: string
          updated_at?: string
          url_slug?: string | null
          user_id?: string | null
          weekly_rhythm?: Json | null
        }
        Update: {
          agent_template_id?: string | null
          ai_pipeline_config?: Json | null
          brand_id?: string | null
          content_phase?: string | null
          content_phase_start_date?: string | null
          created_at?: string
          default_prompt?: string
          department?: string | null
          guide_text?: string | null
          id?: string
          linkedin_url?: string | null
          name?: string
          niche_domain?: string | null
          niche_keyword?: string | null
          openai_vector_store_id?: string | null
          persona_tone?: string
          personal_context?: Json | null
          posts_this_week?: Json | null
          posts_week_start?: string | null
          style_overrides?: Json | null
          target_audience?: Json
          target_client_segments?: string[] | null
          title?: string
          updated_at?: string
          url_slug?: string | null
          user_id?: string | null
          weekly_rhythm?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "thought_leaders_agent_template_id_fkey"
            columns: ["agent_template_id"]
            isOneToOne: false
            referencedRelation: "linkedin_agent_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "thought_leaders_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      user_accountability_chart: {
        Row: {
          created_at: string
          id: string
          responsibilities: string
          serial_number: number
          type_of_work: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          responsibilities: string
          serial_number: number
          type_of_work: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          responsibilities?: string
          serial_number?: number
          type_of_work?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_accountability_chart_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activecollab_settings: {
        Row: {
          activecollab_password: string
          activecollab_username: string
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          activecollab_password: string
          activecollab_username: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          activecollab_password?: string
          activecollab_username?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_activity_logs: {
        Row: {
          action_details: Json | null
          action_name: string | null
          activity_type: string
          created_at: string
          id: string
          module_name: string | null
          page_path: string | null
          session_id: string | null
          user_id: string
        }
        Insert: {
          action_details?: Json | null
          action_name?: string | null
          activity_type: string
          created_at?: string
          id?: string
          module_name?: string | null
          page_path?: string | null
          session_id?: string | null
          user_id: string
        }
        Update: {
          action_details?: Json | null
          action_name?: string | null
          activity_type?: string
          created_at?: string
          id?: string
          module_name?: string | null
          page_path?: string | null
          session_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_brands: {
        Row: {
          access_level: string
          brand_id: string
          can_manage_content: boolean
          can_manage_settings: boolean
          can_manage_team: boolean
          can_view_analytics: boolean
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_level?: string
          brand_id: string
          can_manage_content?: boolean
          can_manage_settings?: boolean
          can_manage_team?: boolean
          can_view_analytics?: boolean
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_level?: string
          brand_id?: string
          can_manage_content?: boolean
          can_manage_settings?: boolean
          can_manage_team?: boolean
          can_view_analytics?: boolean
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_brands_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_brands_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_google_tokens: {
        Row: {
          access_token: string
          created_at: string | null
          expires_at: string
          id: string
          refresh_token: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string | null
          expires_at: string
          id?: string
          refresh_token: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          refresh_token?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          can_create: boolean
          can_delete: boolean
          can_edit: boolean
          can_view: boolean
          created_at: string
          id: string
          module_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          can_create?: boolean
          can_delete?: boolean
          can_edit?: boolean
          can_view?: boolean
          created_at?: string
          id?: string
          module_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          can_create?: boolean
          can_delete?: boolean
          can_edit?: boolean
          can_view?: boolean
          created_at?: string
          id?: string
          module_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          email: string
          first_name: string | null
          id: string
          is_marketing: boolean
          last_name: string | null
          status: string
          title: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email: string
          first_name?: string | null
          id?: string
          is_marketing?: boolean
          last_name?: string | null
          status?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string
          first_name?: string | null
          id?: string
          is_marketing?: boolean
          last_name?: string | null
          status?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      vision_examples: {
        Row: {
          agent_name: string
          agent_slug: string
          category: string
          created_at: string
          display_order: number | null
          example_input: string
          example_output: Json
          id: string
          is_active: boolean | null
          updated_at: string
        }
        Insert: {
          agent_name: string
          agent_slug: string
          category?: string
          created_at?: string
          display_order?: number | null
          example_input: string
          example_output?: Json
          id?: string
          is_active?: boolean | null
          updated_at?: string
        }
        Update: {
          agent_name?: string
          agent_slug?: string
          category?: string
          created_at?: string
          display_order?: number | null
          example_input?: string
          example_output?: Json
          id?: string
          is_active?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      weekly_client_summary: {
        Row: {
          client_id: string | null
          created_at: string | null
          generated_by: string | null
          id: string
          summary_text: string | null
          week_end: string | null
          week_start: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          generated_by?: string | null
          id?: string
          summary_text?: string | null
          week_end?: string | null
          week_start?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          generated_by?: string | null
          id?: string
          summary_text?: string | null
          week_end?: string | null
          week_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "weekly_client_summary_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_client_summary_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_content_ideas: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          headline: string
          id: string
          is_active: boolean | null
          leader_id: string | null
          source_urls: string[] | null
          week_end_date: string
          week_start_date: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          headline: string
          id?: string
          is_active?: boolean | null
          leader_id?: string | null
          source_urls?: string[] | null
          week_end_date: string
          week_start_date: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          headline?: string
          id?: string
          is_active?: boolean | null
          leader_id?: string | null
          source_urls?: string[] | null
          week_end_date?: string
          week_start_date?: string
        }
        Relationships: []
      }
      weekly_trends: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          idea_source: string | null
          leader_id: string
          relevance_score: number | null
          source_url: string | null
          status: string | null
          topic_summary: string
          topic_title: string
          week_start: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          idea_source?: string | null
          leader_id: string
          relevance_score?: number | null
          source_url?: string | null
          status?: string | null
          topic_summary: string
          topic_title: string
          week_start: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          idea_source?: string | null
          leader_id?: string
          relevance_score?: number | null
          source_url?: string | null
          status?: string | null
          topic_summary?: string
          topic_title?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_trends_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "thought_leaders"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      agent_cost_summary: {
        Row: {
          avg_cost_per_run: number | null
          executed_by: string | null
          report_date: string | null
          total_cost_usd: number | null
          total_runs: number | null
        }
        Relationships: []
      }
      agent_daily_cost_stats: {
        Row: {
          day: string | null
          total_cost_usd: number | null
          total_runs: number | null
          total_tokens: number | null
          unique_users: number | null
        }
        Relationships: []
      }
      brand_analytics_integrations_safe: {
        Row: {
          brand_id: string | null
          created_at: string | null
          created_by: string | null
          data_sources: Json | null
          ga4_property_id: string | null
          id: string | null
          integration_type: string | null
          is_active: boolean | null
          last_sync_at: string | null
          metadata: Json | null
          metrics_config: Json | null
          n8n_workflow_id: string | null
          service_account_email: string | null
          sync_frequency: string | null
          token_expires_at: string | null
          updated_at: string | null
          webhook_url: string | null
        }
        Insert: {
          brand_id?: string | null
          created_at?: string | null
          created_by?: string | null
          data_sources?: Json | null
          ga4_property_id?: string | null
          id?: string | null
          integration_type?: string | null
          is_active?: boolean | null
          last_sync_at?: string | null
          metadata?: Json | null
          metrics_config?: Json | null
          n8n_workflow_id?: string | null
          service_account_email?: string | null
          sync_frequency?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          webhook_url?: string | null
        }
        Update: {
          brand_id?: string | null
          created_at?: string | null
          created_by?: string | null
          data_sources?: Json | null
          ga4_property_id?: string | null
          id?: string | null
          integration_type?: string | null
          is_active?: boolean | null
          last_sync_at?: string | null
          metadata?: Json | null
          metrics_config?: Json | null
          n8n_workflow_id?: string | null
          service_account_email?: string | null
          sync_frequency?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_analytics_integrations_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_analytics_integrations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      control_tower_api_keys_safe: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string | null
          is_active: boolean | null
          key_name: string | null
          last_used_at: string | null
          rate_limit_per_hour: number | null
          scopes: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string | null
          is_active?: boolean | null
          key_name?: string | null
          last_used_at?: string | null
          rate_limit_per_hour?: number | null
          scopes?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string | null
          is_active?: boolean | null
          key_name?: string | null
          last_used_at?: string | null
          rate_limit_per_hour?: number | null
          scopes?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      gohighlevel_integrations_safe: {
        Row: {
          created_at: string | null
          id: string | null
          is_active: boolean | null
          location_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          is_active?: boolean | null
          location_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          is_active?: boolean | null
          location_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_ghl_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      image_stats_summary: {
        Row: {
          avg_generation_time_ms: number | null
          blocked_generations: number | null
          date: string | null
          failed_generations: number | null
          successful_generations: number | null
          total_cost_cents: number | null
          total_generations: number | null
          unique_users: number | null
        }
        Relationships: []
      }
      image_top_users: {
        Row: {
          email: string | null
          full_name: string | null
          last_generation_date: string | null
          successful_generations: number | null
          total_cost_cents: number | null
          total_generations: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "image_generation_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      n8n_workflow_configs_safe: {
        Row: {
          base_url: string | null
          created_at: string | null
          created_by: string | null
          id: string | null
          is_enabled: boolean | null
          metadata: Json | null
          updated_at: string | null
          workflow_name: string | null
          workflow_slug: string | null
        }
        Insert: {
          base_url?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string | null
          is_enabled?: boolean | null
          metadata?: Json | null
          updated_at?: string | null
          workflow_name?: string | null
          workflow_slug?: string | null
        }
        Update: {
          base_url?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string | null
          is_enabled?: boolean | null
          metadata?: Json | null
          updated_at?: string | null
          workflow_name?: string | null
          workflow_slug?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_image_cost: {
        Args: { p_cost_cents: number; p_user_id: string }
        Returns: {
          created_at: string | null
          current_daily_count: number | null
          current_monthly_cost_cents: number | null
          daily_limit: number | null
          has_unlimited: boolean | null
          id: string
          last_monthly_reset: string | null
          last_reset_date: string | null
          monthly_cost_limit_cents: number | null
          override_at: string | null
          override_by: string | null
          override_reason: string | null
          updated_at: string | null
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "image_user_quotas"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      aggregate_image_stats_for_date: {
        Args: { p_date: string }
        Returns: undefined
      }
      backfill_image_stats: {
        Args: { p_end_date: string; p_start_date: string }
        Returns: number
      }
      check_analytics_api_rate_limit: {
        Args: { p_api_key_hash: string; p_max_requests?: number }
        Returns: {
          allowed: boolean
          current_count: number
          limit_max: number
          window_resets_at: string
        }[]
      }
      check_image_quota: {
        Args: { p_user_id: string }
        Returns: {
          current_count: number
          daily_limit: number
          has_quota: boolean
          has_unlimited: boolean
          monthly_cost: number
          monthly_limit: number
        }[]
      }
      claim_pending_knowledge_jobs: {
        Args: { job_limit?: number; max_retries?: number }
        Returns: {
          brand_id: string | null
          created_at: string | null
          embedding_count: number | null
          error_timestamp: string | null
          file_type: string | null
          id: string
          inserted_at: string
          is_indexed: boolean | null
          last_error: string | null
          last_indexed: string | null
          metadata: Json | null
          name: string
          path: string | null
          processing_status:
            | Database["public"]["Enums"]["processing_status"]
            | null
          reindex_required: boolean | null
          retry_count: number | null
          source_id: string | null
          updated_at: string
          uploaded_by: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "knowledge_files"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      claim_pending_project_knowledge_jobs: {
        Args: { job_limit?: number; max_retries?: number }
        Returns: {
          created_at: string | null
          embedding_count: number | null
          error_timestamp: string | null
          external_id: string | null
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          is_indexed: boolean | null
          last_error: string | null
          last_indexed: string | null
          metadata: Json | null
          mime_type: string | null
          name: string | null
          path: string | null
          processing_status: string | null
          project_id: string
          retry_count: number | null
          source_id: string
          sync_status: string | null
          updated_at: string | null
          uploaded_by: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "project_knowledge_files"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      cleanup_expired_keyword_suggestions: { Args: never; Returns: undefined }
      cleanup_expired_reference_summaries: { Args: never; Returns: number }
      ensure_user_quota: {
        Args: { p_user_id: string }
        Returns: {
          created_at: string | null
          current_daily_count: number | null
          current_monthly_cost_cents: number | null
          daily_limit: number | null
          has_unlimited: boolean | null
          id: string
          last_monthly_reset: string | null
          last_reset_date: string | null
          monthly_cost_limit_cents: number | null
          override_at: string | null
          override_by: string | null
          override_reason: string | null
          updated_at: string | null
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "image_user_quotas"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      generate_leader_slug: { Args: { leader_name: string }; Returns: string }
      get_current_user_role: { Args: never; Returns: string }
      get_image_children: {
        Args: { p_image_id: string }
        Returns: {
          created_at: string
          edit_instruction: string
          generation_status: string
          id: string
          image_url: string
          parent_id: string
          prompt: string
          storage_path: string
          version_number: number
        }[]
      }
      get_image_version_chain: {
        Args: { p_image_id: string }
        Returns: {
          created_at: string
          edit_instruction: string
          generation_status: string
          id: string
          image_url: string
          parent_id: string
          prompt: string
          storage_path: string
          version_number: number
        }[]
      }
      get_projects_with_sync_counts: {
        Args: never
        Returns: {
          activecollab_project_id: string
          activecollab_sync_at: string
          comment_count: number
          id: string
          name: string
          task_count: number
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_image_quota: {
        Args: { p_user_id: string }
        Returns: {
          created_at: string | null
          current_daily_count: number | null
          current_monthly_cost_cents: number | null
          daily_limit: number | null
          has_unlimited: boolean | null
          id: string
          last_monthly_reset: string | null
          last_reset_date: string | null
          monthly_cost_limit_cents: number | null
          override_at: string | null
          override_by: string | null
          override_reason: string | null
          updated_at: string | null
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "image_user_quotas"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      is_admin_or_superadmin: { Args: { _user_id: string }; Returns: boolean }
      is_superadmin: { Args: { _user_id: string }; Returns: boolean }
      is_task_assigned_to: {
        Args: { task_id: string; user_id: string }
        Returns: boolean
      }
      log_user_activity: {
        Args: {
          p_action_details?: Json
          p_action_name?: string
          p_activity_type: string
          p_module_name?: string
          p_page_path?: string
          p_session_id?: string
          p_user_id: string
        }
        Returns: string
      }
      match_agent_memories: {
        Args: {
          match_count?: number
          match_threshold?: number
          p_agent_id?: string
          p_user_id: string
          query_embedding: string
        }
        Returns: {
          content: string
          created_at: string
          id: string
          memory_type: string
          metadata: Json
          similarity: number
        }[]
      }
      match_brand_knowledge_embeddings: {
        Args: {
          match_count?: number
          match_threshold?: number
          p_brand_ids: string[]
          query_embedding: string
        }
        Returns: {
          brand_id: string
          chunk_index: number
          chunk_text: string
          file_id: string
          id: string
          metadata: Json
          similarity: number
        }[]
      }
      match_knowledge_embeddings: {
        Args: {
          p_category_id: string
          p_match_count: number
          p_query_embedding: string
        }
        Returns: {
          file_id: string
          metadata: Json
          score: number
        }[]
      }
      match_project_knowledge_embeddings: {
        Args: {
          p_match_count?: number
          p_project_id: string
          p_query_embedding: string
        }
        Returns: {
          chunk_index: number
          chunk_text: string
          file_id: string
          metadata: Json
          score: number
        }[]
      }
      search_agent_memories: {
        Args: {
          agent_id_param?: string
          match_count?: number
          query_embedding: string
          similarity_threshold?: number
          user_id: string
        }
        Returns: {
          context: Json
          created_at: string
          id: string
          memory_text: string
          similarity: number
          tags: string[]
        }[]
      }
      search_brand_embeddings: {
        Args: {
          brand_ids: string[]
          match_count?: number
          query_embedding: string
          similarity_threshold?: number
        }
        Returns: {
          brand_file_id: string
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      search_knowledge_embeddings: {
        Args: {
          category_ids: string[]
          match_count?: number
          query_embedding: string
          similarity_threshold?: number
        }
        Returns: {
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      trigger_knowledge_job_processing: { Args: never; Returns: Json }
      update_project_task: {
        Args: { p_task_id: string; p_updates: Json }
        Returns: Json
      }
      user_has_brand_access: {
        Args: { _brand_id: string; _user_id: string }
        Returns: boolean
      }
      user_has_client_access: {
        Args: { _client_id: string; _user_id: string }
        Returns: boolean
      }
      user_has_project_access: {
        Args: { _project_id: string; _user_id: string }
        Returns: boolean
      }
      user_is_marketing_or_manager: {
        Args: { _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "manager"
        | "pm"
        | "user"
        | "content_creator"
        | "marketing"
      linkedin_post_source: "trend" | "influencer" | "custom"
      processing_status: "pending" | "processing" | "completed" | "failed"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: [
        "super_admin",
        "manager",
        "pm",
        "user",
        "content_creator",
        "marketing",
      ],
      linkedin_post_source: ["trend", "influencer", "custom"],
      processing_status: ["pending", "processing", "completed", "failed"],
    },
  },
} as const
