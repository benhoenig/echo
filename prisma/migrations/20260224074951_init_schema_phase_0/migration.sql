-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('FREE', 'SOLO', 'TEAM', 'AGENCY');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'CANCELLED', 'PAST_DUE');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OWNER', 'ADMIN', 'CO_WORKER', 'LISTING_SUPPORT');

-- CreateEnum
CREATE TYPE "ContactSource" AS ENUM ('LINE', 'WEBSITE', 'REFERRAL', 'FACEBOOK', 'WALK_IN', 'COLD_CALL');

-- CreateEnum
CREATE TYPE "PotentialTierValue" AS ENUM ('A', 'B', 'C', 'D');

-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('ACTIVE', 'ON_HOLD', 'CLOSED_WON', 'CLOSED_LOST', 'UNQUALIFIED', 'REACTIVATE');

-- CreateEnum
CREATE TYPE "Timeline" AS ENUM ('IMMEDIATE', 'ONE_TO_THREE_MONTHS', 'THREE_TO_SIX_MONTHS', 'SIX_PLUS_MONTHS');

-- CreateEnum
CREATE TYPE "PurchasePurpose" AS ENUM ('OWN_USE', 'INVESTMENT', 'BOTH');

-- CreateEnum
CREATE TYPE "FinancingMethod" AS ENUM ('CASH', 'MORTGAGE', 'MIXED');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('HOUSE', 'CONDO', 'TOWNHOUSE', 'LAND', 'COMMERCIAL', 'OTHER');

-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('SELL', 'RENT', 'SELL_AND_RENT');

