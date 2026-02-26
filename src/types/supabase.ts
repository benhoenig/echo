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
      _prisma_migrations: {
        Row: {
          applied_steps_count: number
          checksum: string
          finished_at: string | null
          id: string
          logs: string | null
          migration_name: string
          rolled_back_at: string | null
          started_at: string
        }
        Insert: {
          applied_steps_count?: number
          checksum: string
          finished_at?: string | null
          id: string
          logs?: string | null
          migration_name: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Update: {
          applied_steps_count?: number
          checksum?: string
          finished_at?: string | null
          id?: string
          logs?: string | null
          migration_name?: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Relationships: []
      }
      activity_logs: {
        Row: {
          action_type: Database["public"]["Enums"]["ActionType"]
          actor_user_id: string | null
          created_at: string
          description: string
          entity_id: string
          entity_type: Database["public"]["Enums"]["EntityType"]
          id: string
          metadata: Json | null
          workspace_id: string
        }
        Insert: {
          action_type: Database["public"]["Enums"]["ActionType"]
          actor_user_id?: string | null
          created_at?: string
          description: string
          entity_id: string
          entity_type: Database["public"]["Enums"]["EntityType"]
          id?: string
          metadata?: Json | null
          workspace_id: string
        }
        Update: {
          action_type?: Database["public"]["Enums"]["ActionType"]
          actor_user_id?: string | null
          created_at?: string
          description?: string
          entity_id?: string
          entity_type?: Database["public"]["Enums"]["EntityType"]
          id?: string
          metadata?: Json | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_query_logs: {
        Row: {
          created_at: string
          data_sources_referenced: Json | null
          id: string
          query_text: string
          query_type: Database["public"]["Enums"]["AIQueryType"]
          response_text: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          data_sources_referenced?: Json | null
          id?: string
          query_text: string
          query_type: Database["public"]["Enums"]["AIQueryType"]
          response_text: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          data_sources_referenced?: Json | null
          id?: string
          query_text?: string
          query_type?: Database["public"]["Enums"]["AIQueryType"]
          response_text?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_query_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_query_logs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_reports: {
        Row: {
          config: Json
          created_at: string
          delivered_at: string | null
          delivered_to: string | null
          delivered_via: Database["public"]["Enums"]["DeliveredVia"]
          generated_by_id: string | null
          id: string
          output_pdf_url: string | null
          report_name: string
          report_type: Database["public"]["Enums"]["AIReportType"]
          workspace_id: string
        }
        Insert: {
          config: Json
          created_at?: string
          delivered_at?: string | null
          delivered_to?: string | null
          delivered_via?: Database["public"]["Enums"]["DeliveredVia"]
          generated_by_id?: string | null
          id?: string
          output_pdf_url?: string | null
          report_name: string
          report_type: Database["public"]["Enums"]["AIReportType"]
          workspace_id: string
        }
        Update: {
          config?: Json
          created_at?: string
          delivered_at?: string | null
          delivered_to?: string | null
          delivered_via?: Database["public"]["Enums"]["DeliveredVia"]
          generated_by_id?: string | null
          id?: string
          output_pdf_url?: string | null
          report_name?: string
          report_type?: Database["public"]["Enums"]["AIReportType"]
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_reports_generated_by_id_fkey"
            columns: ["generated_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_reports_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: Database["public"]["Enums"]["ActionType"]
          actor_user_id: string | null
          entity_id: string
          entity_type: Database["public"]["Enums"]["EntityType"]
          field_changed: string | null
          id: string
          ip_address: string | null
          new_value: string | null
          old_value: string | null
          timestamp: string
          workspace_id: string
        }
        Insert: {
          action: Database["public"]["Enums"]["ActionType"]
          actor_user_id?: string | null
          entity_id: string
          entity_type: Database["public"]["Enums"]["EntityType"]
          field_changed?: string | null
          id?: string
          ip_address?: string | null
          new_value?: string | null
          old_value?: string | null
          timestamp?: string
          workspace_id: string
        }
        Update: {
          action?: Database["public"]["Enums"]["ActionType"]
          actor_user_id?: string | null
          entity_id?: string
          entity_type?: Database["public"]["Enums"]["EntityType"]
          field_changed?: string | null
          id?: string
          ip_address?: string | null
          new_value?: string | null
          old_value?: string | null
          timestamp?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_user_id: string | null
          category: string | null
          content: string
          cover_image_url: string | null
          created_at: string
          id: string
          is_published: boolean
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          author_user_id?: string | null
          category?: string | null
          content: string
          cover_image_url?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at: string
          workspace_id: string
        }
        Update: {
          author_user_id?: string | null
          category?: string | null
          content?: string
          cover_image_url?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_user_id_fkey"
            columns: ["author_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_user_id: string
          content: string
          created_at: string
          edited_at: string | null
          entity_id: string
          entity_type: Database["public"]["Enums"]["EntityType"]
          id: string
          is_deleted: boolean
          mentions: string[] | null
          tagged_contact_id: string | null
          tagged_listing_id: string | null
        }
        Insert: {
          author_user_id: string
          content: string
          created_at?: string
          edited_at?: string | null
          entity_id: string
          entity_type: Database["public"]["Enums"]["EntityType"]
          id?: string
          is_deleted?: boolean
          mentions?: string[] | null
          tagged_contact_id?: string | null
          tagged_listing_id?: string | null
        }
        Update: {
          author_user_id?: string
          content?: string
          created_at?: string
          edited_at?: string | null
          entity_id?: string
          entity_type?: Database["public"]["Enums"]["EntityType"]
          id?: string
          is_deleted?: boolean
          mentions?: string[] | null
          tagged_contact_id?: string | null
          tagged_listing_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_user_id_fkey"
            columns: ["author_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_tagged_contact_id_fkey"
            columns: ["tagged_contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_tagged_listing_id_fkey"
            columns: ["tagged_listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          action_reminder_interval: number | null
          archived: boolean
          assigned_to_id: string | null
          budget_max: number | null
          budget_min: number | null
          contact_source: Database["public"]["Enums"]["ContactSource"] | null
          contact_status: Database["public"]["Enums"]["ContactStatus"] | null
          contact_type: string[] | null
          created_at: string
          created_by_id: string | null
          email: string | null
          financing_method:
            | Database["public"]["Enums"]["FinancingMethod"]
            | null
          first_name: string
          has_ev_car: boolean | null
          has_pet: boolean | null
          id: string
          id_card_or_passport_no: string | null
          last_action_date: string | null
          last_contacted_at: string | null
          last_name: string
          last_updated_at: string
          last_updated_by_id: string | null
          line_id: string | null
          nationality: string | null
          nickname: string | null
          notes: string | null
          pain_points: string | null
          parking_slots_needed: number | null
          phone_primary: string | null
          phone_secondary: string | null
          potential_tier:
            | Database["public"]["Enums"]["PotentialTierValue"]
            | null
          pre_approval_expiry_date: string | null
          pre_approved_amount: number | null
          preferred_bedrooms: number | null
          preferred_facilities: string[] | null
          preferred_floor_max: number | null
          preferred_floor_min: number | null
          preferred_property_type:
            | Database["public"]["Enums"]["PropertyType"][]
            | null
          preferred_size_max: number | null
          preferred_size_min: number | null
          preferred_zone_ids: string[] | null
          purpose_of_purchase:
            | Database["public"]["Enums"]["PurchasePurpose"]
            | null
          reactivate_on: string | null
          referred_by_id: string | null
          special_requirements: string | null
          tags: string[] | null
          timeline: Database["public"]["Enums"]["Timeline"] | null
          workspace_id: string
        }
        Insert: {
          action_reminder_interval?: number | null
          archived?: boolean
          assigned_to_id?: string | null
          budget_max?: number | null
          budget_min?: number | null
          contact_source?: Database["public"]["Enums"]["ContactSource"] | null
          contact_status?: Database["public"]["Enums"]["ContactStatus"] | null
          contact_type?: string[] | null
          created_at?: string
          created_by_id?: string | null
          email?: string | null
          financing_method?:
            | Database["public"]["Enums"]["FinancingMethod"]
            | null
          first_name: string
          has_ev_car?: boolean | null
          has_pet?: boolean | null
          id?: string
          id_card_or_passport_no?: string | null
          last_action_date?: string | null
          last_contacted_at?: string | null
          last_name: string
          last_updated_at: string
          last_updated_by_id?: string | null
          line_id?: string | null
          nationality?: string | null
          nickname?: string | null
          notes?: string | null
          pain_points?: string | null
          parking_slots_needed?: number | null
          phone_primary?: string | null
          phone_secondary?: string | null
          potential_tier?:
            | Database["public"]["Enums"]["PotentialTierValue"]
            | null
          pre_approval_expiry_date?: string | null
          pre_approved_amount?: number | null
          preferred_bedrooms?: number | null
          preferred_facilities?: string[] | null
          preferred_floor_max?: number | null
          preferred_floor_min?: number | null
          preferred_property_type?:
            | Database["public"]["Enums"]["PropertyType"][]
            | null
          preferred_size_max?: number | null
          preferred_size_min?: number | null
          preferred_zone_ids?: string[] | null
          purpose_of_purchase?:
            | Database["public"]["Enums"]["PurchasePurpose"]
            | null
          reactivate_on?: string | null
          referred_by_id?: string | null
          special_requirements?: string | null
          tags?: string[] | null
          timeline?: Database["public"]["Enums"]["Timeline"] | null
          workspace_id: string
        }
        Update: {
          action_reminder_interval?: number | null
          archived?: boolean
          assigned_to_id?: string | null
          budget_max?: number | null
          budget_min?: number | null
          contact_source?: Database["public"]["Enums"]["ContactSource"] | null
          contact_status?: Database["public"]["Enums"]["ContactStatus"] | null
          contact_type?: string[] | null
          created_at?: string
          created_by_id?: string | null
          email?: string | null
          financing_method?:
            | Database["public"]["Enums"]["FinancingMethod"]
            | null
          first_name?: string
          has_ev_car?: boolean | null
          has_pet?: boolean | null
          id?: string
          id_card_or_passport_no?: string | null
          last_action_date?: string | null
          last_contacted_at?: string | null
          last_name?: string
          last_updated_at?: string
          last_updated_by_id?: string | null
          line_id?: string | null
          nationality?: string | null
          nickname?: string | null
          notes?: string | null
          pain_points?: string | null
          parking_slots_needed?: number | null
          phone_primary?: string | null
          phone_secondary?: string | null
          potential_tier?:
            | Database["public"]["Enums"]["PotentialTierValue"]
            | null
          pre_approval_expiry_date?: string | null
          pre_approved_amount?: number | null
          preferred_bedrooms?: number | null
          preferred_facilities?: string[] | null
          preferred_floor_max?: number | null
          preferred_floor_min?: number | null
          preferred_property_type?:
            | Database["public"]["Enums"]["PropertyType"][]
            | null
          preferred_size_max?: number | null
          preferred_size_min?: number | null
          preferred_zone_ids?: string[] | null
          purpose_of_purchase?:
            | Database["public"]["Enums"]["PurchasePurpose"]
            | null
          reactivate_on?: string | null
          referred_by_id?: string | null
          special_requirements?: string | null
          tags?: string[] | null
          timeline?: Database["public"]["Enums"]["Timeline"] | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_assigned_to_id_fkey"
            columns: ["assigned_to_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_created_by_id_fkey"
            columns: ["created_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_last_updated_by_id_fkey"
            columns: ["last_updated_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_referred_by_id_fkey"
            columns: ["referred_by_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_field_definitions: {
        Row: {
          created_at: string
          created_by_id: string | null
          display_order: number
          dropdown_options: Json | null
          field_name: string
          field_type: Database["public"]["Enums"]["CustomFieldType"]
          id: string
          is_active: boolean
          is_required: boolean
          module: Database["public"]["Enums"]["ModuleType"]
          workspace_id: string
        }
        Insert: {
          created_at?: string
          created_by_id?: string | null
          display_order: number
          dropdown_options?: Json | null
          field_name: string
          field_type: Database["public"]["Enums"]["CustomFieldType"]
          id?: string
          is_active?: boolean
          is_required?: boolean
          module: Database["public"]["Enums"]["ModuleType"]
          workspace_id: string
        }
        Update: {
          created_at?: string
          created_by_id?: string | null
          display_order?: number
          dropdown_options?: Json | null
          field_name?: string
          field_type?: Database["public"]["Enums"]["CustomFieldType"]
          id?: string
          is_active?: boolean
          is_required?: boolean
          module?: Database["public"]["Enums"]["ModuleType"]
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_field_definitions_created_by_id_fkey"
            columns: ["created_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_field_definitions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_field_values: {
        Row: {
          entity_id: string
          entity_type: Database["public"]["Enums"]["EntityType"]
          field_id: string
          id: string
          updated_at: string
          updated_by_id: string | null
          value: string
        }
        Insert: {
          entity_id: string
          entity_type: Database["public"]["Enums"]["EntityType"]
          field_id: string
          id?: string
          updated_at: string
          updated_by_id?: string | null
          value: string
        }
        Update: {
          entity_id?: string
          entity_type?: Database["public"]["Enums"]["EntityType"]
          field_id?: string
          id?: string
          updated_at?: string
          updated_by_id?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_field_values_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "custom_field_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_field_values_updated_by_id_fkey"
            columns: ["updated_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          archived: boolean
          assigned_to_id: string | null
          buyer_contact_id: string | null
          closed_lost_reason: string | null
          commission_rate: number | null
          created_at: string
          created_by_id: string | null
          deal_name: string
          deal_status: Database["public"]["Enums"]["DealStatus"]
          deal_type: Database["public"]["Enums"]["DealType"]
          estimated_commission: number | null
          estimated_deal_value: number | null
          id: string
          last_action_date: string | null
          last_updated_at: string
          last_updated_by_id: string | null
          lead_source: Database["public"]["Enums"]["ContactSource"] | null
          listing_id: string | null
          notes: string | null
          pipeline_stage_id: string
          seller_contact_id: string | null
          workspace_id: string
        }
        Insert: {
          archived?: boolean
          assigned_to_id?: string | null
          buyer_contact_id?: string | null
          closed_lost_reason?: string | null
          commission_rate?: number | null
          created_at?: string
          created_by_id?: string | null
          deal_name: string
          deal_status?: Database["public"]["Enums"]["DealStatus"]
          deal_type: Database["public"]["Enums"]["DealType"]
          estimated_commission?: number | null
          estimated_deal_value?: number | null
          id?: string
          last_action_date?: string | null
          last_updated_at: string
          last_updated_by_id?: string | null
          lead_source?: Database["public"]["Enums"]["ContactSource"] | null
          listing_id?: string | null
          notes?: string | null
          pipeline_stage_id: string
          seller_contact_id?: string | null
          workspace_id: string
        }
        Update: {
          archived?: boolean
          assigned_to_id?: string | null
          buyer_contact_id?: string | null
          closed_lost_reason?: string | null
          commission_rate?: number | null
          created_at?: string
          created_by_id?: string | null
          deal_name?: string
          deal_status?: Database["public"]["Enums"]["DealStatus"]
          deal_type?: Database["public"]["Enums"]["DealType"]
          estimated_commission?: number | null
          estimated_deal_value?: number | null
          id?: string
          last_action_date?: string | null
          last_updated_at?: string
          last_updated_by_id?: string | null
          lead_source?: Database["public"]["Enums"]["ContactSource"] | null
          listing_id?: string | null
          notes?: string | null
          pipeline_stage_id?: string
          seller_contact_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deals_assigned_to_id_fkey"
            columns: ["assigned_to_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_buyer_contact_id_fkey"
            columns: ["buyer_contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_created_by_id_fkey"
            columns: ["created_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_last_updated_by_id_fkey"
            columns: ["last_updated_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_pipeline_stage_id_fkey"
            columns: ["pipeline_stage_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_seller_contact_id_fkey"
            columns: ["seller_contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      exclusive_agreements: {
        Row: {
          agreement_file_url: string | null
          agreement_status: Database["public"]["Enums"]["AgreementStatus"]
          assigned_agent_id: string | null
          commission_rate: number | null
          commission_type: Database["public"]["Enums"]["CommissionType"]
          created_at: string
          created_by_id: string | null
          end_date: string
          fixed_fee_amount: number | null
          id: string
          last_updated_at: string
          last_updated_by_id: string | null
          listing_id: string
          notes: string | null
          previous_agreement_id: string | null
          reminder_days_before: number | null
          renewal_count: number
          seller_contact_id: string | null
          start_date: string
        }
        Insert: {
          agreement_file_url?: string | null
          agreement_status?: Database["public"]["Enums"]["AgreementStatus"]
          assigned_agent_id?: string | null
          commission_rate?: number | null
          commission_type?: Database["public"]["Enums"]["CommissionType"]
          created_at?: string
          created_by_id?: string | null
          end_date: string
          fixed_fee_amount?: number | null
          id?: string
          last_updated_at: string
          last_updated_by_id?: string | null
          listing_id: string
          notes?: string | null
          previous_agreement_id?: string | null
          reminder_days_before?: number | null
          renewal_count?: number
          seller_contact_id?: string | null
          start_date: string
        }
        Update: {
          agreement_file_url?: string | null
          agreement_status?: Database["public"]["Enums"]["AgreementStatus"]
          assigned_agent_id?: string | null
          commission_rate?: number | null
          commission_type?: Database["public"]["Enums"]["CommissionType"]
          created_at?: string
          created_by_id?: string | null
          end_date?: string
          fixed_fee_amount?: number | null
          id?: string
          last_updated_at?: string
          last_updated_by_id?: string | null
          listing_id?: string
          notes?: string | null
          previous_agreement_id?: string | null
          reminder_days_before?: number | null
          renewal_count?: number
          seller_contact_id?: string | null
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "exclusive_agreements_assigned_agent_id_fkey"
            columns: ["assigned_agent_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exclusive_agreements_created_by_id_fkey"
            columns: ["created_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exclusive_agreements_last_updated_by_id_fkey"
            columns: ["last_updated_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exclusive_agreements_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exclusive_agreements_previous_agreement_id_fkey"
            columns: ["previous_agreement_id"]
            isOneToOne: false
            referencedRelation: "exclusive_agreements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exclusive_agreements_seller_contact_id_fkey"
            columns: ["seller_contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      form_submissions: {
        Row: {
          auto_created_contact_id: string | null
          auto_created_deal_id: string | null
          email: string | null
          id: string
          line_id: string | null
          message: string | null
          name: string
          phone: string | null
          source_listing_id: string | null
          source_page_id: string | null
          submitted_at: string
          workspace_id: string
        }
        Insert: {
          auto_created_contact_id?: string | null
          auto_created_deal_id?: string | null
          email?: string | null
          id?: string
          line_id?: string | null
          message?: string | null
          name: string
          phone?: string | null
          source_listing_id?: string | null
          source_page_id?: string | null
          submitted_at?: string
          workspace_id: string
        }
        Update: {
          auto_created_contact_id?: string | null
          auto_created_deal_id?: string | null
          email?: string | null
          id?: string
          line_id?: string | null
          message?: string | null
          name?: string
          phone?: string | null
          source_listing_id?: string | null
          source_page_id?: string | null
          submitted_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_submissions_auto_created_contact_id_fkey"
            columns: ["auto_created_contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submissions_auto_created_deal_id_fkey"
            columns: ["auto_created_deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submissions_source_listing_id_fkey"
            columns: ["source_listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submissions_source_page_id_fkey"
            columns: ["source_page_id"]
            isOneToOne: false
            referencedRelation: "website_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submissions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_contact_matches: {
        Row: {
          contact_id: string
          id: string
          last_updated_at: string
          listing_id: string
          match_score: number
          match_status: Database["public"]["Enums"]["MatchStatus"]
          matched_at: string
          matched_fields: Json
        }
        Insert: {
          contact_id: string
          id?: string
          last_updated_at: string
          listing_id: string
          match_score: number
          match_status?: Database["public"]["Enums"]["MatchStatus"]
          matched_at?: string
          matched_fields: Json
        }
        Update: {
          contact_id?: string
          id?: string
          last_updated_at?: string
          listing_id?: string
          match_score?: number
          match_status?: Database["public"]["Enums"]["MatchStatus"]
          matched_at?: string
          matched_fields?: Json
        }
        Relationships: [
          {
            foreignKeyName: "listing_contact_matches_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_contact_matches_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_updates: {
        Row: {
          field_changed: string
          id: string
          listing_id: string
          new_value: string | null
          old_value: string | null
          status: string
          updated_at: string
          updated_by_id: string | null
        }
        Insert: {
          field_changed: string
          id?: string
          listing_id: string
          new_value?: string | null
          old_value?: string | null
          status: string
          updated_at?: string
          updated_by_id?: string | null
        }
        Update: {
          field_changed?: string
          id?: string
          listing_id?: string
          new_value?: string | null
          old_value?: string | null
          status?: string
          updated_at?: string
          updated_by_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listing_updates_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_updates_updated_by_id_fkey"
            columns: ["updated_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          agreement_file_url: string | null
          archived: boolean
          asking_price: number | null
          asking_price_history: Json | null
          bathrooms: number | null
          bedrooms: number | null
          bts: string | null
          building: string | null
          commission_rate: number | null
          created_at: string
          created_by_id: string | null
          days_on_market: number | null
          ddproperty_url: string | null
          direction: string | null
          exclusive_agreement: boolean
          facebook_group_url: string | null
          facebook_page_url: string | null
          featured_flag: boolean
          floor: number | null
          focus_flag: boolean
          google_maps_link: string | null
          id: string
          in_project: boolean
          instagram_url: string | null
          last_action_date: string | null
          last_updated_at: string
          last_updated_by_id: string | null
          listing_grade: Database["public"]["Enums"]["ListingGrade"] | null
          listing_name: string
          listing_status: Database["public"]["Enums"]["ListingStatus"]
          listing_status_changed_at: string | null
          listing_type: Database["public"]["Enums"]["ListingType"]
          livinginsider_url: string | null
          maids_room: boolean | null
          marketing_report_url: string | null
          matching_tags: string[] | null
          media_files_url: string[] | null
          mrt: string | null
          parking_slots: number | null
          price_remark: string | null
          project_id: string | null
          project_name: string | null
          property_type: Database["public"]["Enums"]["PropertyType"]
          propertyhub_url: string | null
          rental_price: number | null
          rental_remark: string | null
          seller_contact_id: string | null
          seller_line: string | null
          seller_phone: string | null
          size_ngan: number | null
          size_rai: number | null
          size_sqm: number | null
          size_wa: number | null
          stories: number | null
          street_soi: string | null
          tiktok_url: string | null
          unit_condition: string | null
          unit_no: string | null
          unit_photos: string[] | null
          view: string | null
          website_visible: boolean
          workspace_id: string
          youtube_url: string | null
          zone: string | null
        }
        Insert: {
          agreement_file_url?: string | null
          archived?: boolean
          asking_price?: number | null
          asking_price_history?: Json | null
          bathrooms?: number | null
          bedrooms?: number | null
          bts?: string | null
          building?: string | null
          commission_rate?: number | null
          created_at?: string
          created_by_id?: string | null
          days_on_market?: number | null
          ddproperty_url?: string | null
          direction?: string | null
          exclusive_agreement?: boolean
          facebook_group_url?: string | null
          facebook_page_url?: string | null
          featured_flag?: boolean
          floor?: number | null
          focus_flag?: boolean
          google_maps_link?: string | null
          id?: string
          in_project?: boolean
          instagram_url?: string | null
          last_action_date?: string | null
          last_updated_at: string
          last_updated_by_id?: string | null
          listing_grade?: Database["public"]["Enums"]["ListingGrade"] | null
          listing_name: string
          listing_status?: Database["public"]["Enums"]["ListingStatus"]
          listing_status_changed_at?: string | null
          listing_type: Database["public"]["Enums"]["ListingType"]
          livinginsider_url?: string | null
          maids_room?: boolean | null
          marketing_report_url?: string | null
          matching_tags?: string[] | null
          media_files_url?: string[] | null
          mrt?: string | null
          parking_slots?: number | null
          price_remark?: string | null
          project_id?: string | null
          project_name?: string | null
          property_type: Database["public"]["Enums"]["PropertyType"]
          propertyhub_url?: string | null
          rental_price?: number | null
          rental_remark?: string | null
          seller_contact_id?: string | null
          seller_line?: string | null
          seller_phone?: string | null
          size_ngan?: number | null
          size_rai?: number | null
          size_sqm?: number | null
          size_wa?: number | null
          stories?: number | null
          street_soi?: string | null
          tiktok_url?: string | null
          unit_condition?: string | null
          unit_no?: string | null
          unit_photos?: string[] | null
          view?: string | null
          website_visible?: boolean
          workspace_id: string
          youtube_url?: string | null
          zone?: string | null
        }
        Update: {
          agreement_file_url?: string | null
          archived?: boolean
          asking_price?: number | null
          asking_price_history?: Json | null
          bathrooms?: number | null
          bedrooms?: number | null
          bts?: string | null
          building?: string | null
          commission_rate?: number | null
          created_at?: string
          created_by_id?: string | null
          days_on_market?: number | null
          ddproperty_url?: string | null
          direction?: string | null
          exclusive_agreement?: boolean
          facebook_group_url?: string | null
          facebook_page_url?: string | null
          featured_flag?: boolean
          floor?: number | null
          focus_flag?: boolean
          google_maps_link?: string | null
          id?: string
          in_project?: boolean
          instagram_url?: string | null
          last_action_date?: string | null
          last_updated_at?: string
          last_updated_by_id?: string | null
          listing_grade?: Database["public"]["Enums"]["ListingGrade"] | null
          listing_name?: string
          listing_status?: Database["public"]["Enums"]["ListingStatus"]
          listing_status_changed_at?: string | null
          listing_type?: Database["public"]["Enums"]["ListingType"]
          livinginsider_url?: string | null
          maids_room?: boolean | null
          marketing_report_url?: string | null
          matching_tags?: string[] | null
          media_files_url?: string[] | null
          mrt?: string | null
          parking_slots?: number | null
          price_remark?: string | null
          project_id?: string | null
          project_name?: string | null
          property_type?: Database["public"]["Enums"]["PropertyType"]
          propertyhub_url?: string | null
          rental_price?: number | null
          rental_remark?: string | null
          seller_contact_id?: string | null
          seller_line?: string | null
          seller_phone?: string | null
          size_ngan?: number | null
          size_rai?: number | null
          size_sqm?: number | null
          size_wa?: number | null
          stories?: number | null
          street_soi?: string | null
          tiktok_url?: string | null
          unit_condition?: string | null
          unit_no?: string | null
          unit_photos?: string[] | null
          view?: string | null
          website_visible?: boolean
          workspace_id?: string
          youtube_url?: string | null
          zone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_created_by_id_fkey"
            columns: ["created_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_last_updated_by_id_fkey"
            columns: ["last_updated_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_seller_contact_id_fkey"
            columns: ["seller_contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      media: {
        Row: {
          display_order: number | null
          entity_id: string | null
          entity_type: Database["public"]["Enums"]["EntityType"]
          file_name: string
          file_size_bytes: number
          file_type: Database["public"]["Enums"]["FileType"]
          file_url: string
          id: string
          uploaded_at: string
          uploaded_by_id: string | null
          watermarked_url: string | null
          workspace_id: string
        }
        Insert: {
          display_order?: number | null
          entity_id?: string | null
          entity_type: Database["public"]["Enums"]["EntityType"]
          file_name: string
          file_size_bytes: number
          file_type: Database["public"]["Enums"]["FileType"]
          file_url: string
          id?: string
          uploaded_at?: string
          uploaded_by_id?: string | null
          watermarked_url?: string | null
          workspace_id: string
        }
        Update: {
          display_order?: number | null
          entity_id?: string | null
          entity_type?: Database["public"]["Enums"]["EntityType"]
          file_name?: string
          file_size_bytes?: number
          file_type?: Database["public"]["Enums"]["FileType"]
          file_url?: string
          id?: string
          uploaded_at?: string
          uploaded_by_id?: string | null
          watermarked_url?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_uploaded_by_id_fkey"
            columns: ["uploaded_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: Database["public"]["Enums"]["EntityType"]
          id: string
          is_read: boolean
          message: string
          read_at: string | null
          type: Database["public"]["Enums"]["NotificationType"]
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: Database["public"]["Enums"]["EntityType"]
          id?: string
          is_read?: boolean
          message: string
          read_at?: string | null
          type: Database["public"]["Enums"]["NotificationType"]
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: Database["public"]["Enums"]["EntityType"]
          id?: string
          is_read?: boolean
          message?: string
          read_at?: string | null
          type?: Database["public"]["Enums"]["NotificationType"]
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_stage_history: {
        Row: {
          changed_at: string
          changed_by_id: string | null
          deal_id: string
          from_stage_id: string | null
          id: string
          time_in_previous_stage: number | null
          to_stage_id: string
        }
        Insert: {
          changed_at?: string
          changed_by_id?: string | null
          deal_id: string
          from_stage_id?: string | null
          id?: string
          time_in_previous_stage?: number | null
          to_stage_id: string
        }
        Update: {
          changed_at?: string
          changed_by_id?: string | null
          deal_id?: string
          from_stage_id?: string | null
          id?: string
          time_in_previous_stage?: number | null
          to_stage_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_stage_history_changed_by_id_fkey"
            columns: ["changed_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_stage_history_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_stage_history_from_stage_id_fkey"
            columns: ["from_stage_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_stage_history_to_stage_id_fkey"
            columns: ["to_stage_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_stages: {
        Row: {
          created_at: string
          created_by_id: string | null
          id: string
          is_active: boolean
          is_default: boolean
          pipeline_stage_name: string
          pipeline_type: Database["public"]["Enums"]["PipelineType"]
          stage_color: string | null
          stage_description: string | null
          stage_order: number
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          created_by_id?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          pipeline_stage_name: string
          pipeline_type: Database["public"]["Enums"]["PipelineType"]
          stage_color?: string | null
          stage_description?: string | null
          stage_order: number
          updated_at: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          created_by_id?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          pipeline_stage_name?: string
          pipeline_type?: Database["public"]["Enums"]["PipelineType"]
          stage_color?: string | null
          stage_description?: string | null
          stage_order?: number
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_stages_created_by_id_fkey"
            columns: ["created_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_stages_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      potential_configs: {
        Row: {
          color: string | null
          created_at: string
          created_by_id: string | null
          description: string | null
          id: string
          is_active: boolean
          last_updated_at: string
          last_updated_by_id: string | null
          module: Database["public"]["Enums"]["ModuleType"]
          order: number
          potential_label: string
          potential_name: string | null
          reminder_interval: number | null
          reminder_type: Database["public"]["Enums"]["ReminderType"]
          workspace_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          created_by_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          last_updated_at: string
          last_updated_by_id?: string | null
          module: Database["public"]["Enums"]["ModuleType"]
          order: number
          potential_label: string
          potential_name?: string | null
          reminder_interval?: number | null
          reminder_type?: Database["public"]["Enums"]["ReminderType"]
          workspace_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          created_by_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          last_updated_at?: string
          last_updated_by_id?: string | null
          module?: Database["public"]["Enums"]["ModuleType"]
          order?: number
          potential_label?: string
          potential_name?: string | null
          reminder_interval?: number | null
          reminder_type?: Database["public"]["Enums"]["ReminderType"]
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "potential_configs_created_by_id_fkey"
            columns: ["created_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "potential_configs_last_updated_by_id_fkey"
            columns: ["last_updated_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "potential_configs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          avg_rental_price_sqm: number | null
          avg_sale_price_sqm: number | null
          best_direction: string | null
          best_unit_position: string | null
          best_view: string | null
          bts: string | null
          comparable_projects: string[] | null
          created_at: string
          created_by_id: string | null
          developer: string | null
          facilities: string[] | null
          floor_to_ceiling_height: number | null
          google_maps_link: string | null
          household_nationality_ratio: string | null
          id: string
          juristic_company: string | null
          last_updated_at: string
          last_updated_by_id: string | null
          maintenance_fee: number | null
          maintenance_fee_collection_ratio: string | null
          maintenance_fee_payment_terms: string | null
          matching_tags: string[] | null
          max_units_per_floor: number | null
          mrt: string | null
          nearest_station_distance: string | null
          nearest_station_transport: string | null
          nearest_station_type: string | null
          number_of_buildings: number | null
          number_of_floors: number | null
          number_of_units: number | null
          parking_slot_ratio: string | null
          parking_slot_trade_allow: boolean | null
          project_name_english: string
          project_name_thai: string
          project_segment: string | null
          property_type: Database["public"]["Enums"]["PropertyType"]
          strengths: string | null
          target_customer_group: string | null
          unit_types: string[] | null
          weaknesses: string | null
          workspace_id: string
          year_built: number | null
          zone_id: string | null
        }
        Insert: {
          avg_rental_price_sqm?: number | null
          avg_sale_price_sqm?: number | null
          best_direction?: string | null
          best_unit_position?: string | null
          best_view?: string | null
          bts?: string | null
          comparable_projects?: string[] | null
          created_at?: string
          created_by_id?: string | null
          developer?: string | null
          facilities?: string[] | null
          floor_to_ceiling_height?: number | null
          google_maps_link?: string | null
          household_nationality_ratio?: string | null
          id?: string
          juristic_company?: string | null
          last_updated_at: string
          last_updated_by_id?: string | null
          maintenance_fee?: number | null
          maintenance_fee_collection_ratio?: string | null
          maintenance_fee_payment_terms?: string | null
          matching_tags?: string[] | null
          max_units_per_floor?: number | null
          mrt?: string | null
          nearest_station_distance?: string | null
          nearest_station_transport?: string | null
          nearest_station_type?: string | null
          number_of_buildings?: number | null
          number_of_floors?: number | null
          number_of_units?: number | null
          parking_slot_ratio?: string | null
          parking_slot_trade_allow?: boolean | null
          project_name_english: string
          project_name_thai: string
          project_segment?: string | null
          property_type: Database["public"]["Enums"]["PropertyType"]
          strengths?: string | null
          target_customer_group?: string | null
          unit_types?: string[] | null
          weaknesses?: string | null
          workspace_id: string
          year_built?: number | null
          zone_id?: string | null
        }
        Update: {
          avg_rental_price_sqm?: number | null
          avg_sale_price_sqm?: number | null
          best_direction?: string | null
          best_unit_position?: string | null
          best_view?: string | null
          bts?: string | null
          comparable_projects?: string[] | null
          created_at?: string
          created_by_id?: string | null
          developer?: string | null
          facilities?: string[] | null
          floor_to_ceiling_height?: number | null
          google_maps_link?: string | null
          household_nationality_ratio?: string | null
          id?: string
          juristic_company?: string | null
          last_updated_at?: string
          last_updated_by_id?: string | null
          maintenance_fee?: number | null
          maintenance_fee_collection_ratio?: string | null
          maintenance_fee_payment_terms?: string | null
          matching_tags?: string[] | null
          max_units_per_floor?: number | null
          mrt?: string | null
          nearest_station_distance?: string | null
          nearest_station_transport?: string | null
          nearest_station_type?: string | null
          number_of_buildings?: number | null
          number_of_floors?: number | null
          number_of_units?: number | null
          parking_slot_ratio?: string | null
          parking_slot_trade_allow?: boolean | null
          project_name_english?: string
          project_name_thai?: string
          project_segment?: string | null
          property_type?: Database["public"]["Enums"]["PropertyType"]
          strengths?: string | null
          target_customer_group?: string | null
          unit_types?: string[] | null
          weaknesses?: string | null
          workspace_id?: string
          year_built?: number | null
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_created_by_id_fkey"
            columns: ["created_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_last_updated_by_id_fkey"
            columns: ["last_updated_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_filters: {
        Row: {
          created_at: string
          filter_config: Json
          filter_name: string
          id: string
          is_shared: boolean
          module: Database["public"]["Enums"]["ModuleType"]
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          filter_config: Json
          filter_name: string
          id?: string
          is_shared?: boolean
          module: Database["public"]["Enums"]["ModuleType"]
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          filter_config?: Json
          filter_name?: string
          id?: string
          is_shared?: boolean
          module?: Database["public"]["Enums"]["ModuleType"]
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_filters_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_filters_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      stage_action_playbooks: {
        Row: {
          action_description: string | null
          action_label: string
          action_template: string | null
          action_type: Database["public"]["Enums"]["PlaybookActionType"]
          created_at: string
          created_by_id: string | null
          id: string
          is_active: boolean
          is_required: boolean
          last_updated_at: string
          last_updated_by_id: string | null
          order: number
          override_interval_days: number | null
          pipeline_stage_id: string
          pipeline_type: Database["public"]["Enums"]["PipelineType"]
          reminder_override: boolean
          workspace_id: string
        }
        Insert: {
          action_description?: string | null
          action_label: string
          action_template?: string | null
          action_type: Database["public"]["Enums"]["PlaybookActionType"]
          created_at?: string
          created_by_id?: string | null
          id?: string
          is_active?: boolean
          is_required?: boolean
          last_updated_at: string
          last_updated_by_id?: string | null
          order: number
          override_interval_days?: number | null
          pipeline_stage_id: string
          pipeline_type: Database["public"]["Enums"]["PipelineType"]
          reminder_override?: boolean
          workspace_id: string
        }
        Update: {
          action_description?: string | null
          action_label?: string
          action_template?: string | null
          action_type?: Database["public"]["Enums"]["PlaybookActionType"]
          created_at?: string
          created_by_id?: string | null
          id?: string
          is_active?: boolean
          is_required?: boolean
          last_updated_at?: string
          last_updated_by_id?: string | null
          order?: number
          override_interval_days?: number | null
          pipeline_stage_id?: string
          pipeline_type?: Database["public"]["Enums"]["PipelineType"]
          reminder_override?: boolean
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stage_action_playbooks_created_by_id_fkey"
            columns: ["created_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stage_action_playbooks_last_updated_by_id_fkey"
            columns: ["last_updated_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stage_action_playbooks_pipeline_stage_id_fkey"
            columns: ["pipeline_stage_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stage_action_playbooks_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string
          created_by_id: string | null
          id: string
          tag_color: string | null
          tag_name: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          created_by_id?: string | null
          id?: string
          tag_color?: string | null
          tag_name: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          created_by_id?: string | null
          id?: string
          tag_color?: string | null
          tag_name?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tags_created_by_id_fkey"
            columns: ["created_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tags_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          is_active: boolean
          last_login_at: string | null
          last_name: string
          line_id: string | null
          phone: string | null
          profile_photo_url: string | null
          role: Database["public"]["Enums"]["UserRole"]
          workspace_id: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          last_name: string
          line_id?: string | null
          phone?: string | null
          profile_photo_url?: string | null
          role: Database["public"]["Enums"]["UserRole"]
          workspace_id: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          last_name?: string
          line_id?: string | null
          phone?: string | null
          profile_photo_url?: string | null
          role?: Database["public"]["Enums"]["UserRole"]
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      website_pages: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_published: boolean
          meta_description: string | null
          meta_title: string | null
          og_image_url: string | null
          page_title: string
          page_type: Database["public"]["Enums"]["WebsitePageType"]
          slug: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          display_order: number
          id?: string
          is_published?: boolean
          meta_description?: string | null
          meta_title?: string | null
          og_image_url?: string | null
          page_title: string
          page_type: Database["public"]["Enums"]["WebsitePageType"]
          slug: string
          updated_at: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_published?: boolean
          meta_description?: string | null
          meta_title?: string | null
          og_image_url?: string | null
          page_title?: string
          page_type?: Database["public"]["Enums"]["WebsitePageType"]
          slug?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "website_pages_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      website_sections: {
        Row: {
          content_config: Json
          created_at: string
          display_order: number
          id: string
          is_visible: boolean
          page_id: string
          section_type: Database["public"]["Enums"]["WebsiteSectionType"]
          updated_at: string
        }
        Insert: {
          content_config: Json
          created_at?: string
          display_order: number
          id?: string
          is_visible?: boolean
          page_id: string
          section_type: Database["public"]["Enums"]["WebsiteSectionType"]
          updated_at: string
        }
        Update: {
          content_config?: Json
          created_at?: string
          display_order?: number
          id?: string
          is_visible?: boolean
          page_id?: string
          section_type?: Database["public"]["Enums"]["WebsiteSectionType"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "website_sections_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "website_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_invitations: {
        Row: {
          email: string
          id: string
          invited_at: string
          role: Database["public"]["Enums"]["UserRole"]
          status: Database["public"]["Enums"]["InvitationStatus"]
          workspace_id: string
        }
        Insert: {
          email: string
          id?: string
          invited_at?: string
          role: Database["public"]["Enums"]["UserRole"]
          status?: Database["public"]["Enums"]["InvitationStatus"]
          workspace_id: string
        }
        Update: {
          email?: string
          id?: string
          invited_at?: string
          role?: Database["public"]["Enums"]["UserRole"]
          status?: Database["public"]["Enums"]["InvitationStatus"]
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_invitations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          id: string
          industry: string
          line_notify_token: string | null
          logo_url: string | null
          plan_tier: Database["public"]["Enums"]["PlanTier"]
          primary_color: string | null
          subscription_renewed_at: string | null
          subscription_status: Database["public"]["Enums"]["SubscriptionStatus"]
          workspace_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          industry?: string
          line_notify_token?: string | null
          logo_url?: string | null
          plan_tier?: Database["public"]["Enums"]["PlanTier"]
          primary_color?: string | null
          subscription_renewed_at?: string | null
          subscription_status?: Database["public"]["Enums"]["SubscriptionStatus"]
          workspace_name: string
        }
        Update: {
          created_at?: string
          id?: string
          industry?: string
          line_notify_token?: string | null
          logo_url?: string | null
          plan_tier?: Database["public"]["Enums"]["PlanTier"]
          primary_color?: string | null
          subscription_renewed_at?: string | null
          subscription_status?: Database["public"]["Enums"]["SubscriptionStatus"]
          workspace_name?: string
        }
        Relationships: []
      }
      zones: {
        Row: {
          id: string
          zone_name_english: string
          zone_name_thai: string
        }
        Insert: {
          id?: string
          zone_name_english: string
          zone_name_thai: string
        }
        Update: {
          id?: string
          zone_name_english?: string
          zone_name_thai?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_auth_workspace_id: { Args: never; Returns: string }
      get_my_workspace_id: { Args: never; Returns: string }
    }
    Enums: {
      ActionType:
        | "CREATED"
        | "UPDATED"
        | "DELETED"
        | "ARCHIVED"
        | "RESTORED"
        | "STATUS_CHANGED"
        | "STAGE_CHANGED"
        | "COMMENT_ADDED"
        | "MENTION"
        | "PHOTO_UPLOADED"
        | "LOGIN"
        | "EXPORT"
      AgreementStatus: "ACTIVE" | "EXPIRED" | "RENEWED" | "CANCELLED"
      AIQueryType:
        | "CONVERSATIONAL"
        | "REPORT_GENERATION"
        | "AUTOFILL"
        | "AGENT_ASSISTANT"
      AIReportType: "MARKETING_REPORT" | "LISTING_COMPARISON"
      CommissionType: "PERCENTAGE" | "FIXED_FEE"
      ContactSource:
        | "LINE"
        | "WEBSITE"
        | "REFERRAL"
        | "FACEBOOK"
        | "WALK_IN"
        | "COLD_CALL"
      ContactStatus:
        | "ACTIVE"
        | "ON_HOLD"
        | "CLOSED_WON"
        | "CLOSED_LOST"
        | "UNQUALIFIED"
        | "REACTIVATE"
      CustomFieldType:
        | "TEXT"
        | "NUMBER"
        | "DATE"
        | "DROPDOWN"
        | "MULTI_SELECT"
        | "BOOLEAN"
        | "URL"
      DealStatus: "ACTIVE" | "ON_HOLD" | "CLOSED_WON" | "CLOSED_LOST"
      DealType: "BUY_SIDE" | "SELL_SIDE"
      DeliveredVia: "NONE" | "EMAIL" | "LINE" | "BOTH"
      EntityType:
        | "LISTING"
        | "DEAL"
        | "CONTACT"
        | "PROJECT"
        | "PIPELINE_STAGE"
        | "USER"
        | "WORKSPACE"
        | "WEBSITE"
        | "GENERAL"
      FileType: "IMAGE" | "DOCUMENT" | "VIDEO"
      FinancingMethod: "CASH" | "MORTGAGE" | "MIXED"
      InvitationStatus: "PENDING" | "ACCEPTED" | "REVOKED"
      ListingGrade: "A" | "B" | "C" | "D"
      ListingStatus:
        | "NEW"
        | "ACTIVE"
        | "RESERVED"
        | "SOLD"
        | "EXPIRED"
        | "WITHDRAWN"
      ListingType: "SELL" | "RENT" | "SELL_AND_RENT"
      MatchStatus: "NEW" | "SENT" | "VIEWED" | "INTERESTED" | "NOT_INTERESTED"
      ModuleType:
        | "LISTINGS"
        | "BUYER_CRM"
        | "SELLER_CRM"
        | "CRM"
        | "CONTACTS"
        | "DEALS"
      NotificationType:
        | "ACTION_REMINDER"
        | "LISTING_EXPIRY"
        | "STAGE_CHANGE"
        | "MENTION"
        | "SMART_MATCH"
      PipelineType: "BUYER" | "SELLER"
      PlanTier: "FREE" | "SOLO" | "TEAM" | "AGENCY"
      PlaybookActionType:
        | "CALL"
        | "LINE_MESSAGE"
        | "EMAIL"
        | "SITE_VISIT"
        | "SEND_REPORT"
        | "SEND_LISTING"
        | "SCHEDULE_VIEWING"
        | "SEND_CONTRACT"
        | "INTERNAL_NOTE"
        | "CUSTOM"
      PotentialTierValue: "A" | "B" | "C" | "D"
      PropertyType:
        | "HOUSE"
        | "CONDO"
        | "TOWNHOUSE"
        | "LAND"
        | "COMMERCIAL"
        | "OTHER"
      PurchasePurpose: "OWN_USE" | "INVESTMENT" | "BOTH"
      ReminderType:
        | "NOTIFICATION_ONLY"
        | "NOTIFICATION_LINE"
        | "NOTIFICATION_EMAIL"
      SubscriptionStatus: "ACTIVE" | "INACTIVE" | "CANCELLED" | "PAST_DUE"
      Timeline:
        | "IMMEDIATE"
        | "ONE_TO_THREE_MONTHS"
        | "THREE_TO_SIX_MONTHS"
        | "SIX_PLUS_MONTHS"
      UserRole: "OWNER" | "ADMIN" | "CO_WORKER" | "LISTING_SUPPORT"
      WebsitePageType:
        | "HOMEPAGE"
        | "LISTING_SEARCH"
        | "LISTING_DETAIL"
        | "ABOUT"
        | "BLOG"
        | "CONTACT"
        | "CUSTOM"
      WebsiteSectionType:
        | "HERO"
        | "LISTING_GRID"
        | "FEATURED_LISTINGS"
        | "ABOUT"
        | "TEAM"
        | "TESTIMONIALS"
        | "STATS"
        | "CTA"
        | "BLOG_FEED"
        | "CONTACT_FORM"
        | "CUSTOM_HTML"
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
      ActionType: [
        "CREATED",
        "UPDATED",
        "DELETED",
        "ARCHIVED",
        "RESTORED",
        "STATUS_CHANGED",
        "STAGE_CHANGED",
        "COMMENT_ADDED",
        "MENTION",
        "PHOTO_UPLOADED",
        "LOGIN",
        "EXPORT",
      ],
      AgreementStatus: ["ACTIVE", "EXPIRED", "RENEWED", "CANCELLED"],
      AIQueryType: [
        "CONVERSATIONAL",
        "REPORT_GENERATION",
        "AUTOFILL",
        "AGENT_ASSISTANT",
      ],
      AIReportType: ["MARKETING_REPORT", "LISTING_COMPARISON"],
      CommissionType: ["PERCENTAGE", "FIXED_FEE"],
      ContactSource: [
        "LINE",
        "WEBSITE",
        "REFERRAL",
        "FACEBOOK",
        "WALK_IN",
        "COLD_CALL",
      ],
      ContactStatus: [
        "ACTIVE",
        "ON_HOLD",
        "CLOSED_WON",
        "CLOSED_LOST",
        "UNQUALIFIED",
        "REACTIVATE",
      ],
      CustomFieldType: [
        "TEXT",
        "NUMBER",
        "DATE",
        "DROPDOWN",
        "MULTI_SELECT",
        "BOOLEAN",
        "URL",
      ],
      DealStatus: ["ACTIVE", "ON_HOLD", "CLOSED_WON", "CLOSED_LOST"],
      DealType: ["BUY_SIDE", "SELL_SIDE"],
      DeliveredVia: ["NONE", "EMAIL", "LINE", "BOTH"],
      EntityType: [
        "LISTING",
        "DEAL",
        "CONTACT",
        "PROJECT",
        "PIPELINE_STAGE",
        "USER",
        "WORKSPACE",
        "WEBSITE",
        "GENERAL",
      ],
      FileType: ["IMAGE", "DOCUMENT", "VIDEO"],
      FinancingMethod: ["CASH", "MORTGAGE", "MIXED"],
      InvitationStatus: ["PENDING", "ACCEPTED", "REVOKED"],
      ListingGrade: ["A", "B", "C", "D"],
      ListingStatus: [
        "NEW",
        "ACTIVE",
        "RESERVED",
        "SOLD",
        "EXPIRED",
        "WITHDRAWN",
      ],
      ListingType: ["SELL", "RENT", "SELL_AND_RENT"],
      MatchStatus: ["NEW", "SENT", "VIEWED", "INTERESTED", "NOT_INTERESTED"],
      ModuleType: [
        "LISTINGS",
        "BUYER_CRM",
        "SELLER_CRM",
        "CRM",
        "CONTACTS",
        "DEALS",
      ],
      NotificationType: [
        "ACTION_REMINDER",
        "LISTING_EXPIRY",
        "STAGE_CHANGE",
        "MENTION",
        "SMART_MATCH",
      ],
      PipelineType: ["BUYER", "SELLER"],
      PlanTier: ["FREE", "SOLO", "TEAM", "AGENCY"],
      PlaybookActionType: [
        "CALL",
        "LINE_MESSAGE",
        "EMAIL",
        "SITE_VISIT",
        "SEND_REPORT",
        "SEND_LISTING",
        "SCHEDULE_VIEWING",
        "SEND_CONTRACT",
        "INTERNAL_NOTE",
        "CUSTOM",
      ],
      PotentialTierValue: ["A", "B", "C", "D"],
      PropertyType: [
        "HOUSE",
        "CONDO",
        "TOWNHOUSE",
        "LAND",
        "COMMERCIAL",
        "OTHER",
      ],
      PurchasePurpose: ["OWN_USE", "INVESTMENT", "BOTH"],
      ReminderType: [
        "NOTIFICATION_ONLY",
        "NOTIFICATION_LINE",
        "NOTIFICATION_EMAIL",
      ],
      SubscriptionStatus: ["ACTIVE", "INACTIVE", "CANCELLED", "PAST_DUE"],
      Timeline: [
        "IMMEDIATE",
        "ONE_TO_THREE_MONTHS",
        "THREE_TO_SIX_MONTHS",
        "SIX_PLUS_MONTHS",
      ],
      UserRole: ["OWNER", "ADMIN", "CO_WORKER", "LISTING_SUPPORT"],
      WebsitePageType: [
        "HOMEPAGE",
        "LISTING_SEARCH",
        "LISTING_DETAIL",
        "ABOUT",
        "BLOG",
        "CONTACT",
        "CUSTOM",
      ],
      WebsiteSectionType: [
        "HERO",
        "LISTING_GRID",
        "FEATURED_LISTINGS",
        "ABOUT",
        "TEAM",
        "TESTIMONIALS",
        "STATS",
        "CTA",
        "BLOG_FEED",
        "CONTACT_FORM",
        "CUSTOM_HTML",
      ],
    },
  },
} as const
