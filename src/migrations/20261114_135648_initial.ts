import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_courses_schedule_weekday" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
  CREATE TYPE "public"."enum_courses_icon" AS ENUM('hatha', 'back', 'singingBowl', 'teens', 'wheel', 'sportBalance');
  CREATE TYPE "public"."enum_courses_badge_tone" AS ENUM('light', 'dark');
  CREATE TYPE "public"."enum_courses_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__courses_v_version_schedule_weekday" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
  CREATE TYPE "public"."enum__courses_v_version_icon" AS ENUM('hatha', 'back', 'singingBowl', 'teens', 'wheel', 'sportBalance');
  CREATE TYPE "public"."enum__courses_v_version_badge_tone" AS ENUM('light', 'dark');
  CREATE TYPE "public"."enum__courses_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_price_groups_blocks_badge" AS ENUM('none', 'popular', 'promo');
  CREATE TYPE "public"."enum_price_groups_blocks_action" AS ENUM('signup', 'whatsapp');
  CREATE TYPE "public"."enum_price_groups_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__price_groups_v_version_blocks_badge" AS ENUM('none', 'popular', 'promo');
  CREATE TYPE "public"."enum__price_groups_v_version_blocks_action" AS ENUM('signup', 'whatsapp');
  CREATE TYPE "public"."enum__price_groups_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_reviews_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__reviews_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_downloads_usage" AS ENUM('membership-contract', 'teacher-training-flyer');
  CREATE TYPE "public"."enum_redirects_to_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_business_settings_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__business_settings_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_teacher_training_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__teacher_training_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_legal_notice_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__legal_notice_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_privacy_policy_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__privacy_policy_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_technical_settings_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__technical_settings_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "courses_audience_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "courses_steps_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "courses_benefits_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "courses_schedule" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"weekday" "enum_courses_schedule_weekday",
  	"start" varchar,
  	"end" varchar
  );
  
  CREATE TABLE "courses_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "courses" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"icon" "enum_courses_icon",
  	"tagline" varchar,
  	"badge_text" varchar,
  	"badge_tone" "enum_courses_badge_tone" DEFAULT 'light',
  	"card_teaser" varchar,
  	"card_image_id" integer,
  	"hero_eyebrow" varchar,
  	"hero_lead" varchar,
  	"hero_audience_label" varchar,
  	"hero_image_id" integer,
  	"hero_secondary_image_id" integer,
  	"audience_heading" varchar DEFAULT 'Für wen ist der Kurs?',
  	"audience_quote" varchar,
  	"steps_heading" varchar,
  	"benefits_heading" varchar,
  	"benefits_side_image_id" integer,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_image_id" integer,
  	"slug" varchar,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_courses_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_courses_v_version_audience_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_courses_v_version_steps_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_courses_v_version_benefits_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_courses_v_version_schedule" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"weekday" "enum__courses_v_version_schedule_weekday",
  	"start" varchar,
  	"end" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_courses_v_version_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_courses_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_icon" "enum__courses_v_version_icon",
  	"version_tagline" varchar,
  	"version_badge_text" varchar,
  	"version_badge_tone" "enum__courses_v_version_badge_tone" DEFAULT 'light',
  	"version_card_teaser" varchar,
  	"version_card_image_id" integer,
  	"version_hero_eyebrow" varchar,
  	"version_hero_lead" varchar,
  	"version_hero_audience_label" varchar,
  	"version_hero_image_id" integer,
  	"version_hero_secondary_image_id" integer,
  	"version_audience_heading" varchar DEFAULT 'Für wen ist der Kurs?',
  	"version_audience_quote" varchar,
  	"version_steps_heading" varchar,
  	"version_benefits_heading" varchar,
  	"version_benefits_side_image_id" integer,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_image_id" integer,
  	"version_slug" varchar,
  	"version_order" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__courses_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "price_groups_blocks_inclusions" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "price_groups_blocks" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"badge" "enum_price_groups_blocks_badge" DEFAULT 'none',
  	"price" numeric,
  	"unit" varchar,
  	"action" "enum_price_groups_blocks_action" DEFAULT 'signup',
  	"highlighted" boolean DEFAULT false,
  	"is_trial" boolean DEFAULT false,
  	"show_in_signup_form" boolean DEFAULT false,
  	"course_id" integer
  );
  
  CREATE TABLE "price_groups" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"title" varchar,
  	"description" varchar,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_price_groups_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_price_groups_v_version_blocks_inclusions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_price_groups_v_version_blocks" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"badge" "enum__price_groups_v_version_blocks_badge" DEFAULT 'none',
  	"price" numeric,
  	"unit" varchar,
  	"action" "enum__price_groups_v_version_blocks_action" DEFAULT 'signup',
  	"highlighted" boolean DEFAULT false,
  	"is_trial" boolean DEFAULT false,
  	"show_in_signup_form" boolean DEFAULT false,
  	"course_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_price_groups_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_kicker" varchar,
  	"version_title" varchar,
  	"version_description" varchar,
  	"version_order" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__price_groups_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "reviews" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"author" varchar,
  	"text" varchar,
  	"source" varchar DEFAULT 'Google-Bewertung',
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_reviews_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_reviews_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_author" varchar,
  	"version_text" varchar,
  	"version_source" varchar DEFAULT 'Google-Bewertung',
  	"version_order" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__reviews_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_feature_url" varchar,
  	"sizes_feature_width" numeric,
  	"sizes_feature_height" numeric,
  	"sizes_feature_mime_type" varchar,
  	"sizes_feature_filesize" numeric,
  	"sizes_feature_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_small_url" varchar,
  	"sizes_small_width" numeric,
  	"sizes_small_height" numeric,
  	"sizes_small_mime_type" varchar,
  	"sizes_small_filesize" numeric,
  	"sizes_small_filename" varchar
  );
  
  CREATE TABLE "downloads" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"usage" "enum_downloads_usage",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "redirects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"from" varchar NOT NULL,
  	"to_type" "enum_redirects_to_type" DEFAULT 'reference',
  	"to_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "redirects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"courses_id" integer
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"courses_id" integer,
  	"price_groups_id" integer,
  	"reviews_id" integer,
  	"media_id" integer,
  	"downloads_id" integer,
  	"users_id" integer,
  	"redirects_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "business_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"contact_phone_display" varchar,
  	"contact_phone_e164" varchar,
  	"contact_email" varchar,
  	"contact_street" varchar,
  	"contact_postal_code" varchar,
  	"contact_city" varchar,
  	"whats_app_group_url" varchar,
  	"whats_app_personal_chat_url" varchar,
  	"social_instagram_url" varchar,
  	"social_facebook_url" varchar,
  	"social_google_reviews_url" varchar,
  	"bank_account_holder" varchar,
  	"bank_bank_name" varchar,
  	"bank_iban" varchar,
  	"bank_payment_reference" varchar,
  	"_status" "enum_business_settings_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_business_settings_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_contact_phone_display" varchar,
  	"version_contact_phone_e164" varchar,
  	"version_contact_email" varchar,
  	"version_contact_street" varchar,
  	"version_contact_postal_code" varchar,
  	"version_contact_city" varchar,
  	"version_whats_app_group_url" varchar,
  	"version_whats_app_personal_chat_url" varchar,
  	"version_social_instagram_url" varchar,
  	"version_social_facebook_url" varchar,
  	"version_social_google_reviews_url" varchar,
  	"version_bank_account_holder" varchar,
  	"version_bank_bank_name" varchar,
  	"version_bank_iban" varchar,
  	"version_bank_payment_reference" varchar,
  	"version__status" "enum__business_settings_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "teacher_training_weekends" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"from" timestamp(3) with time zone,
  	"to" timestamp(3) with time zone
  );
  
  CREATE TABLE "teacher_training_topics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "teacher_training_requirements" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "teacher_training_teaser_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "teacher_training" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"start_month" timestamp(3) with time zone,
  	"end_month" timestamp(3) with time zone,
  	"price" numeric,
  	"deposit" numeric,
  	"deposit_deadline" varchar,
  	"balance_deadline" varchar,
  	"membership_discount" varchar,
  	"certification" varchar,
  	"flyer_image_id" integer,
  	"teaser_heading" varchar,
  	"teaser_text" varchar,
  	"teaser_price_note" varchar,
  	"_status" "enum_teacher_training_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_teacher_training_v_version_weekends" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"from" timestamp(3) with time zone,
  	"to" timestamp(3) with time zone,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_teacher_training_v_version_topics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_teacher_training_v_version_requirements" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_teacher_training_v_version_teaser_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_teacher_training_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_start_month" timestamp(3) with time zone,
  	"version_end_month" timestamp(3) with time zone,
  	"version_price" numeric,
  	"version_deposit" numeric,
  	"version_deposit_deadline" varchar,
  	"version_balance_deadline" varchar,
  	"version_membership_discount" varchar,
  	"version_certification" varchar,
  	"version_flyer_image_id" integer,
  	"version_teaser_heading" varchar,
  	"version_teaser_text" varchar,
  	"version_teaser_price_note" varchar,
  	"version__status" "enum__teacher_training_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "legal_notice" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_on" timestamp(3) with time zone,
  	"content" jsonb,
  	"_status" "enum_legal_notice_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_legal_notice_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_updated_on" timestamp(3) with time zone,
  	"version_content" jsonb,
  	"version__status" "enum__legal_notice_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "privacy_policy" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_on" timestamp(3) with time zone,
  	"content" jsonb,
  	"_status" "enum_privacy_policy_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_privacy_policy_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_updated_on" timestamp(3) with time zone,
  	"version_content" jsonb,
  	"version__status" "enum__privacy_policy_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "technical_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"site_url" varchar,
  	"noindex" boolean DEFAULT true,
  	"default_seo_title" varchar,
  	"default_seo_description" varchar,
  	"default_seo_image_id" integer,
  	"feature_flags_intro_loader" boolean DEFAULT false,
  	"feature_flags_cookie_banner" boolean DEFAULT false,
  	"google_maps_embed_url" varchar,
  	"_status" "enum_technical_settings_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_technical_settings_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_site_url" varchar,
  	"version_noindex" boolean DEFAULT true,
  	"version_default_seo_title" varchar,
  	"version_default_seo_description" varchar,
  	"version_default_seo_image_id" integer,
  	"version_feature_flags_intro_loader" boolean DEFAULT false,
  	"version_feature_flags_cookie_banner" boolean DEFAULT false,
  	"version_google_maps_embed_url" varchar,
  	"version__status" "enum__technical_settings_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  ALTER TABLE "courses_audience_paragraphs" ADD CONSTRAINT "courses_audience_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_steps_items" ADD CONSTRAINT "courses_steps_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courses_steps_items" ADD CONSTRAINT "courses_steps_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_benefits_items" ADD CONSTRAINT "courses_benefits_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courses_benefits_items" ADD CONSTRAINT "courses_benefits_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_schedule" ADD CONSTRAINT "courses_schedule_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_faqs" ADD CONSTRAINT "courses_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses" ADD CONSTRAINT "courses_card_image_id_media_id_fk" FOREIGN KEY ("card_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courses" ADD CONSTRAINT "courses_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courses" ADD CONSTRAINT "courses_hero_secondary_image_id_media_id_fk" FOREIGN KEY ("hero_secondary_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courses" ADD CONSTRAINT "courses_benefits_side_image_id_media_id_fk" FOREIGN KEY ("benefits_side_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courses" ADD CONSTRAINT "courses_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_courses_v_version_audience_paragraphs" ADD CONSTRAINT "_courses_v_version_audience_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_courses_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v_version_steps_items" ADD CONSTRAINT "_courses_v_version_steps_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_courses_v_version_steps_items" ADD CONSTRAINT "_courses_v_version_steps_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_courses_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v_version_benefits_items" ADD CONSTRAINT "_courses_v_version_benefits_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_courses_v_version_benefits_items" ADD CONSTRAINT "_courses_v_version_benefits_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_courses_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v_version_schedule" ADD CONSTRAINT "_courses_v_version_schedule_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_courses_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v_version_faqs" ADD CONSTRAINT "_courses_v_version_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_courses_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v" ADD CONSTRAINT "_courses_v_parent_id_courses_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_courses_v" ADD CONSTRAINT "_courses_v_version_card_image_id_media_id_fk" FOREIGN KEY ("version_card_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_courses_v" ADD CONSTRAINT "_courses_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_courses_v" ADD CONSTRAINT "_courses_v_version_hero_secondary_image_id_media_id_fk" FOREIGN KEY ("version_hero_secondary_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_courses_v" ADD CONSTRAINT "_courses_v_version_benefits_side_image_id_media_id_fk" FOREIGN KEY ("version_benefits_side_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_courses_v" ADD CONSTRAINT "_courses_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "price_groups_blocks_inclusions" ADD CONSTRAINT "price_groups_blocks_inclusions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."price_groups_blocks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "price_groups_blocks" ADD CONSTRAINT "price_groups_blocks_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "price_groups_blocks" ADD CONSTRAINT "price_groups_blocks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."price_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_price_groups_v_version_blocks_inclusions" ADD CONSTRAINT "_price_groups_v_version_blocks_inclusions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_price_groups_v_version_blocks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_price_groups_v_version_blocks" ADD CONSTRAINT "_price_groups_v_version_blocks_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_price_groups_v_version_blocks" ADD CONSTRAINT "_price_groups_v_version_blocks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_price_groups_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_price_groups_v" ADD CONSTRAINT "_price_groups_v_parent_id_price_groups_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."price_groups"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_reviews_v" ADD CONSTRAINT "_reviews_v_parent_id_reviews_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."reviews"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_courses_fk" FOREIGN KEY ("courses_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_courses_fk" FOREIGN KEY ("courses_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_price_groups_fk" FOREIGN KEY ("price_groups_id") REFERENCES "public"."price_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reviews_fk" FOREIGN KEY ("reviews_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_downloads_fk" FOREIGN KEY ("downloads_id") REFERENCES "public"."downloads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk" FOREIGN KEY ("redirects_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "teacher_training_weekends" ADD CONSTRAINT "teacher_training_weekends_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."teacher_training"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "teacher_training_topics" ADD CONSTRAINT "teacher_training_topics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."teacher_training"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "teacher_training_requirements" ADD CONSTRAINT "teacher_training_requirements_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."teacher_training"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "teacher_training_teaser_facts" ADD CONSTRAINT "teacher_training_teaser_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."teacher_training"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "teacher_training" ADD CONSTRAINT "teacher_training_flyer_image_id_media_id_fk" FOREIGN KEY ("flyer_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_teacher_training_v_version_weekends" ADD CONSTRAINT "_teacher_training_v_version_weekends_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_teacher_training_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_teacher_training_v_version_topics" ADD CONSTRAINT "_teacher_training_v_version_topics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_teacher_training_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_teacher_training_v_version_requirements" ADD CONSTRAINT "_teacher_training_v_version_requirements_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_teacher_training_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_teacher_training_v_version_teaser_facts" ADD CONSTRAINT "_teacher_training_v_version_teaser_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_teacher_training_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_teacher_training_v" ADD CONSTRAINT "_teacher_training_v_version_flyer_image_id_media_id_fk" FOREIGN KEY ("version_flyer_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "technical_settings" ADD CONSTRAINT "technical_settings_default_seo_image_id_media_id_fk" FOREIGN KEY ("default_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_technical_settings_v" ADD CONSTRAINT "_technical_settings_v_version_default_seo_image_id_media_id_fk" FOREIGN KEY ("version_default_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "courses_audience_paragraphs_order_idx" ON "courses_audience_paragraphs" USING btree ("_order");
  CREATE INDEX "courses_audience_paragraphs_parent_id_idx" ON "courses_audience_paragraphs" USING btree ("_parent_id");
  CREATE INDEX "courses_steps_items_order_idx" ON "courses_steps_items" USING btree ("_order");
  CREATE INDEX "courses_steps_items_parent_id_idx" ON "courses_steps_items" USING btree ("_parent_id");
  CREATE INDEX "courses_steps_items_image_idx" ON "courses_steps_items" USING btree ("image_id");
  CREATE INDEX "courses_benefits_items_order_idx" ON "courses_benefits_items" USING btree ("_order");
  CREATE INDEX "courses_benefits_items_parent_id_idx" ON "courses_benefits_items" USING btree ("_parent_id");
  CREATE INDEX "courses_benefits_items_image_idx" ON "courses_benefits_items" USING btree ("image_id");
  CREATE INDEX "courses_schedule_order_idx" ON "courses_schedule" USING btree ("_order");
  CREATE INDEX "courses_schedule_parent_id_idx" ON "courses_schedule" USING btree ("_parent_id");
  CREATE INDEX "courses_faqs_order_idx" ON "courses_faqs" USING btree ("_order");
  CREATE INDEX "courses_faqs_parent_id_idx" ON "courses_faqs" USING btree ("_parent_id");
  CREATE INDEX "courses_card_image_idx" ON "courses" USING btree ("card_image_id");
  CREATE INDEX "courses_hero_hero_image_idx" ON "courses" USING btree ("hero_image_id");
  CREATE INDEX "courses_hero_hero_secondary_image_idx" ON "courses" USING btree ("hero_secondary_image_id");
  CREATE INDEX "courses_benefits_benefits_side_image_idx" ON "courses" USING btree ("benefits_side_image_id");
  CREATE INDEX "courses_seo_seo_image_idx" ON "courses" USING btree ("seo_image_id");
  CREATE UNIQUE INDEX "courses_slug_idx" ON "courses" USING btree ("slug");
  CREATE INDEX "courses_updated_at_idx" ON "courses" USING btree ("updated_at");
  CREATE INDEX "courses_created_at_idx" ON "courses" USING btree ("created_at");
  CREATE INDEX "courses__status_idx" ON "courses" USING btree ("_status");
  CREATE INDEX "_courses_v_version_audience_paragraphs_order_idx" ON "_courses_v_version_audience_paragraphs" USING btree ("_order");
  CREATE INDEX "_courses_v_version_audience_paragraphs_parent_id_idx" ON "_courses_v_version_audience_paragraphs" USING btree ("_parent_id");
  CREATE INDEX "_courses_v_version_steps_items_order_idx" ON "_courses_v_version_steps_items" USING btree ("_order");
  CREATE INDEX "_courses_v_version_steps_items_parent_id_idx" ON "_courses_v_version_steps_items" USING btree ("_parent_id");
  CREATE INDEX "_courses_v_version_steps_items_image_idx" ON "_courses_v_version_steps_items" USING btree ("image_id");
  CREATE INDEX "_courses_v_version_benefits_items_order_idx" ON "_courses_v_version_benefits_items" USING btree ("_order");
  CREATE INDEX "_courses_v_version_benefits_items_parent_id_idx" ON "_courses_v_version_benefits_items" USING btree ("_parent_id");
  CREATE INDEX "_courses_v_version_benefits_items_image_idx" ON "_courses_v_version_benefits_items" USING btree ("image_id");
  CREATE INDEX "_courses_v_version_schedule_order_idx" ON "_courses_v_version_schedule" USING btree ("_order");
  CREATE INDEX "_courses_v_version_schedule_parent_id_idx" ON "_courses_v_version_schedule" USING btree ("_parent_id");
  CREATE INDEX "_courses_v_version_faqs_order_idx" ON "_courses_v_version_faqs" USING btree ("_order");
  CREATE INDEX "_courses_v_version_faqs_parent_id_idx" ON "_courses_v_version_faqs" USING btree ("_parent_id");
  CREATE INDEX "_courses_v_parent_idx" ON "_courses_v" USING btree ("parent_id");
  CREATE INDEX "_courses_v_version_version_card_image_idx" ON "_courses_v" USING btree ("version_card_image_id");
  CREATE INDEX "_courses_v_version_hero_version_hero_image_idx" ON "_courses_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_courses_v_version_hero_version_hero_secondary_image_idx" ON "_courses_v" USING btree ("version_hero_secondary_image_id");
  CREATE INDEX "_courses_v_version_benefits_version_benefits_side_image_idx" ON "_courses_v" USING btree ("version_benefits_side_image_id");
  CREATE INDEX "_courses_v_version_seo_version_seo_image_idx" ON "_courses_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_courses_v_version_version_slug_idx" ON "_courses_v" USING btree ("version_slug");
  CREATE INDEX "_courses_v_version_version_updated_at_idx" ON "_courses_v" USING btree ("version_updated_at");
  CREATE INDEX "_courses_v_version_version_created_at_idx" ON "_courses_v" USING btree ("version_created_at");
  CREATE INDEX "_courses_v_version_version__status_idx" ON "_courses_v" USING btree ("version__status");
  CREATE INDEX "_courses_v_created_at_idx" ON "_courses_v" USING btree ("created_at");
  CREATE INDEX "_courses_v_updated_at_idx" ON "_courses_v" USING btree ("updated_at");
  CREATE INDEX "_courses_v_latest_idx" ON "_courses_v" USING btree ("latest");
  CREATE INDEX "_courses_v_autosave_idx" ON "_courses_v" USING btree ("autosave");
  CREATE INDEX "price_groups_blocks_inclusions_order_idx" ON "price_groups_blocks_inclusions" USING btree ("_order");
  CREATE INDEX "price_groups_blocks_inclusions_parent_id_idx" ON "price_groups_blocks_inclusions" USING btree ("_parent_id");
  CREATE INDEX "price_groups_blocks_order_idx" ON "price_groups_blocks" USING btree ("_order");
  CREATE INDEX "price_groups_blocks_parent_id_idx" ON "price_groups_blocks" USING btree ("_parent_id");
  CREATE INDEX "price_groups_blocks_course_idx" ON "price_groups_blocks" USING btree ("course_id");
  CREATE INDEX "price_groups_updated_at_idx" ON "price_groups" USING btree ("updated_at");
  CREATE INDEX "price_groups_created_at_idx" ON "price_groups" USING btree ("created_at");
  CREATE INDEX "price_groups__status_idx" ON "price_groups" USING btree ("_status");
  CREATE INDEX "_price_groups_v_version_blocks_inclusions_order_idx" ON "_price_groups_v_version_blocks_inclusions" USING btree ("_order");
  CREATE INDEX "_price_groups_v_version_blocks_inclusions_parent_id_idx" ON "_price_groups_v_version_blocks_inclusions" USING btree ("_parent_id");
  CREATE INDEX "_price_groups_v_version_blocks_order_idx" ON "_price_groups_v_version_blocks" USING btree ("_order");
  CREATE INDEX "_price_groups_v_version_blocks_parent_id_idx" ON "_price_groups_v_version_blocks" USING btree ("_parent_id");
  CREATE INDEX "_price_groups_v_version_blocks_course_idx" ON "_price_groups_v_version_blocks" USING btree ("course_id");
  CREATE INDEX "_price_groups_v_parent_idx" ON "_price_groups_v" USING btree ("parent_id");
  CREATE INDEX "_price_groups_v_version_version_updated_at_idx" ON "_price_groups_v" USING btree ("version_updated_at");
  CREATE INDEX "_price_groups_v_version_version_created_at_idx" ON "_price_groups_v" USING btree ("version_created_at");
  CREATE INDEX "_price_groups_v_version_version__status_idx" ON "_price_groups_v" USING btree ("version__status");
  CREATE INDEX "_price_groups_v_created_at_idx" ON "_price_groups_v" USING btree ("created_at");
  CREATE INDEX "_price_groups_v_updated_at_idx" ON "_price_groups_v" USING btree ("updated_at");
  CREATE INDEX "_price_groups_v_latest_idx" ON "_price_groups_v" USING btree ("latest");
  CREATE INDEX "_price_groups_v_autosave_idx" ON "_price_groups_v" USING btree ("autosave");
  CREATE INDEX "reviews_updated_at_idx" ON "reviews" USING btree ("updated_at");
  CREATE INDEX "reviews_created_at_idx" ON "reviews" USING btree ("created_at");
  CREATE INDEX "reviews__status_idx" ON "reviews" USING btree ("_status");
  CREATE INDEX "_reviews_v_parent_idx" ON "_reviews_v" USING btree ("parent_id");
  CREATE INDEX "_reviews_v_version_version_updated_at_idx" ON "_reviews_v" USING btree ("version_updated_at");
  CREATE INDEX "_reviews_v_version_version_created_at_idx" ON "_reviews_v" USING btree ("version_created_at");
  CREATE INDEX "_reviews_v_version_version__status_idx" ON "_reviews_v" USING btree ("version__status");
  CREATE INDEX "_reviews_v_created_at_idx" ON "_reviews_v" USING btree ("created_at");
  CREATE INDEX "_reviews_v_updated_at_idx" ON "_reviews_v" USING btree ("updated_at");
  CREATE INDEX "_reviews_v_latest_idx" ON "_reviews_v" USING btree ("latest");
  CREATE INDEX "_reviews_v_autosave_idx" ON "_reviews_v" USING btree ("autosave");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_feature_sizes_feature_filename_idx" ON "media" USING btree ("sizes_feature_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_small_sizes_small_filename_idx" ON "media" USING btree ("sizes_small_filename");
  CREATE UNIQUE INDEX "downloads_usage_idx" ON "downloads" USING btree ("usage");
  CREATE INDEX "downloads_updated_at_idx" ON "downloads" USING btree ("updated_at");
  CREATE INDEX "downloads_created_at_idx" ON "downloads" USING btree ("created_at");
  CREATE UNIQUE INDEX "downloads_filename_idx" ON "downloads" USING btree ("filename");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "redirects_from_idx" ON "redirects" USING btree ("from");
  CREATE INDEX "redirects_updated_at_idx" ON "redirects" USING btree ("updated_at");
  CREATE INDEX "redirects_created_at_idx" ON "redirects" USING btree ("created_at");
  CREATE INDEX "redirects_rels_order_idx" ON "redirects_rels" USING btree ("order");
  CREATE INDEX "redirects_rels_parent_idx" ON "redirects_rels" USING btree ("parent_id");
  CREATE INDEX "redirects_rels_path_idx" ON "redirects_rels" USING btree ("path");
  CREATE INDEX "redirects_rels_courses_id_idx" ON "redirects_rels" USING btree ("courses_id");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_courses_id_idx" ON "payload_locked_documents_rels" USING btree ("courses_id");
  CREATE INDEX "payload_locked_documents_rels_price_groups_id_idx" ON "payload_locked_documents_rels" USING btree ("price_groups_id");
  CREATE INDEX "payload_locked_documents_rels_reviews_id_idx" ON "payload_locked_documents_rels" USING btree ("reviews_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_downloads_id_idx" ON "payload_locked_documents_rels" USING btree ("downloads_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_redirects_id_idx" ON "payload_locked_documents_rels" USING btree ("redirects_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "business_settings__status_idx" ON "business_settings" USING btree ("_status");
  CREATE INDEX "_business_settings_v_version_version__status_idx" ON "_business_settings_v" USING btree ("version__status");
  CREATE INDEX "_business_settings_v_created_at_idx" ON "_business_settings_v" USING btree ("created_at");
  CREATE INDEX "_business_settings_v_updated_at_idx" ON "_business_settings_v" USING btree ("updated_at");
  CREATE INDEX "_business_settings_v_latest_idx" ON "_business_settings_v" USING btree ("latest");
  CREATE INDEX "_business_settings_v_autosave_idx" ON "_business_settings_v" USING btree ("autosave");
  CREATE INDEX "teacher_training_weekends_order_idx" ON "teacher_training_weekends" USING btree ("_order");
  CREATE INDEX "teacher_training_weekends_parent_id_idx" ON "teacher_training_weekends" USING btree ("_parent_id");
  CREATE INDEX "teacher_training_topics_order_idx" ON "teacher_training_topics" USING btree ("_order");
  CREATE INDEX "teacher_training_topics_parent_id_idx" ON "teacher_training_topics" USING btree ("_parent_id");
  CREATE INDEX "teacher_training_requirements_order_idx" ON "teacher_training_requirements" USING btree ("_order");
  CREATE INDEX "teacher_training_requirements_parent_id_idx" ON "teacher_training_requirements" USING btree ("_parent_id");
  CREATE INDEX "teacher_training_teaser_facts_order_idx" ON "teacher_training_teaser_facts" USING btree ("_order");
  CREATE INDEX "teacher_training_teaser_facts_parent_id_idx" ON "teacher_training_teaser_facts" USING btree ("_parent_id");
  CREATE INDEX "teacher_training_flyer_flyer_image_idx" ON "teacher_training" USING btree ("flyer_image_id");
  CREATE INDEX "teacher_training__status_idx" ON "teacher_training" USING btree ("_status");
  CREATE INDEX "_teacher_training_v_version_weekends_order_idx" ON "_teacher_training_v_version_weekends" USING btree ("_order");
  CREATE INDEX "_teacher_training_v_version_weekends_parent_id_idx" ON "_teacher_training_v_version_weekends" USING btree ("_parent_id");
  CREATE INDEX "_teacher_training_v_version_topics_order_idx" ON "_teacher_training_v_version_topics" USING btree ("_order");
  CREATE INDEX "_teacher_training_v_version_topics_parent_id_idx" ON "_teacher_training_v_version_topics" USING btree ("_parent_id");
  CREATE INDEX "_teacher_training_v_version_requirements_order_idx" ON "_teacher_training_v_version_requirements" USING btree ("_order");
  CREATE INDEX "_teacher_training_v_version_requirements_parent_id_idx" ON "_teacher_training_v_version_requirements" USING btree ("_parent_id");
  CREATE INDEX "_teacher_training_v_version_teaser_facts_order_idx" ON "_teacher_training_v_version_teaser_facts" USING btree ("_order");
  CREATE INDEX "_teacher_training_v_version_teaser_facts_parent_id_idx" ON "_teacher_training_v_version_teaser_facts" USING btree ("_parent_id");
  CREATE INDEX "_teacher_training_v_version_flyer_version_flyer_image_idx" ON "_teacher_training_v" USING btree ("version_flyer_image_id");
  CREATE INDEX "_teacher_training_v_version_version__status_idx" ON "_teacher_training_v" USING btree ("version__status");
  CREATE INDEX "_teacher_training_v_created_at_idx" ON "_teacher_training_v" USING btree ("created_at");
  CREATE INDEX "_teacher_training_v_updated_at_idx" ON "_teacher_training_v" USING btree ("updated_at");
  CREATE INDEX "_teacher_training_v_latest_idx" ON "_teacher_training_v" USING btree ("latest");
  CREATE INDEX "_teacher_training_v_autosave_idx" ON "_teacher_training_v" USING btree ("autosave");
  CREATE INDEX "legal_notice__status_idx" ON "legal_notice" USING btree ("_status");
  CREATE INDEX "_legal_notice_v_version_version__status_idx" ON "_legal_notice_v" USING btree ("version__status");
  CREATE INDEX "_legal_notice_v_created_at_idx" ON "_legal_notice_v" USING btree ("created_at");
  CREATE INDEX "_legal_notice_v_updated_at_idx" ON "_legal_notice_v" USING btree ("updated_at");
  CREATE INDEX "_legal_notice_v_latest_idx" ON "_legal_notice_v" USING btree ("latest");
  CREATE INDEX "_legal_notice_v_autosave_idx" ON "_legal_notice_v" USING btree ("autosave");
  CREATE INDEX "privacy_policy__status_idx" ON "privacy_policy" USING btree ("_status");
  CREATE INDEX "_privacy_policy_v_version_version__status_idx" ON "_privacy_policy_v" USING btree ("version__status");
  CREATE INDEX "_privacy_policy_v_created_at_idx" ON "_privacy_policy_v" USING btree ("created_at");
  CREATE INDEX "_privacy_policy_v_updated_at_idx" ON "_privacy_policy_v" USING btree ("updated_at");
  CREATE INDEX "_privacy_policy_v_latest_idx" ON "_privacy_policy_v" USING btree ("latest");
  CREATE INDEX "_privacy_policy_v_autosave_idx" ON "_privacy_policy_v" USING btree ("autosave");
  CREATE INDEX "technical_settings_default_seo_default_seo_image_idx" ON "technical_settings" USING btree ("default_seo_image_id");
  CREATE INDEX "technical_settings__status_idx" ON "technical_settings" USING btree ("_status");
  CREATE INDEX "_technical_settings_v_version_default_seo_version_defaul_idx" ON "_technical_settings_v" USING btree ("version_default_seo_image_id");
  CREATE INDEX "_technical_settings_v_version_version__status_idx" ON "_technical_settings_v" USING btree ("version__status");
  CREATE INDEX "_technical_settings_v_created_at_idx" ON "_technical_settings_v" USING btree ("created_at");
  CREATE INDEX "_technical_settings_v_updated_at_idx" ON "_technical_settings_v" USING btree ("updated_at");
  CREATE INDEX "_technical_settings_v_latest_idx" ON "_technical_settings_v" USING btree ("latest");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "courses_audience_paragraphs" CASCADE;
  DROP TABLE "courses_steps_items" CASCADE;
  DROP TABLE "courses_benefits_items" CASCADE;
  DROP TABLE "courses_schedule" CASCADE;
  DROP TABLE "courses_faqs" CASCADE;
  DROP TABLE "courses" CASCADE;
  DROP TABLE "_courses_v_version_audience_paragraphs" CASCADE;
  DROP TABLE "_courses_v_version_steps_items" CASCADE;
  DROP TABLE "_courses_v_version_benefits_items" CASCADE;
  DROP TABLE "_courses_v_version_schedule" CASCADE;
  DROP TABLE "_courses_v_version_faqs" CASCADE;
  DROP TABLE "_courses_v" CASCADE;
  DROP TABLE "price_groups_blocks_inclusions" CASCADE;
  DROP TABLE "price_groups_blocks" CASCADE;
  DROP TABLE "price_groups" CASCADE;
  DROP TABLE "_price_groups_v_version_blocks_inclusions" CASCADE;
  DROP TABLE "_price_groups_v_version_blocks" CASCADE;
  DROP TABLE "_price_groups_v" CASCADE;
  DROP TABLE "reviews" CASCADE;
  DROP TABLE "_reviews_v" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "downloads" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "redirects" CASCADE;
  DROP TABLE "redirects_rels" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "business_settings" CASCADE;
  DROP TABLE "_business_settings_v" CASCADE;
  DROP TABLE "teacher_training_weekends" CASCADE;
  DROP TABLE "teacher_training_topics" CASCADE;
  DROP TABLE "teacher_training_requirements" CASCADE;
  DROP TABLE "teacher_training_teaser_facts" CASCADE;
  DROP TABLE "teacher_training" CASCADE;
  DROP TABLE "_teacher_training_v_version_weekends" CASCADE;
  DROP TABLE "_teacher_training_v_version_topics" CASCADE;
  DROP TABLE "_teacher_training_v_version_requirements" CASCADE;
  DROP TABLE "_teacher_training_v_version_teaser_facts" CASCADE;
  DROP TABLE "_teacher_training_v" CASCADE;
  DROP TABLE "legal_notice" CASCADE;
  DROP TABLE "_legal_notice_v" CASCADE;
  DROP TABLE "privacy_policy" CASCADE;
  DROP TABLE "_privacy_policy_v" CASCADE;
  DROP TABLE "technical_settings" CASCADE;
  DROP TABLE "_technical_settings_v" CASCADE;
  DROP TYPE "public"."enum_courses_schedule_weekday";
  DROP TYPE "public"."enum_courses_icon";
  DROP TYPE "public"."enum_courses_badge_tone";
  DROP TYPE "public"."enum_courses_status";
  DROP TYPE "public"."enum__courses_v_version_schedule_weekday";
  DROP TYPE "public"."enum__courses_v_version_icon";
  DROP TYPE "public"."enum__courses_v_version_badge_tone";
  DROP TYPE "public"."enum__courses_v_version_status";
  DROP TYPE "public"."enum_price_groups_blocks_badge";
  DROP TYPE "public"."enum_price_groups_blocks_action";
  DROP TYPE "public"."enum_price_groups_status";
  DROP TYPE "public"."enum__price_groups_v_version_blocks_badge";
  DROP TYPE "public"."enum__price_groups_v_version_blocks_action";
  DROP TYPE "public"."enum__price_groups_v_version_status";
  DROP TYPE "public"."enum_reviews_status";
  DROP TYPE "public"."enum__reviews_v_version_status";
  DROP TYPE "public"."enum_downloads_usage";
  DROP TYPE "public"."enum_redirects_to_type";
  DROP TYPE "public"."enum_business_settings_status";
  DROP TYPE "public"."enum__business_settings_v_version_status";
  DROP TYPE "public"."enum_teacher_training_status";
  DROP TYPE "public"."enum__teacher_training_v_version_status";
  DROP TYPE "public"."enum_legal_notice_status";
  DROP TYPE "public"."enum__legal_notice_v_version_status";
  DROP TYPE "public"."enum_privacy_policy_status";
  DROP TYPE "public"."enum__privacy_policy_v_version_status";
  DROP TYPE "public"."enum_technical_settings_status";
  DROP TYPE "public"."enum__technical_settings_v_version_status";`)
}
