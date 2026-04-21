import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "payload"."_locales" AS ENUM('en', 'ja', 'de', 'fr', 'es', 'it', 'ko', 'zh-TW', 'ru', 'ar');
  CREATE TYPE "payload"."enum_users_role" AS ENUM('admin', 'editor', 'viewer');
  CREATE TYPE "payload"."enum_articles_category" AS ENUM('story', 'guide', 'product', 'press', 'journal');
  CREATE TYPE "payload"."enum_articles_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__articles_v_version_category" AS ENUM('story', 'guide', 'product', 'press', 'journal');
  CREATE TYPE "payload"."enum__articles_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__articles_v_published_locale" AS ENUM('en', 'ja', 'de', 'fr', 'es', 'it', 'ko', 'zh-TW', 'ru', 'ar');
  CREATE TYPE "payload"."enum_guides_country" AS ENUM('us', 'uk', 'de', 'fr', 'au', 'sg', 'ca', 'hk', 'ar');
  CREATE TYPE "payload"."enum_guides_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__guides_v_version_country" AS ENUM('us', 'uk', 'de', 'fr', 'au', 'sg', 'ca', 'hk', 'ar');
  CREATE TYPE "payload"."enum__guides_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__guides_v_published_locale" AS ENUM('en', 'ja', 'de', 'fr', 'es', 'it', 'ko', 'zh-TW', 'ru', 'ar');
  CREATE TYPE "payload"."enum_tools_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__tools_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__tools_v_published_locale" AS ENUM('en', 'ja', 'de', 'fr', 'es', 'it', 'ko', 'zh-TW', 'ru', 'ar');
  CREATE TYPE "payload"."enum_testimonials_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__testimonials_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__testimonials_v_published_locale" AS ENUM('en', 'ja', 'de', 'fr', 'es', 'it', 'ko', 'zh-TW', 'ru', 'ar');
  CREATE TYPE "payload"."enum_press_mentions_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__press_mentions_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__press_mentions_v_published_locale" AS ENUM('en', 'ja', 'de', 'fr', 'es', 'it', 'ko', 'zh-TW', 'ru', 'ar');
  CREATE TYPE "payload"."enum_site_settings_social_links_platform" AS ENUM('instagram', 'x', 'tiktok', 'youtube', 'pinterest', 'facebook', 'line', 'wechat', 'threads');
  CREATE TYPE "payload"."enum_homepage_blocks_hero_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "payload"."enum_homepage_blocks_testimonials_strip_layout" AS ENUM('carousel', 'grid');
  CREATE TYPE "payload"."enum_homepage_blocks_story_image_layout" AS ENUM('right', 'left', 'below');
  CREATE TYPE "payload"."enum_homepage_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__homepage_v_blocks_hero_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "payload"."enum__homepage_v_blocks_testimonials_strip_layout" AS ENUM('carousel', 'grid');
  CREATE TYPE "payload"."enum__homepage_v_blocks_story_image_layout" AS ENUM('right', 'left', 'below');
  CREATE TYPE "payload"."enum__homepage_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__homepage_v_published_locale" AS ENUM('en', 'ja', 'de', 'fr', 'es', 'it', 'ko', 'zh-TW', 'ru', 'ar');
  CREATE TABLE "payload"."users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "payload"."users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" "payload"."enum_users_role" DEFAULT 'editor' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload"."articles_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "payload"."articles_pull_quotes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"attribution" varchar
  );
  
  CREATE TABLE "payload"."articles_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"q" varchar,
  	"a" varchar
  );
  
  CREATE TABLE "payload"."articles_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
  CREATE TABLE "payload"."articles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"category" "payload"."enum_articles_category" DEFAULT 'journal',
  	"hero_image_id" integer,
  	"author_id" integer,
  	"published_at" timestamp(3) with time zone,
  	"seo_og_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "payload"."enum_articles_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "payload"."articles_locales" (
  	"title" varchar,
  	"tldr" jsonb,
  	"body" jsonb,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."_articles_v_version_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "payload"."_articles_v_version_pull_quotes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"attribution" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "payload"."_articles_v_version_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"q" varchar,
  	"a" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "payload"."_articles_v_version_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"tag" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "payload"."_articles_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_category" "payload"."enum__articles_v_version_category" DEFAULT 'journal',
  	"version_hero_image_id" integer,
  	"version_author_id" integer,
  	"version_published_at" timestamp(3) with time zone,
  	"version_seo_og_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "payload"."enum__articles_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "payload"."enum__articles_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "payload"."_articles_v_locales" (
  	"version_title" varchar,
  	"version_tldr" jsonb,
  	"version_body" jsonb,
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."guides_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"q" varchar,
  	"a" varchar
  );
  
  CREATE TABLE "payload"."guides" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"country" "payload"."enum_guides_country",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "payload"."enum_guides_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "payload"."guides_locales" (
  	"title" varchar,
  	"shipping_days" varchar,
  	"customs_notes" varchar,
  	"body" jsonb,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."_guides_v_version_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"q" varchar,
  	"a" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "payload"."_guides_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_country" "payload"."enum__guides_v_version_country",
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "payload"."enum__guides_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "payload"."enum__guides_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "payload"."_guides_v_locales" (
  	"version_title" varchar,
  	"version_shipping_days" varchar,
  	"version_customs_notes" varchar,
  	"version_body" jsonb,
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."tools" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"icon" varchar,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "payload"."enum_tools_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "payload"."tools_locales" (
  	"title" varchar,
  	"description" varchar,
  	"body" jsonb,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."_tools_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_icon" varchar,
  	"version_order" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "payload"."enum__tools_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "payload"."enum__tools_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "payload"."_tools_v_locales" (
  	"version_title" varchar,
  	"version_description" varchar,
  	"version_body" jsonb,
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"credit" varchar,
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
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar,
  	"sizes_og_url" varchar,
  	"sizes_og_width" numeric,
  	"sizes_og_height" numeric,
  	"sizes_og_mime_type" varchar,
  	"sizes_og_filesize" numeric,
  	"sizes_og_filename" varchar
  );
  
  CREATE TABLE "payload"."media_locales" (
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."testimonials" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"author" varchar,
  	"country" varchar,
  	"product_linked_article_id" integer,
  	"product_free_text" varchar,
  	"rating" numeric DEFAULT 5,
  	"verified" boolean DEFAULT false,
  	"avatar_id" integer,
  	"order_date" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "payload"."enum_testimonials_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "payload"."testimonials_locales" (
  	"quote" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."_testimonials_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_author" varchar,
  	"version_country" varchar,
  	"version_product_linked_article_id" integer,
  	"version_product_free_text" varchar,
  	"version_rating" numeric DEFAULT 5,
  	"version_verified" boolean DEFAULT false,
  	"version_avatar_id" integer,
  	"version_order_date" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "payload"."enum__testimonials_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "payload"."enum__testimonials_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "payload"."_testimonials_v_locales" (
  	"version_quote" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."press_mentions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"logo_svg_id" integer,
  	"url" varchar,
  	"date" timestamp(3) with time zone,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "payload"."enum_press_mentions_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "payload"."press_mentions_locales" (
  	"quote" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."_press_mentions_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_logo_svg_id" integer,
  	"version_url" varchar,
  	"version_date" timestamp(3) with time zone,
  	"version_order" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "payload"."enum__press_mentions_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "payload"."enum__press_mentions_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "payload"."_press_mentions_v_locales" (
  	"version_quote" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload"."payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"articles_id" integer,
  	"guides_id" integer,
  	"tools_id" integer,
  	"media_id" integer,
  	"testimonials_id" integer,
  	"press_mentions_id" integer
  );
  
  CREATE TABLE "payload"."payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload"."payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."site_settings_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "payload"."enum_site_settings_social_links_platform" NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."site_settings_footer_copy_legal_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."site_settings_footer_copy_legal_links_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_video_url" varchar,
  	"hero_image_url" varchar,
  	"announcement_bar_enabled" boolean DEFAULT false,
  	"announcement_bar_link" varchar,
  	"announcement_bar_background_color" varchar DEFAULT '#1a1a1a',
  	"announcement_bar_text_color" varchar DEFAULT '#ffffff',
  	"contact_support_email" varchar,
  	"contact_press_email" varchar,
  	"contact_phone" varchar,
  	"seo_defaults_default_og_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload"."site_settings_locales" (
  	"announcement_bar_text" varchar,
  	"footer_copy_tagline" varchar,
  	"footer_copy_copyright_text" varchar,
  	"contact_address_lines" varchar,
  	"seo_defaults_default_title" varchar,
  	"seo_defaults_title_suffix" varchar,
  	"seo_defaults_default_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."homepage_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"cta_url" varchar,
  	"video_media_id" integer,
  	"fallback_image_id" integer,
  	"align" "payload"."enum_homepage_blocks_hero_align" DEFAULT 'center',
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."homepage_blocks_hero_locales" (
  	"heading" varchar,
  	"subheading" varchar,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."homepage_blocks_drop" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"drop_number" varchar,
  	"product_handle" varchar,
  	"countdown_to" timestamp(3) with time zone,
  	"media_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."homepage_blocks_drop_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."homepage_blocks_testimonials_strip" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"limit" numeric DEFAULT 6,
  	"layout" "payload"."enum_homepage_blocks_testimonials_strip_layout" DEFAULT 'carousel',
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."homepage_blocks_testimonials_strip_locales" (
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."homepage_blocks_press_strip" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"limit" numeric DEFAULT 8,
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."homepage_blocks_press_strip_locales" (
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."homepage_blocks_story" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_right_id" integer,
  	"image_layout" "payload"."enum_homepage_blocks_story_image_layout" DEFAULT 'right',
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."homepage_blocks_story_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."homepage_blocks_newsletter" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."homepage_blocks_newsletter_locales" (
  	"heading" varchar,
  	"subheading" varchar,
  	"cta_label" varchar DEFAULT 'Subscribe',
  	"disclaimer" varchar,
  	"incentive" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."homepage" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seo_og_image_id" integer,
  	"_status" "payload"."enum_homepage_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload"."homepage_locales" (
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."homepage_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"testimonials_id" integer,
  	"press_mentions_id" integer
  );
  
  CREATE TABLE "payload"."_homepage_v_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"cta_url" varchar,
  	"video_media_id" integer,
  	"fallback_image_id" integer,
  	"align" "payload"."enum__homepage_v_blocks_hero_align" DEFAULT 'center',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."_homepage_v_blocks_hero_locales" (
  	"heading" varchar,
  	"subheading" varchar,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."_homepage_v_blocks_drop" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"drop_number" varchar,
  	"product_handle" varchar,
  	"countdown_to" timestamp(3) with time zone,
  	"media_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."_homepage_v_blocks_drop_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."_homepage_v_blocks_testimonials_strip" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"limit" numeric DEFAULT 6,
  	"layout" "payload"."enum__homepage_v_blocks_testimonials_strip_layout" DEFAULT 'carousel',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."_homepage_v_blocks_testimonials_strip_locales" (
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."_homepage_v_blocks_press_strip" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"limit" numeric DEFAULT 8,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."_homepage_v_blocks_press_strip_locales" (
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."_homepage_v_blocks_story" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_right_id" integer,
  	"image_layout" "payload"."enum__homepage_v_blocks_story_image_layout" DEFAULT 'right',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."_homepage_v_blocks_story_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."_homepage_v_blocks_newsletter" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "payload"."_homepage_v_blocks_newsletter_locales" (
  	"heading" varchar,
  	"subheading" varchar,
  	"cta_label" varchar DEFAULT 'Subscribe',
  	"disclaimer" varchar,
  	"incentive" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."_homepage_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_seo_og_image_id" integer,
  	"version__status" "payload"."enum__homepage_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "payload"."enum__homepage_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "payload"."_homepage_v_locales" (
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."_homepage_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"testimonials_id" integer,
  	"press_mentions_id" integer
  );
  
  ALTER TABLE "payload"."users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."articles_highlights" ADD CONSTRAINT "articles_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."articles_pull_quotes" ADD CONSTRAINT "articles_pull_quotes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."articles_faq" ADD CONSTRAINT "articles_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."articles_tags" ADD CONSTRAINT "articles_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."articles" ADD CONSTRAINT "articles_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."articles" ADD CONSTRAINT "articles_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "payload"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."articles" ADD CONSTRAINT "articles_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."articles_locales" ADD CONSTRAINT "articles_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_articles_v_version_highlights" ADD CONSTRAINT "_articles_v_version_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_articles_v_version_pull_quotes" ADD CONSTRAINT "_articles_v_version_pull_quotes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_articles_v_version_faq" ADD CONSTRAINT "_articles_v_version_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_articles_v_version_tags" ADD CONSTRAINT "_articles_v_version_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_articles_v" ADD CONSTRAINT "_articles_v_parent_id_articles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_articles_v" ADD CONSTRAINT "_articles_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_articles_v" ADD CONSTRAINT "_articles_v_version_author_id_users_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "payload"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_articles_v" ADD CONSTRAINT "_articles_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_articles_v_locales" ADD CONSTRAINT "_articles_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."guides_faq" ADD CONSTRAINT "guides_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."guides_locales" ADD CONSTRAINT "guides_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_guides_v_version_faq" ADD CONSTRAINT "_guides_v_version_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_guides_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_guides_v" ADD CONSTRAINT "_guides_v_parent_id_guides_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."guides"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_guides_v_locales" ADD CONSTRAINT "_guides_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_guides_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."tools_locales" ADD CONSTRAINT "tools_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."tools"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_tools_v" ADD CONSTRAINT "_tools_v_parent_id_tools_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."tools"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_tools_v_locales" ADD CONSTRAINT "_tools_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_tools_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."testimonials" ADD CONSTRAINT "testimonials_product_linked_article_id_articles_id_fk" FOREIGN KEY ("product_linked_article_id") REFERENCES "payload"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."testimonials" ADD CONSTRAINT "testimonials_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."testimonials_locales" ADD CONSTRAINT "testimonials_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_testimonials_v" ADD CONSTRAINT "_testimonials_v_parent_id_testimonials_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."testimonials"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_testimonials_v" ADD CONSTRAINT "_testimonials_v_version_product_linked_article_id_articles_id_fk" FOREIGN KEY ("version_product_linked_article_id") REFERENCES "payload"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_testimonials_v" ADD CONSTRAINT "_testimonials_v_version_avatar_id_media_id_fk" FOREIGN KEY ("version_avatar_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_testimonials_v_locales" ADD CONSTRAINT "_testimonials_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_testimonials_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."press_mentions" ADD CONSTRAINT "press_mentions_logo_svg_id_media_id_fk" FOREIGN KEY ("logo_svg_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."press_mentions_locales" ADD CONSTRAINT "press_mentions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."press_mentions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_press_mentions_v" ADD CONSTRAINT "_press_mentions_v_parent_id_press_mentions_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."press_mentions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_press_mentions_v" ADD CONSTRAINT "_press_mentions_v_version_logo_svg_id_media_id_fk" FOREIGN KEY ("version_logo_svg_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_press_mentions_v_locales" ADD CONSTRAINT "_press_mentions_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_press_mentions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "payload"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_guides_fk" FOREIGN KEY ("guides_id") REFERENCES "payload"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tools_fk" FOREIGN KEY ("tools_id") REFERENCES "payload"."tools"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "payload"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "payload"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_press_mentions_fk" FOREIGN KEY ("press_mentions_id") REFERENCES "payload"."press_mentions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."site_settings_social_links" ADD CONSTRAINT "site_settings_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."site_settings_footer_copy_legal_links" ADD CONSTRAINT "site_settings_footer_copy_legal_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."site_settings_footer_copy_legal_links_locales" ADD CONSTRAINT "site_settings_footer_copy_legal_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."site_settings_footer_copy_legal_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."site_settings" ADD CONSTRAINT "site_settings_seo_defaults_default_og_image_id_media_id_fk" FOREIGN KEY ("seo_defaults_default_og_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."site_settings_locales" ADD CONSTRAINT "site_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."homepage_blocks_hero" ADD CONSTRAINT "homepage_blocks_hero_video_media_id_media_id_fk" FOREIGN KEY ("video_media_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."homepage_blocks_hero" ADD CONSTRAINT "homepage_blocks_hero_fallback_image_id_media_id_fk" FOREIGN KEY ("fallback_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."homepage_blocks_hero" ADD CONSTRAINT "homepage_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."homepage_blocks_hero_locales" ADD CONSTRAINT "homepage_blocks_hero_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."homepage_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."homepage_blocks_drop" ADD CONSTRAINT "homepage_blocks_drop_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."homepage_blocks_drop" ADD CONSTRAINT "homepage_blocks_drop_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."homepage_blocks_drop_locales" ADD CONSTRAINT "homepage_blocks_drop_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."homepage_blocks_drop"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."homepage_blocks_testimonials_strip" ADD CONSTRAINT "homepage_blocks_testimonials_strip_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."homepage_blocks_testimonials_strip_locales" ADD CONSTRAINT "homepage_blocks_testimonials_strip_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."homepage_blocks_testimonials_strip"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."homepage_blocks_press_strip" ADD CONSTRAINT "homepage_blocks_press_strip_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."homepage_blocks_press_strip_locales" ADD CONSTRAINT "homepage_blocks_press_strip_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."homepage_blocks_press_strip"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."homepage_blocks_story" ADD CONSTRAINT "homepage_blocks_story_image_right_id_media_id_fk" FOREIGN KEY ("image_right_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."homepage_blocks_story" ADD CONSTRAINT "homepage_blocks_story_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."homepage_blocks_story_locales" ADD CONSTRAINT "homepage_blocks_story_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."homepage_blocks_story"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."homepage_blocks_newsletter" ADD CONSTRAINT "homepage_blocks_newsletter_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."homepage_blocks_newsletter_locales" ADD CONSTRAINT "homepage_blocks_newsletter_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."homepage_blocks_newsletter"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."homepage" ADD CONSTRAINT "homepage_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."homepage_locales" ADD CONSTRAINT "homepage_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."homepage_rels" ADD CONSTRAINT "homepage_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."homepage_rels" ADD CONSTRAINT "homepage_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "payload"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."homepage_rels" ADD CONSTRAINT "homepage_rels_press_mentions_fk" FOREIGN KEY ("press_mentions_id") REFERENCES "payload"."press_mentions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_homepage_v_blocks_hero" ADD CONSTRAINT "_homepage_v_blocks_hero_video_media_id_media_id_fk" FOREIGN KEY ("video_media_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_homepage_v_blocks_hero" ADD CONSTRAINT "_homepage_v_blocks_hero_fallback_image_id_media_id_fk" FOREIGN KEY ("fallback_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_homepage_v_blocks_hero" ADD CONSTRAINT "_homepage_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_homepage_v_blocks_hero_locales" ADD CONSTRAINT "_homepage_v_blocks_hero_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_homepage_v_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_homepage_v_blocks_drop" ADD CONSTRAINT "_homepage_v_blocks_drop_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_homepage_v_blocks_drop" ADD CONSTRAINT "_homepage_v_blocks_drop_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_homepage_v_blocks_drop_locales" ADD CONSTRAINT "_homepage_v_blocks_drop_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_homepage_v_blocks_drop"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_homepage_v_blocks_testimonials_strip" ADD CONSTRAINT "_homepage_v_blocks_testimonials_strip_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_homepage_v_blocks_testimonials_strip_locales" ADD CONSTRAINT "_homepage_v_blocks_testimonials_strip_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_homepage_v_blocks_testimonials_strip"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_homepage_v_blocks_press_strip" ADD CONSTRAINT "_homepage_v_blocks_press_strip_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_homepage_v_blocks_press_strip_locales" ADD CONSTRAINT "_homepage_v_blocks_press_strip_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_homepage_v_blocks_press_strip"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_homepage_v_blocks_story" ADD CONSTRAINT "_homepage_v_blocks_story_image_right_id_media_id_fk" FOREIGN KEY ("image_right_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_homepage_v_blocks_story" ADD CONSTRAINT "_homepage_v_blocks_story_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_homepage_v_blocks_story_locales" ADD CONSTRAINT "_homepage_v_blocks_story_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_homepage_v_blocks_story"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_homepage_v_blocks_newsletter" ADD CONSTRAINT "_homepage_v_blocks_newsletter_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_homepage_v_blocks_newsletter_locales" ADD CONSTRAINT "_homepage_v_blocks_newsletter_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_homepage_v_blocks_newsletter"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_homepage_v" ADD CONSTRAINT "_homepage_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_homepage_v_locales" ADD CONSTRAINT "_homepage_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_homepage_v_rels" ADD CONSTRAINT "_homepage_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_homepage_v_rels" ADD CONSTRAINT "_homepage_v_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "payload"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_homepage_v_rels" ADD CONSTRAINT "_homepage_v_rels_press_mentions_fk" FOREIGN KEY ("press_mentions_id") REFERENCES "payload"."press_mentions"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "payload"."users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "payload"."users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "payload"."users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "payload"."users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "payload"."users" USING btree ("email");
  CREATE INDEX "articles_highlights_order_idx" ON "payload"."articles_highlights" USING btree ("_order");
  CREATE INDEX "articles_highlights_parent_id_idx" ON "payload"."articles_highlights" USING btree ("_parent_id");
  CREATE INDEX "articles_highlights_locale_idx" ON "payload"."articles_highlights" USING btree ("_locale");
  CREATE INDEX "articles_pull_quotes_order_idx" ON "payload"."articles_pull_quotes" USING btree ("_order");
  CREATE INDEX "articles_pull_quotes_parent_id_idx" ON "payload"."articles_pull_quotes" USING btree ("_parent_id");
  CREATE INDEX "articles_pull_quotes_locale_idx" ON "payload"."articles_pull_quotes" USING btree ("_locale");
  CREATE INDEX "articles_faq_order_idx" ON "payload"."articles_faq" USING btree ("_order");
  CREATE INDEX "articles_faq_parent_id_idx" ON "payload"."articles_faq" USING btree ("_parent_id");
  CREATE INDEX "articles_faq_locale_idx" ON "payload"."articles_faq" USING btree ("_locale");
  CREATE INDEX "articles_tags_order_idx" ON "payload"."articles_tags" USING btree ("_order");
  CREATE INDEX "articles_tags_parent_id_idx" ON "payload"."articles_tags" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "articles_slug_idx" ON "payload"."articles" USING btree ("slug");
  CREATE INDEX "articles_hero_image_idx" ON "payload"."articles" USING btree ("hero_image_id");
  CREATE INDEX "articles_author_idx" ON "payload"."articles" USING btree ("author_id");
  CREATE INDEX "articles_seo_seo_og_image_idx" ON "payload"."articles" USING btree ("seo_og_image_id");
  CREATE INDEX "articles_updated_at_idx" ON "payload"."articles" USING btree ("updated_at");
  CREATE INDEX "articles_created_at_idx" ON "payload"."articles" USING btree ("created_at");
  CREATE INDEX "articles__status_idx" ON "payload"."articles" USING btree ("_status");
  CREATE UNIQUE INDEX "articles_locales_locale_parent_id_unique" ON "payload"."articles_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_articles_v_version_highlights_order_idx" ON "payload"."_articles_v_version_highlights" USING btree ("_order");
  CREATE INDEX "_articles_v_version_highlights_parent_id_idx" ON "payload"."_articles_v_version_highlights" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_version_highlights_locale_idx" ON "payload"."_articles_v_version_highlights" USING btree ("_locale");
  CREATE INDEX "_articles_v_version_pull_quotes_order_idx" ON "payload"."_articles_v_version_pull_quotes" USING btree ("_order");
  CREATE INDEX "_articles_v_version_pull_quotes_parent_id_idx" ON "payload"."_articles_v_version_pull_quotes" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_version_pull_quotes_locale_idx" ON "payload"."_articles_v_version_pull_quotes" USING btree ("_locale");
  CREATE INDEX "_articles_v_version_faq_order_idx" ON "payload"."_articles_v_version_faq" USING btree ("_order");
  CREATE INDEX "_articles_v_version_faq_parent_id_idx" ON "payload"."_articles_v_version_faq" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_version_faq_locale_idx" ON "payload"."_articles_v_version_faq" USING btree ("_locale");
  CREATE INDEX "_articles_v_version_tags_order_idx" ON "payload"."_articles_v_version_tags" USING btree ("_order");
  CREATE INDEX "_articles_v_version_tags_parent_id_idx" ON "payload"."_articles_v_version_tags" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_parent_idx" ON "payload"."_articles_v" USING btree ("parent_id");
  CREATE INDEX "_articles_v_version_version_slug_idx" ON "payload"."_articles_v" USING btree ("version_slug");
  CREATE INDEX "_articles_v_version_version_hero_image_idx" ON "payload"."_articles_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_articles_v_version_version_author_idx" ON "payload"."_articles_v" USING btree ("version_author_id");
  CREATE INDEX "_articles_v_version_seo_version_seo_og_image_idx" ON "payload"."_articles_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_articles_v_version_version_updated_at_idx" ON "payload"."_articles_v" USING btree ("version_updated_at");
  CREATE INDEX "_articles_v_version_version_created_at_idx" ON "payload"."_articles_v" USING btree ("version_created_at");
  CREATE INDEX "_articles_v_version_version__status_idx" ON "payload"."_articles_v" USING btree ("version__status");
  CREATE INDEX "_articles_v_created_at_idx" ON "payload"."_articles_v" USING btree ("created_at");
  CREATE INDEX "_articles_v_updated_at_idx" ON "payload"."_articles_v" USING btree ("updated_at");
  CREATE INDEX "_articles_v_snapshot_idx" ON "payload"."_articles_v" USING btree ("snapshot");
  CREATE INDEX "_articles_v_published_locale_idx" ON "payload"."_articles_v" USING btree ("published_locale");
  CREATE INDEX "_articles_v_latest_idx" ON "payload"."_articles_v" USING btree ("latest");
  CREATE INDEX "_articles_v_autosave_idx" ON "payload"."_articles_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "_articles_v_locales_locale_parent_id_unique" ON "payload"."_articles_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "guides_faq_order_idx" ON "payload"."guides_faq" USING btree ("_order");
  CREATE INDEX "guides_faq_parent_id_idx" ON "payload"."guides_faq" USING btree ("_parent_id");
  CREATE INDEX "guides_faq_locale_idx" ON "payload"."guides_faq" USING btree ("_locale");
  CREATE UNIQUE INDEX "guides_country_idx" ON "payload"."guides" USING btree ("country");
  CREATE INDEX "guides_updated_at_idx" ON "payload"."guides" USING btree ("updated_at");
  CREATE INDEX "guides_created_at_idx" ON "payload"."guides" USING btree ("created_at");
  CREATE INDEX "guides__status_idx" ON "payload"."guides" USING btree ("_status");
  CREATE UNIQUE INDEX "guides_locales_locale_parent_id_unique" ON "payload"."guides_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_guides_v_version_faq_order_idx" ON "payload"."_guides_v_version_faq" USING btree ("_order");
  CREATE INDEX "_guides_v_version_faq_parent_id_idx" ON "payload"."_guides_v_version_faq" USING btree ("_parent_id");
  CREATE INDEX "_guides_v_version_faq_locale_idx" ON "payload"."_guides_v_version_faq" USING btree ("_locale");
  CREATE INDEX "_guides_v_parent_idx" ON "payload"."_guides_v" USING btree ("parent_id");
  CREATE INDEX "_guides_v_version_version_country_idx" ON "payload"."_guides_v" USING btree ("version_country");
  CREATE INDEX "_guides_v_version_version_updated_at_idx" ON "payload"."_guides_v" USING btree ("version_updated_at");
  CREATE INDEX "_guides_v_version_version_created_at_idx" ON "payload"."_guides_v" USING btree ("version_created_at");
  CREATE INDEX "_guides_v_version_version__status_idx" ON "payload"."_guides_v" USING btree ("version__status");
  CREATE INDEX "_guides_v_created_at_idx" ON "payload"."_guides_v" USING btree ("created_at");
  CREATE INDEX "_guides_v_updated_at_idx" ON "payload"."_guides_v" USING btree ("updated_at");
  CREATE INDEX "_guides_v_snapshot_idx" ON "payload"."_guides_v" USING btree ("snapshot");
  CREATE INDEX "_guides_v_published_locale_idx" ON "payload"."_guides_v" USING btree ("published_locale");
  CREATE INDEX "_guides_v_latest_idx" ON "payload"."_guides_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_guides_v_locales_locale_parent_id_unique" ON "payload"."_guides_v_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "tools_slug_idx" ON "payload"."tools" USING btree ("slug");
  CREATE INDEX "tools_updated_at_idx" ON "payload"."tools" USING btree ("updated_at");
  CREATE INDEX "tools_created_at_idx" ON "payload"."tools" USING btree ("created_at");
  CREATE INDEX "tools__status_idx" ON "payload"."tools" USING btree ("_status");
  CREATE UNIQUE INDEX "tools_locales_locale_parent_id_unique" ON "payload"."tools_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_tools_v_parent_idx" ON "payload"."_tools_v" USING btree ("parent_id");
  CREATE INDEX "_tools_v_version_version_slug_idx" ON "payload"."_tools_v" USING btree ("version_slug");
  CREATE INDEX "_tools_v_version_version_updated_at_idx" ON "payload"."_tools_v" USING btree ("version_updated_at");
  CREATE INDEX "_tools_v_version_version_created_at_idx" ON "payload"."_tools_v" USING btree ("version_created_at");
  CREATE INDEX "_tools_v_version_version__status_idx" ON "payload"."_tools_v" USING btree ("version__status");
  CREATE INDEX "_tools_v_created_at_idx" ON "payload"."_tools_v" USING btree ("created_at");
  CREATE INDEX "_tools_v_updated_at_idx" ON "payload"."_tools_v" USING btree ("updated_at");
  CREATE INDEX "_tools_v_snapshot_idx" ON "payload"."_tools_v" USING btree ("snapshot");
  CREATE INDEX "_tools_v_published_locale_idx" ON "payload"."_tools_v" USING btree ("published_locale");
  CREATE INDEX "_tools_v_latest_idx" ON "payload"."_tools_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_tools_v_locales_locale_parent_id_unique" ON "payload"."_tools_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "media_updated_at_idx" ON "payload"."media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "payload"."media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "payload"."media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "payload"."media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "payload"."media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "payload"."media" USING btree ("sizes_hero_filename");
  CREATE INDEX "media_sizes_og_sizes_og_filename_idx" ON "payload"."media" USING btree ("sizes_og_filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "payload"."media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "testimonials_product_product_linked_article_idx" ON "payload"."testimonials" USING btree ("product_linked_article_id");
  CREATE INDEX "testimonials_avatar_idx" ON "payload"."testimonials" USING btree ("avatar_id");
  CREATE INDEX "testimonials_updated_at_idx" ON "payload"."testimonials" USING btree ("updated_at");
  CREATE INDEX "testimonials_created_at_idx" ON "payload"."testimonials" USING btree ("created_at");
  CREATE INDEX "testimonials__status_idx" ON "payload"."testimonials" USING btree ("_status");
  CREATE UNIQUE INDEX "testimonials_locales_locale_parent_id_unique" ON "payload"."testimonials_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_testimonials_v_parent_idx" ON "payload"."_testimonials_v" USING btree ("parent_id");
  CREATE INDEX "_testimonials_v_version_product_version_product_linked_a_idx" ON "payload"."_testimonials_v" USING btree ("version_product_linked_article_id");
  CREATE INDEX "_testimonials_v_version_version_avatar_idx" ON "payload"."_testimonials_v" USING btree ("version_avatar_id");
  CREATE INDEX "_testimonials_v_version_version_updated_at_idx" ON "payload"."_testimonials_v" USING btree ("version_updated_at");
  CREATE INDEX "_testimonials_v_version_version_created_at_idx" ON "payload"."_testimonials_v" USING btree ("version_created_at");
  CREATE INDEX "_testimonials_v_version_version__status_idx" ON "payload"."_testimonials_v" USING btree ("version__status");
  CREATE INDEX "_testimonials_v_created_at_idx" ON "payload"."_testimonials_v" USING btree ("created_at");
  CREATE INDEX "_testimonials_v_updated_at_idx" ON "payload"."_testimonials_v" USING btree ("updated_at");
  CREATE INDEX "_testimonials_v_snapshot_idx" ON "payload"."_testimonials_v" USING btree ("snapshot");
  CREATE INDEX "_testimonials_v_published_locale_idx" ON "payload"."_testimonials_v" USING btree ("published_locale");
  CREATE INDEX "_testimonials_v_latest_idx" ON "payload"."_testimonials_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_testimonials_v_locales_locale_parent_id_unique" ON "payload"."_testimonials_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "press_mentions_logo_svg_idx" ON "payload"."press_mentions" USING btree ("logo_svg_id");
  CREATE INDEX "press_mentions_updated_at_idx" ON "payload"."press_mentions" USING btree ("updated_at");
  CREATE INDEX "press_mentions_created_at_idx" ON "payload"."press_mentions" USING btree ("created_at");
  CREATE INDEX "press_mentions__status_idx" ON "payload"."press_mentions" USING btree ("_status");
  CREATE UNIQUE INDEX "press_mentions_locales_locale_parent_id_unique" ON "payload"."press_mentions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_press_mentions_v_parent_idx" ON "payload"."_press_mentions_v" USING btree ("parent_id");
  CREATE INDEX "_press_mentions_v_version_version_logo_svg_idx" ON "payload"."_press_mentions_v" USING btree ("version_logo_svg_id");
  CREATE INDEX "_press_mentions_v_version_version_updated_at_idx" ON "payload"."_press_mentions_v" USING btree ("version_updated_at");
  CREATE INDEX "_press_mentions_v_version_version_created_at_idx" ON "payload"."_press_mentions_v" USING btree ("version_created_at");
  CREATE INDEX "_press_mentions_v_version_version__status_idx" ON "payload"."_press_mentions_v" USING btree ("version__status");
  CREATE INDEX "_press_mentions_v_created_at_idx" ON "payload"."_press_mentions_v" USING btree ("created_at");
  CREATE INDEX "_press_mentions_v_updated_at_idx" ON "payload"."_press_mentions_v" USING btree ("updated_at");
  CREATE INDEX "_press_mentions_v_snapshot_idx" ON "payload"."_press_mentions_v" USING btree ("snapshot");
  CREATE INDEX "_press_mentions_v_published_locale_idx" ON "payload"."_press_mentions_v" USING btree ("published_locale");
  CREATE INDEX "_press_mentions_v_latest_idx" ON "payload"."_press_mentions_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_press_mentions_v_locales_locale_parent_id_unique" ON "payload"."_press_mentions_v_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload"."payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload"."payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload"."payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload"."payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload"."payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload"."payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload"."payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_articles_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("articles_id");
  CREATE INDEX "payload_locked_documents_rels_guides_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("guides_id");
  CREATE INDEX "payload_locked_documents_rels_tools_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("tools_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_testimonials_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("testimonials_id");
  CREATE INDEX "payload_locked_documents_rels_press_mentions_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("press_mentions_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload"."payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload"."payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload"."payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload"."payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload"."payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload"."payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload"."payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload"."payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload"."payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_social_links_order_idx" ON "payload"."site_settings_social_links" USING btree ("_order");
  CREATE INDEX "site_settings_social_links_parent_id_idx" ON "payload"."site_settings_social_links" USING btree ("_parent_id");
  CREATE INDEX "site_settings_footer_copy_legal_links_order_idx" ON "payload"."site_settings_footer_copy_legal_links" USING btree ("_order");
  CREATE INDEX "site_settings_footer_copy_legal_links_parent_id_idx" ON "payload"."site_settings_footer_copy_legal_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "site_settings_footer_copy_legal_links_locales_locale_parent_" ON "payload"."site_settings_footer_copy_legal_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings_seo_defaults_seo_defaults_default_og_image_idx" ON "payload"."site_settings" USING btree ("seo_defaults_default_og_image_id");
  CREATE UNIQUE INDEX "site_settings_locales_locale_parent_id_unique" ON "payload"."site_settings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "homepage_blocks_hero_order_idx" ON "payload"."homepage_blocks_hero" USING btree ("_order");
  CREATE INDEX "homepage_blocks_hero_parent_id_idx" ON "payload"."homepage_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_hero_path_idx" ON "payload"."homepage_blocks_hero" USING btree ("_path");
  CREATE INDEX "homepage_blocks_hero_video_media_idx" ON "payload"."homepage_blocks_hero" USING btree ("video_media_id");
  CREATE INDEX "homepage_blocks_hero_fallback_image_idx" ON "payload"."homepage_blocks_hero" USING btree ("fallback_image_id");
  CREATE UNIQUE INDEX "homepage_blocks_hero_locales_locale_parent_id_unique" ON "payload"."homepage_blocks_hero_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "homepage_blocks_drop_order_idx" ON "payload"."homepage_blocks_drop" USING btree ("_order");
  CREATE INDEX "homepage_blocks_drop_parent_id_idx" ON "payload"."homepage_blocks_drop" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_drop_path_idx" ON "payload"."homepage_blocks_drop" USING btree ("_path");
  CREATE INDEX "homepage_blocks_drop_media_idx" ON "payload"."homepage_blocks_drop" USING btree ("media_id");
  CREATE UNIQUE INDEX "homepage_blocks_drop_locales_locale_parent_id_unique" ON "payload"."homepage_blocks_drop_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "homepage_blocks_testimonials_strip_order_idx" ON "payload"."homepage_blocks_testimonials_strip" USING btree ("_order");
  CREATE INDEX "homepage_blocks_testimonials_strip_parent_id_idx" ON "payload"."homepage_blocks_testimonials_strip" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_testimonials_strip_path_idx" ON "payload"."homepage_blocks_testimonials_strip" USING btree ("_path");
  CREATE UNIQUE INDEX "homepage_blocks_testimonials_strip_locales_locale_parent_id_" ON "payload"."homepage_blocks_testimonials_strip_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "homepage_blocks_press_strip_order_idx" ON "payload"."homepage_blocks_press_strip" USING btree ("_order");
  CREATE INDEX "homepage_blocks_press_strip_parent_id_idx" ON "payload"."homepage_blocks_press_strip" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_press_strip_path_idx" ON "payload"."homepage_blocks_press_strip" USING btree ("_path");
  CREATE UNIQUE INDEX "homepage_blocks_press_strip_locales_locale_parent_id_unique" ON "payload"."homepage_blocks_press_strip_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "homepage_blocks_story_order_idx" ON "payload"."homepage_blocks_story" USING btree ("_order");
  CREATE INDEX "homepage_blocks_story_parent_id_idx" ON "payload"."homepage_blocks_story" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_story_path_idx" ON "payload"."homepage_blocks_story" USING btree ("_path");
  CREATE INDEX "homepage_blocks_story_image_right_idx" ON "payload"."homepage_blocks_story" USING btree ("image_right_id");
  CREATE UNIQUE INDEX "homepage_blocks_story_locales_locale_parent_id_unique" ON "payload"."homepage_blocks_story_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "homepage_blocks_newsletter_order_idx" ON "payload"."homepage_blocks_newsletter" USING btree ("_order");
  CREATE INDEX "homepage_blocks_newsletter_parent_id_idx" ON "payload"."homepage_blocks_newsletter" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_newsletter_path_idx" ON "payload"."homepage_blocks_newsletter" USING btree ("_path");
  CREATE UNIQUE INDEX "homepage_blocks_newsletter_locales_locale_parent_id_unique" ON "payload"."homepage_blocks_newsletter_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "homepage_seo_seo_og_image_idx" ON "payload"."homepage" USING btree ("seo_og_image_id");
  CREATE INDEX "homepage__status_idx" ON "payload"."homepage" USING btree ("_status");
  CREATE UNIQUE INDEX "homepage_locales_locale_parent_id_unique" ON "payload"."homepage_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "homepage_rels_order_idx" ON "payload"."homepage_rels" USING btree ("order");
  CREATE INDEX "homepage_rels_parent_idx" ON "payload"."homepage_rels" USING btree ("parent_id");
  CREATE INDEX "homepage_rels_path_idx" ON "payload"."homepage_rels" USING btree ("path");
  CREATE INDEX "homepage_rels_testimonials_id_idx" ON "payload"."homepage_rels" USING btree ("testimonials_id");
  CREATE INDEX "homepage_rels_press_mentions_id_idx" ON "payload"."homepage_rels" USING btree ("press_mentions_id");
  CREATE INDEX "_homepage_v_blocks_hero_order_idx" ON "payload"."_homepage_v_blocks_hero" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_hero_parent_id_idx" ON "payload"."_homepage_v_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_hero_path_idx" ON "payload"."_homepage_v_blocks_hero" USING btree ("_path");
  CREATE INDEX "_homepage_v_blocks_hero_video_media_idx" ON "payload"."_homepage_v_blocks_hero" USING btree ("video_media_id");
  CREATE INDEX "_homepage_v_blocks_hero_fallback_image_idx" ON "payload"."_homepage_v_blocks_hero" USING btree ("fallback_image_id");
  CREATE UNIQUE INDEX "_homepage_v_blocks_hero_locales_locale_parent_id_unique" ON "payload"."_homepage_v_blocks_hero_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_homepage_v_blocks_drop_order_idx" ON "payload"."_homepage_v_blocks_drop" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_drop_parent_id_idx" ON "payload"."_homepage_v_blocks_drop" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_drop_path_idx" ON "payload"."_homepage_v_blocks_drop" USING btree ("_path");
  CREATE INDEX "_homepage_v_blocks_drop_media_idx" ON "payload"."_homepage_v_blocks_drop" USING btree ("media_id");
  CREATE UNIQUE INDEX "_homepage_v_blocks_drop_locales_locale_parent_id_unique" ON "payload"."_homepage_v_blocks_drop_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_homepage_v_blocks_testimonials_strip_order_idx" ON "payload"."_homepage_v_blocks_testimonials_strip" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_testimonials_strip_parent_id_idx" ON "payload"."_homepage_v_blocks_testimonials_strip" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_testimonials_strip_path_idx" ON "payload"."_homepage_v_blocks_testimonials_strip" USING btree ("_path");
  CREATE UNIQUE INDEX "_homepage_v_blocks_testimonials_strip_locales_locale_parent_" ON "payload"."_homepage_v_blocks_testimonials_strip_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_homepage_v_blocks_press_strip_order_idx" ON "payload"."_homepage_v_blocks_press_strip" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_press_strip_parent_id_idx" ON "payload"."_homepage_v_blocks_press_strip" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_press_strip_path_idx" ON "payload"."_homepage_v_blocks_press_strip" USING btree ("_path");
  CREATE UNIQUE INDEX "_homepage_v_blocks_press_strip_locales_locale_parent_id_uniq" ON "payload"."_homepage_v_blocks_press_strip_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_homepage_v_blocks_story_order_idx" ON "payload"."_homepage_v_blocks_story" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_story_parent_id_idx" ON "payload"."_homepage_v_blocks_story" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_story_path_idx" ON "payload"."_homepage_v_blocks_story" USING btree ("_path");
  CREATE INDEX "_homepage_v_blocks_story_image_right_idx" ON "payload"."_homepage_v_blocks_story" USING btree ("image_right_id");
  CREATE UNIQUE INDEX "_homepage_v_blocks_story_locales_locale_parent_id_unique" ON "payload"."_homepage_v_blocks_story_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_homepage_v_blocks_newsletter_order_idx" ON "payload"."_homepage_v_blocks_newsletter" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_newsletter_parent_id_idx" ON "payload"."_homepage_v_blocks_newsletter" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_newsletter_path_idx" ON "payload"."_homepage_v_blocks_newsletter" USING btree ("_path");
  CREATE UNIQUE INDEX "_homepage_v_blocks_newsletter_locales_locale_parent_id_uniqu" ON "payload"."_homepage_v_blocks_newsletter_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_homepage_v_version_seo_version_seo_og_image_idx" ON "payload"."_homepage_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_homepage_v_version_version__status_idx" ON "payload"."_homepage_v" USING btree ("version__status");
  CREATE INDEX "_homepage_v_created_at_idx" ON "payload"."_homepage_v" USING btree ("created_at");
  CREATE INDEX "_homepage_v_updated_at_idx" ON "payload"."_homepage_v" USING btree ("updated_at");
  CREATE INDEX "_homepage_v_snapshot_idx" ON "payload"."_homepage_v" USING btree ("snapshot");
  CREATE INDEX "_homepage_v_published_locale_idx" ON "payload"."_homepage_v" USING btree ("published_locale");
  CREATE INDEX "_homepage_v_latest_idx" ON "payload"."_homepage_v" USING btree ("latest");
  CREATE INDEX "_homepage_v_autosave_idx" ON "payload"."_homepage_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "_homepage_v_locales_locale_parent_id_unique" ON "payload"."_homepage_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_homepage_v_rels_order_idx" ON "payload"."_homepage_v_rels" USING btree ("order");
  CREATE INDEX "_homepage_v_rels_parent_idx" ON "payload"."_homepage_v_rels" USING btree ("parent_id");
  CREATE INDEX "_homepage_v_rels_path_idx" ON "payload"."_homepage_v_rels" USING btree ("path");
  CREATE INDEX "_homepage_v_rels_testimonials_id_idx" ON "payload"."_homepage_v_rels" USING btree ("testimonials_id");
  CREATE INDEX "_homepage_v_rels_press_mentions_id_idx" ON "payload"."_homepage_v_rels" USING btree ("press_mentions_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "payload"."users_sessions" CASCADE;
  DROP TABLE "payload"."users" CASCADE;
  DROP TABLE "payload"."articles_highlights" CASCADE;
  DROP TABLE "payload"."articles_pull_quotes" CASCADE;
  DROP TABLE "payload"."articles_faq" CASCADE;
  DROP TABLE "payload"."articles_tags" CASCADE;
  DROP TABLE "payload"."articles" CASCADE;
  DROP TABLE "payload"."articles_locales" CASCADE;
  DROP TABLE "payload"."_articles_v_version_highlights" CASCADE;
  DROP TABLE "payload"."_articles_v_version_pull_quotes" CASCADE;
  DROP TABLE "payload"."_articles_v_version_faq" CASCADE;
  DROP TABLE "payload"."_articles_v_version_tags" CASCADE;
  DROP TABLE "payload"."_articles_v" CASCADE;
  DROP TABLE "payload"."_articles_v_locales" CASCADE;
  DROP TABLE "payload"."guides_faq" CASCADE;
  DROP TABLE "payload"."guides" CASCADE;
  DROP TABLE "payload"."guides_locales" CASCADE;
  DROP TABLE "payload"."_guides_v_version_faq" CASCADE;
  DROP TABLE "payload"."_guides_v" CASCADE;
  DROP TABLE "payload"."_guides_v_locales" CASCADE;
  DROP TABLE "payload"."tools" CASCADE;
  DROP TABLE "payload"."tools_locales" CASCADE;
  DROP TABLE "payload"."_tools_v" CASCADE;
  DROP TABLE "payload"."_tools_v_locales" CASCADE;
  DROP TABLE "payload"."media" CASCADE;
  DROP TABLE "payload"."media_locales" CASCADE;
  DROP TABLE "payload"."testimonials" CASCADE;
  DROP TABLE "payload"."testimonials_locales" CASCADE;
  DROP TABLE "payload"."_testimonials_v" CASCADE;
  DROP TABLE "payload"."_testimonials_v_locales" CASCADE;
  DROP TABLE "payload"."press_mentions" CASCADE;
  DROP TABLE "payload"."press_mentions_locales" CASCADE;
  DROP TABLE "payload"."_press_mentions_v" CASCADE;
  DROP TABLE "payload"."_press_mentions_v_locales" CASCADE;
  DROP TABLE "payload"."payload_kv" CASCADE;
  DROP TABLE "payload"."payload_locked_documents" CASCADE;
  DROP TABLE "payload"."payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload"."payload_preferences" CASCADE;
  DROP TABLE "payload"."payload_preferences_rels" CASCADE;
  DROP TABLE "payload"."payload_migrations" CASCADE;
  DROP TABLE "payload"."site_settings_social_links" CASCADE;
  DROP TABLE "payload"."site_settings_footer_copy_legal_links" CASCADE;
  DROP TABLE "payload"."site_settings_footer_copy_legal_links_locales" CASCADE;
  DROP TABLE "payload"."site_settings" CASCADE;
  DROP TABLE "payload"."site_settings_locales" CASCADE;
  DROP TABLE "payload"."homepage_blocks_hero" CASCADE;
  DROP TABLE "payload"."homepage_blocks_hero_locales" CASCADE;
  DROP TABLE "payload"."homepage_blocks_drop" CASCADE;
  DROP TABLE "payload"."homepage_blocks_drop_locales" CASCADE;
  DROP TABLE "payload"."homepage_blocks_testimonials_strip" CASCADE;
  DROP TABLE "payload"."homepage_blocks_testimonials_strip_locales" CASCADE;
  DROP TABLE "payload"."homepage_blocks_press_strip" CASCADE;
  DROP TABLE "payload"."homepage_blocks_press_strip_locales" CASCADE;
  DROP TABLE "payload"."homepage_blocks_story" CASCADE;
  DROP TABLE "payload"."homepage_blocks_story_locales" CASCADE;
  DROP TABLE "payload"."homepage_blocks_newsletter" CASCADE;
  DROP TABLE "payload"."homepage_blocks_newsletter_locales" CASCADE;
  DROP TABLE "payload"."homepage" CASCADE;
  DROP TABLE "payload"."homepage_locales" CASCADE;
  DROP TABLE "payload"."homepage_rels" CASCADE;
  DROP TABLE "payload"."_homepage_v_blocks_hero" CASCADE;
  DROP TABLE "payload"."_homepage_v_blocks_hero_locales" CASCADE;
  DROP TABLE "payload"."_homepage_v_blocks_drop" CASCADE;
  DROP TABLE "payload"."_homepage_v_blocks_drop_locales" CASCADE;
  DROP TABLE "payload"."_homepage_v_blocks_testimonials_strip" CASCADE;
  DROP TABLE "payload"."_homepage_v_blocks_testimonials_strip_locales" CASCADE;
  DROP TABLE "payload"."_homepage_v_blocks_press_strip" CASCADE;
  DROP TABLE "payload"."_homepage_v_blocks_press_strip_locales" CASCADE;
  DROP TABLE "payload"."_homepage_v_blocks_story" CASCADE;
  DROP TABLE "payload"."_homepage_v_blocks_story_locales" CASCADE;
  DROP TABLE "payload"."_homepage_v_blocks_newsletter" CASCADE;
  DROP TABLE "payload"."_homepage_v_blocks_newsletter_locales" CASCADE;
  DROP TABLE "payload"."_homepage_v" CASCADE;
  DROP TABLE "payload"."_homepage_v_locales" CASCADE;
  DROP TABLE "payload"."_homepage_v_rels" CASCADE;
  DROP TYPE "payload"."_locales";
  DROP TYPE "payload"."enum_users_role";
  DROP TYPE "payload"."enum_articles_category";
  DROP TYPE "payload"."enum_articles_status";
  DROP TYPE "payload"."enum__articles_v_version_category";
  DROP TYPE "payload"."enum__articles_v_version_status";
  DROP TYPE "payload"."enum__articles_v_published_locale";
  DROP TYPE "payload"."enum_guides_country";
  DROP TYPE "payload"."enum_guides_status";
  DROP TYPE "payload"."enum__guides_v_version_country";
  DROP TYPE "payload"."enum__guides_v_version_status";
  DROP TYPE "payload"."enum__guides_v_published_locale";
  DROP TYPE "payload"."enum_tools_status";
  DROP TYPE "payload"."enum__tools_v_version_status";
  DROP TYPE "payload"."enum__tools_v_published_locale";
  DROP TYPE "payload"."enum_testimonials_status";
  DROP TYPE "payload"."enum__testimonials_v_version_status";
  DROP TYPE "payload"."enum__testimonials_v_published_locale";
  DROP TYPE "payload"."enum_press_mentions_status";
  DROP TYPE "payload"."enum__press_mentions_v_version_status";
  DROP TYPE "payload"."enum__press_mentions_v_published_locale";
  DROP TYPE "payload"."enum_site_settings_social_links_platform";
  DROP TYPE "payload"."enum_homepage_blocks_hero_align";
  DROP TYPE "payload"."enum_homepage_blocks_testimonials_strip_layout";
  DROP TYPE "payload"."enum_homepage_blocks_story_image_layout";
  DROP TYPE "payload"."enum_homepage_status";
  DROP TYPE "payload"."enum__homepage_v_blocks_hero_align";
  DROP TYPE "payload"."enum__homepage_v_blocks_testimonials_strip_layout";
  DROP TYPE "payload"."enum__homepage_v_blocks_story_image_layout";
  DROP TYPE "payload"."enum__homepage_v_version_status";
  DROP TYPE "payload"."enum__homepage_v_published_locale";`)
}