-- CreateEnum
CREATE TYPE "ListingGrade" AS ENUM ('A', 'B', 'C', 'D');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('NEW', 'ACTIVE', 'RESERVED', 'SOLD', 'EXPIRED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "DealType" AS ENUM ('BUY_SIDE', 'SELL_SIDE');

-- CreateEnum
CREATE TYPE "DealStatus" AS ENUM ('ACTIVE', 'ON_HOLD', 'CLOSED_WON', 'CLOSED_LOST');

-- CreateEnum
CREATE TYPE "PipelineType" AS ENUM ('BUYER', 'SELLER');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('LISTING', 'DEAL', 'CONTACT', 'PROJECT', 'PIPELINE_STAGE', 'USER', 'WORKSPACE', 'WEBSITE', 'GENERAL');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('CREATED', 'UPDATED', 'DELETED', 'ARCHIVED', 'RESTORED', 'STATUS_CHANGED', 'STAGE_CHANGED', 'COMMENT_ADDED', 'MENTION', 'PHOTO_UPLOADED', 'LOGIN', 'EXPORT');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ACTION_REMINDER', 'LISTING_EXPIRY', 'STAGE_CHANGE', 'MENTION', 'SMART_MATCH');

-- CreateEnum
CREATE TYPE "ModuleType" AS ENUM ('LISTINGS', 'BUYER_CRM', 'SELLER_CRM', 'CRM', 'CONTACTS', 'DEALS');

-- CreateEnum
CREATE TYPE "ReminderType" AS ENUM ('NOTIFICATION_ONLY', 'NOTIFICATION_LINE', 'NOTIFICATION_EMAIL');

-- CreateEnum
CREATE TYPE "PlaybookActionType" AS ENUM ('CALL', 'LINE_MESSAGE', 'EMAIL', 'SITE_VISIT', 'SEND_REPORT', 'SEND_LISTING', 'SCHEDULE_VIEWING', 'SEND_CONTRACT', 'INTERNAL_NOTE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "CommissionType" AS ENUM ('PERCENTAGE', 'FIXED_FEE');

-- CreateEnum
CREATE TYPE "AgreementStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'RENEWED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('NEW', 'SENT', 'VIEWED', 'INTERESTED', 'NOT_INTERESTED');

-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('IMAGE', 'DOCUMENT', 'VIDEO');

-- CreateEnum
CREATE TYPE "CustomFieldType" AS ENUM ('TEXT', 'NUMBER', 'DATE', 'DROPDOWN', 'MULTI_SELECT', 'BOOLEAN', 'URL');

-- CreateEnum
CREATE TYPE "WebsitePageType" AS ENUM ('HOMEPAGE', 'LISTING_SEARCH', 'LISTING_DETAIL', 'ABOUT', 'BLOG', 'CONTACT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "WebsiteSectionType" AS ENUM ('HERO', 'LISTING_GRID', 'FEATURED_LISTINGS', 'ABOUT', 'TEAM', 'TESTIMONIALS', 'STATS', 'CTA', 'BLOG_FEED', 'CONTACT_FORM', 'CUSTOM_HTML');

-- CreateEnum
CREATE TYPE "DeliveredVia" AS ENUM ('NONE', 'EMAIL', 'LINE', 'BOTH');

-- CreateEnum
CREATE TYPE "AIReportType" AS ENUM ('MARKETING_REPORT', 'LISTING_COMPARISON');

-- CreateEnum
CREATE TYPE "AIQueryType" AS ENUM ('CONVERSATIONAL', 'REPORT_GENERATION', 'AUTOFILL', 'AGENT_ASSISTANT');

-- CreateTable
CREATE TABLE "workspaces" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_name" TEXT NOT NULL,
    "plan_tier" "PlanTier" NOT NULL DEFAULT 'FREE',
    "industry" TEXT NOT NULL DEFAULT 'Real Estate',
    "logo_url" TEXT,
    "primary_color" TEXT,
    "line_notify_token" TEXT,
    "subscription_status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "subscription_renewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "line_id" TEXT,
    "role" "UserRole" NOT NULL,
    "profile_photo_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID NOT NULL,
    "contact_type" TEXT[],
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "nickname" TEXT,
    "phone_primary" TEXT,
    "phone_secondary" TEXT,
    "line_id" TEXT,
    "email" TEXT,
    "nationality" TEXT,
    "id_card_or_passport_no" TEXT,
    "contact_source" "ContactSource",
    "referred_by_id" UUID,
    "assigned_to_id" UUID,
    "potential_tier" "PotentialTierValue",
    "contact_status" "ContactStatus",
    "tags" TEXT[],
    "notes" TEXT,
    "budget_min" DOUBLE PRECISION,
    "budget_max" DOUBLE PRECISION,
    "preferred_zone_ids" TEXT[],
    "preferred_property_type" "PropertyType"[],
    "preferred_bedrooms" INTEGER,
    "preferred_size_min" DOUBLE PRECISION,
    "preferred_size_max" DOUBLE PRECISION,
    "preferred_floor_min" INTEGER,
    "preferred_floor_max" INTEGER,
    "preferred_facilities" TEXT[],
    "has_pet" BOOLEAN,
    "has_ev_car" BOOLEAN,
    "parking_slots_needed" INTEGER,
    "pain_points" TEXT,
    "special_requirements" TEXT,
    "timeline" "Timeline",
    "purpose_of_purchase" "PurchasePurpose",
    "financing_method" "FinancingMethod",
    "pre_approved_amount" DOUBLE PRECISION,
    "pre_approval_expiry_date" DATE,
    "last_contacted_at" TIMESTAMP(3),
    "last_action_date" TIMESTAMP(3),
    "action_reminder_interval" INTEGER,
    "reactivate_on" DATE,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" UUID,
    "last_updated_at" TIMESTAMP(3) NOT NULL,
    "last_updated_by_id" UUID,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID NOT NULL,
    "listing_name" TEXT NOT NULL,
    "project_id" UUID,
    "project_name" TEXT,
    "in_project" BOOLEAN NOT NULL DEFAULT true,
    "property_type" "PropertyType" NOT NULL,
    "listing_type" "ListingType" NOT NULL,
    "listing_grade" "ListingGrade",
    "listing_status" "ListingStatus" NOT NULL DEFAULT 'NEW',
    "exclusive_agreement" BOOLEAN NOT NULL DEFAULT false,
    "seller_contact_id" UUID,
    "seller_phone" TEXT,
    "seller_line" TEXT,
    "street_soi" TEXT,
    "zone" TEXT,
    "bts" TEXT,
    "mrt" TEXT,
    "unit_no" TEXT,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "size_rai" DOUBLE PRECISION,
    "size_ngan" DOUBLE PRECISION,
    "size_wa" DOUBLE PRECISION,
    "size_sqm" DOUBLE PRECISION,
    "floor" INTEGER,
    "stories" INTEGER,
    "building" TEXT,
    "view" TEXT,
    "direction" TEXT,
    "parking_slots" INTEGER,
    "maids_room" BOOLEAN,
    "unit_condition" TEXT,
    "asking_price" DOUBLE PRECISION,
    "price_remark" TEXT,
    "rental_price" DOUBLE PRECISION,
    "rental_remark" TEXT,
    "matching_tags" TEXT[],
    "google_maps_link" TEXT,
    "agreement_file_url" TEXT,
    "unit_photos" TEXT[],
    "media_files_url" TEXT[],
    "ddproperty_url" TEXT,
    "livinginsider_url" TEXT,
    "propertyhub_url" TEXT,
    "facebook_group_url" TEXT,
    "facebook_page_url" TEXT,
    "tiktok_url" TEXT,
    "instagram_url" TEXT,
    "youtube_url" TEXT,
    "marketing_report_url" TEXT,
    "commission_rate" DOUBLE PRECISION,
    "featured_flag" BOOLEAN NOT NULL DEFAULT false,
    "focus_flag" BOOLEAN NOT NULL DEFAULT false,
    "website_visible" BOOLEAN NOT NULL DEFAULT false,
    "days_on_market" INTEGER,
    "asking_price_history" JSONB,
    "listing_status_changed_at" TIMESTAMP(3),
    "last_action_date" TIMESTAMP(3),
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "created_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_updated_by_id" UUID,
    "last_updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_updates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "listing_id" UUID NOT NULL,
    "status" TEXT NOT NULL,
    "field_changed" TEXT NOT NULL,
    "old_value" TEXT,
    "new_value" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by_id" UUID,

    CONSTRAINT "listing_updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID NOT NULL,
    "project_name_thai" TEXT NOT NULL,
    "project_name_english" TEXT NOT NULL,
    "property_type" "PropertyType" NOT NULL,
    "zone_id" UUID,
    "bts" TEXT,
    "mrt" TEXT,
    "matching_tags" TEXT[],
    "developer" TEXT,
    "year_built" INTEGER,
    "number_of_buildings" INTEGER,
    "number_of_floors" INTEGER,
    "number_of_units" INTEGER,
    "parking_slot_ratio" TEXT,
    "parking_slot_trade_allow" BOOLEAN,
    "facilities" TEXT[],
    "maintenance_fee" DOUBLE PRECISION,
    "maintenance_fee_payment_terms" TEXT,
    "maintenance_fee_collection_ratio" TEXT,
    "juristic_company" TEXT,
    "avg_sale_price_sqm" DOUBLE PRECISION,
    "avg_rental_price_sqm" DOUBLE PRECISION,
    "unit_types" TEXT[],
    "floor_to_ceiling_height" DOUBLE PRECISION,
    "max_units_per_floor" INTEGER,
    "project_segment" TEXT,
    "comparable_projects" TEXT[],
    "best_view" TEXT,
    "best_direction" TEXT,
    "best_unit_position" TEXT,
    "household_nationality_ratio" TEXT,
    "nearest_station_type" TEXT,
    "nearest_station_distance" TEXT,
    "nearest_station_transport" TEXT,
    "target_customer_group" TEXT,
    "strengths" TEXT,
    "weaknesses" TEXT,
    "google_maps_link" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" UUID,
    "last_updated_at" TIMESTAMP(3) NOT NULL,
    "last_updated_by_id" UUID,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zones" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "zone_name_english" TEXT NOT NULL,
    "zone_name_thai" TEXT NOT NULL,

    CONSTRAINT "zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID NOT NULL,
    "deal_name" TEXT NOT NULL,
    "deal_type" "DealType" NOT NULL,
    "buyer_contact_id" UUID,
    "seller_contact_id" UUID,
    "listing_id" UUID,
    "pipeline_stage_id" UUID NOT NULL,
    "deal_status" "DealStatus" NOT NULL DEFAULT 'ACTIVE',
    "closed_lost_reason" TEXT,
    "lead_source" "ContactSource",
    "estimated_deal_value" DOUBLE PRECISION,
    "commission_rate" DOUBLE PRECISION,
    "estimated_commission" DOUBLE PRECISION,
    "notes" TEXT,
    "assigned_to_id" UUID,
    "last_action_date" TIMESTAMP(3),
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" UUID,
    "last_updated_at" TIMESTAMP(3) NOT NULL,
    "last_updated_by_id" UUID,

    CONSTRAINT "deals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pipeline_stages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID NOT NULL,
    "pipeline_stage_name" TEXT NOT NULL,
    "pipeline_type" "PipelineType" NOT NULL,
    "stage_order" INTEGER NOT NULL,
    "stage_color" TEXT,
    "stage_description" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pipeline_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pipeline_stage_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "deal_id" UUID NOT NULL,
    "from_stage_id" UUID,
    "to_stage_id" UUID NOT NULL,
    "changed_by_id" UUID,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "time_in_previous_stage" INTEGER,

    CONSTRAINT "pipeline_stage_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "entity_type" "EntityType" NOT NULL,
    "entity_id" UUID NOT NULL,
    "author_user_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "mentions" UUID[],
    "tagged_listing_id" UUID,
    "tagged_contact_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "edited_at" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID NOT NULL,
    "entity_type" "EntityType" NOT NULL,
    "entity_id" UUID NOT NULL,
    "action_type" "ActionType" NOT NULL,
    "actor_user_id" UUID,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "entity_type" "EntityType" NOT NULL,
    "entity_id" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "potential_configs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID NOT NULL,
    "module" "ModuleType" NOT NULL,
    "potential_label" TEXT NOT NULL,
    "potential_name" TEXT,
    "color" TEXT,
    "reminder_interval" INTEGER,
    "reminder_type" "ReminderType" NOT NULL DEFAULT 'NOTIFICATION_ONLY',
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" UUID,
    "last_updated_at" TIMESTAMP(3) NOT NULL,
    "last_updated_by_id" UUID,

    CONSTRAINT "potential_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stage_action_playbooks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID NOT NULL,
    "pipeline_type" "PipelineType" NOT NULL,
    "pipeline_stage_id" UUID NOT NULL,
    "action_type" "PlaybookActionType" NOT NULL,
    "action_label" TEXT NOT NULL,
    "action_description" TEXT,
    "action_template" TEXT,
    "reminder_override" BOOLEAN NOT NULL DEFAULT false,
    "override_interval_days" INTEGER,
    "order" INTEGER NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" UUID,
    "last_updated_at" TIMESTAMP(3) NOT NULL,
    "last_updated_by_id" UUID,

    CONSTRAINT "stage_action_playbooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_filters" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "module" "ModuleType" NOT NULL,
    "filter_name" TEXT NOT NULL,
    "filter_config" JSONB NOT NULL,
    "is_shared" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_filters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exclusive_agreements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "listing_id" UUID NOT NULL,
    "seller_contact_id" UUID,
    "assigned_agent_id" UUID,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "commission_rate" DOUBLE PRECISION,
    "commission_type" "CommissionType" NOT NULL DEFAULT 'PERCENTAGE',
    "fixed_fee_amount" DOUBLE PRECISION,
    "agreement_status" "AgreementStatus" NOT NULL DEFAULT 'ACTIVE',
    "renewal_count" INTEGER NOT NULL DEFAULT 0,
    "previous_agreement_id" UUID,
    "agreement_file_url" TEXT,
    "notes" TEXT,
    "reminder_days_before" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" UUID,
    "last_updated_at" TIMESTAMP(3) NOT NULL,
    "last_updated_by_id" UUID,

    CONSTRAINT "exclusive_agreements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_contact_matches" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "listing_id" UUID NOT NULL,
    "contact_id" UUID NOT NULL,
    "match_score" DOUBLE PRECISION NOT NULL,
    "matched_fields" JSONB NOT NULL,
    "match_status" "MatchStatus" NOT NULL DEFAULT 'NEW',
    "matched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listing_contact_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_type" "FileType" NOT NULL,
    "file_size_bytes" INTEGER NOT NULL,
    "entity_type" "EntityType" NOT NULL,
    "entity_id" UUID,
    "display_order" INTEGER,
    "watermarked_url" TEXT,
    "uploaded_by_id" UUID,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_field_definitions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID NOT NULL,
    "module" "ModuleType" NOT NULL,
    "field_name" TEXT NOT NULL,
    "field_type" "CustomFieldType" NOT NULL,
    "dropdown_options" JSONB,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "custom_field_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_field_values" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "field_id" UUID NOT NULL,
    "entity_type" "EntityType" NOT NULL,
    "entity_id" UUID NOT NULL,
    "value" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by_id" UUID,

    CONSTRAINT "custom_field_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID NOT NULL,
    "tag_name" TEXT NOT NULL,
    "tag_color" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" UUID,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID NOT NULL,
    "entity_type" "EntityType" NOT NULL,
    "entity_id" UUID NOT NULL,
    "action" "ActionType" NOT NULL,
    "field_changed" TEXT,
    "old_value" TEXT,
    "new_value" TEXT,
    "actor_user_id" UUID,
    "ip_address" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "website_pages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID NOT NULL,
    "page_type" "WebsitePageType" NOT NULL,
    "page_title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "og_image_url" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "website_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "website_sections" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "page_id" UUID NOT NULL,
    "section_type" "WebsiteSectionType" NOT NULL,
    "content_config" JSONB NOT NULL,
    "display_order" INTEGER NOT NULL,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "website_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_submissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID NOT NULL,
    "source_page_id" UUID,
    "source_listing_id" UUID,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "line_id" TEXT,
    "message" TEXT,
    "auto_created_contact_id" UUID,
    "auto_created_deal_id" UUID,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "form_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_posts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "cover_image_url" TEXT,
    "category" TEXT,
    "tags" TEXT[],
    "meta_title" TEXT,
    "meta_description" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3),
    "author_user_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_reports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID NOT NULL,
    "report_type" "AIReportType" NOT NULL,
    "report_name" TEXT NOT NULL,
    "generated_by_id" UUID,
    "config" JSONB NOT NULL,
    "output_pdf_url" TEXT,
    "delivered_via" "DeliveredVia" NOT NULL DEFAULT 'NONE',
    "delivered_to" TEXT,
    "delivered_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_query_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "query_text" TEXT NOT NULL,
    "response_text" TEXT NOT NULL,
    "data_sources_referenced" JSONB,
    "query_type" "AIQueryType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_query_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_workspace_id_idx" ON "users"("workspace_id");

-- CreateIndex
CREATE INDEX "contacts_workspace_id_idx" ON "contacts"("workspace_id");

-- CreateIndex
CREATE INDEX "contacts_phone_primary_email_idx" ON "contacts"("phone_primary", "email");

-- CreateIndex
CREATE INDEX "listings_workspace_id_idx" ON "listings"("workspace_id");

-- CreateIndex
CREATE INDEX "listings_listing_status_idx" ON "listings"("listing_status");

-- CreateIndex
CREATE INDEX "listings_created_at_idx" ON "listings"("created_at");

-- CreateIndex
CREATE INDEX "listing_updates_listing_id_idx" ON "listing_updates"("listing_id");

-- CreateIndex
CREATE INDEX "projects_workspace_id_idx" ON "projects"("workspace_id");

-- CreateIndex
CREATE INDEX "deals_workspace_id_idx" ON "deals"("workspace_id");

-- CreateIndex
CREATE INDEX "deals_pipeline_stage_id_idx" ON "deals"("pipeline_stage_id");

-- CreateIndex
CREATE INDEX "pipeline_stages_workspace_id_idx" ON "pipeline_stages"("workspace_id");

-- CreateIndex
CREATE INDEX "pipeline_stage_history_deal_id_idx" ON "pipeline_stage_history"("deal_id");

-- CreateIndex
CREATE INDEX "comments_entity_id_entity_type_idx" ON "comments"("entity_id", "entity_type");

-- CreateIndex
CREATE INDEX "activity_logs_workspace_id_idx" ON "activity_logs"("workspace_id");

-- CreateIndex
CREATE INDEX "activity_logs_entity_id_entity_type_idx" ON "activity_logs"("entity_id", "entity_type");

-- CreateIndex
CREATE INDEX "notifications_workspace_id_user_id_idx" ON "notifications"("workspace_id", "user_id");

-- CreateIndex
CREATE INDEX "potential_configs_workspace_id_idx" ON "potential_configs"("workspace_id");

-- CreateIndex
CREATE INDEX "stage_action_playbooks_workspace_id_pipeline_stage_id_idx" ON "stage_action_playbooks"("workspace_id", "pipeline_stage_id");

-- CreateIndex
CREATE INDEX "saved_filters_workspace_id_user_id_idx" ON "saved_filters"("workspace_id", "user_id");

-- CreateIndex
CREATE INDEX "exclusive_agreements_listing_id_idx" ON "exclusive_agreements"("listing_id");

-- CreateIndex
CREATE INDEX "listing_contact_matches_listing_id_contact_id_idx" ON "listing_contact_matches"("listing_id", "contact_id");

-- CreateIndex
CREATE INDEX "media_workspace_id_idx" ON "media"("workspace_id");

-- CreateIndex
CREATE INDEX "media_entity_id_entity_type_idx" ON "media"("entity_id", "entity_type");

-- CreateIndex
CREATE INDEX "custom_field_definitions_workspace_id_idx" ON "custom_field_definitions"("workspace_id");

-- CreateIndex
CREATE INDEX "custom_field_values_entity_id_entity_type_idx" ON "custom_field_values"("entity_id", "entity_type");

-- CreateIndex
CREATE INDEX "tags_workspace_id_idx" ON "tags"("workspace_id");

-- CreateIndex
CREATE INDEX "audit_logs_workspace_id_idx" ON "audit_logs"("workspace_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_id_entity_type_idx" ON "audit_logs"("entity_id", "entity_type");

-- CreateIndex
CREATE INDEX "website_pages_workspace_id_idx" ON "website_pages"("workspace_id");

-- CreateIndex
CREATE INDEX "website_sections_page_id_idx" ON "website_sections"("page_id");

-- CreateIndex
CREATE INDEX "form_submissions_workspace_id_idx" ON "form_submissions"("workspace_id");

-- CreateIndex
CREATE INDEX "blog_posts_workspace_id_idx" ON "blog_posts"("workspace_id");

-- CreateIndex
CREATE INDEX "ai_reports_workspace_id_idx" ON "ai_reports"("workspace_id");

-- CreateIndex
CREATE INDEX "ai_query_logs_workspace_id_user_id_idx" ON "ai_query_logs"("workspace_id", "user_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_referred_by_id_fkey" FOREIGN KEY ("referred_by_id") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_last_updated_by_id_fkey" FOREIGN KEY ("last_updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_seller_contact_id_fkey" FOREIGN KEY ("seller_contact_id") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_last_updated_by_id_fkey" FOREIGN KEY ("last_updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_updates" ADD CONSTRAINT "listing_updates_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_updates" ADD CONSTRAINT "listing_updates_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_last_updated_by_id_fkey" FOREIGN KEY ("last_updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_buyer_contact_id_fkey" FOREIGN KEY ("buyer_contact_id") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_seller_contact_id_fkey" FOREIGN KEY ("seller_contact_id") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_pipeline_stage_id_fkey" FOREIGN KEY ("pipeline_stage_id") REFERENCES "pipeline_stages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_last_updated_by_id_fkey" FOREIGN KEY ("last_updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pipeline_stages" ADD CONSTRAINT "pipeline_stages_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pipeline_stages" ADD CONSTRAINT "pipeline_stages_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pipeline_stage_history" ADD CONSTRAINT "pipeline_stage_history_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pipeline_stage_history" ADD CONSTRAINT "pipeline_stage_history_from_stage_id_fkey" FOREIGN KEY ("from_stage_id") REFERENCES "pipeline_stages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pipeline_stage_history" ADD CONSTRAINT "pipeline_stage_history_to_stage_id_fkey" FOREIGN KEY ("to_stage_id") REFERENCES "pipeline_stages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pipeline_stage_history" ADD CONSTRAINT "pipeline_stage_history_changed_by_id_fkey" FOREIGN KEY ("changed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_tagged_listing_id_fkey" FOREIGN KEY ("tagged_listing_id") REFERENCES "listings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_tagged_contact_id_fkey" FOREIGN KEY ("tagged_contact_id") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "potential_configs" ADD CONSTRAINT "potential_configs_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "potential_configs" ADD CONSTRAINT "potential_configs_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "potential_configs" ADD CONSTRAINT "potential_configs_last_updated_by_id_fkey" FOREIGN KEY ("last_updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stage_action_playbooks" ADD CONSTRAINT "stage_action_playbooks_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stage_action_playbooks" ADD CONSTRAINT "stage_action_playbooks_pipeline_stage_id_fkey" FOREIGN KEY ("pipeline_stage_id") REFERENCES "pipeline_stages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stage_action_playbooks" ADD CONSTRAINT "stage_action_playbooks_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stage_action_playbooks" ADD CONSTRAINT "stage_action_playbooks_last_updated_by_id_fkey" FOREIGN KEY ("last_updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_filters" ADD CONSTRAINT "saved_filters_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_filters" ADD CONSTRAINT "saved_filters_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exclusive_agreements" ADD CONSTRAINT "exclusive_agreements_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exclusive_agreements" ADD CONSTRAINT "exclusive_agreements_seller_contact_id_fkey" FOREIGN KEY ("seller_contact_id") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exclusive_agreements" ADD CONSTRAINT "exclusive_agreements_assigned_agent_id_fkey" FOREIGN KEY ("assigned_agent_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exclusive_agreements" ADD CONSTRAINT "exclusive_agreements_previous_agreement_id_fkey" FOREIGN KEY ("previous_agreement_id") REFERENCES "exclusive_agreements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exclusive_agreements" ADD CONSTRAINT "exclusive_agreements_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exclusive_agreements" ADD CONSTRAINT "exclusive_agreements_last_updated_by_id_fkey" FOREIGN KEY ("last_updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_contact_matches" ADD CONSTRAINT "listing_contact_matches_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_contact_matches" ADD CONSTRAINT "listing_contact_matches_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_field_definitions" ADD CONSTRAINT "custom_field_definitions_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_field_definitions" ADD CONSTRAINT "custom_field_definitions_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_field_values" ADD CONSTRAINT "custom_field_values_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "custom_field_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_field_values" ADD CONSTRAINT "custom_field_values_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "website_pages" ADD CONSTRAINT "website_pages_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "website_sections" ADD CONSTRAINT "website_sections_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "website_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_source_page_id_fkey" FOREIGN KEY ("source_page_id") REFERENCES "website_pages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_source_listing_id_fkey" FOREIGN KEY ("source_listing_id") REFERENCES "listings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_auto_created_contact_id_fkey" FOREIGN KEY ("auto_created_contact_id") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_auto_created_deal_id_fkey" FOREIGN KEY ("auto_created_deal_id") REFERENCES "deals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_reports" ADD CONSTRAINT "ai_reports_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_reports" ADD CONSTRAINT "ai_reports_generated_by_id_fkey" FOREIGN KEY ("generated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_query_logs" ADD CONSTRAINT "ai_query_logs_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_query_logs" ADD CONSTRAINT "ai_query_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
