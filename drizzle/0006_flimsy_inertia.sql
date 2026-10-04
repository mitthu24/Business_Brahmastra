CREATE TABLE "curriculum_phase_overrides" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_settings" (
	"id" text PRIMARY KEY DEFAULT 'singleton' NOT NULL,
	"product_name" text DEFAULT '90-Day Business School' NOT NULL,
	"product_description" text DEFAULT '' NOT NULL,
	"logo_url" text,
	"default_trial_days" integer DEFAULT 3 NOT NULL,
	"default_new_user_access" text DEFAULT 'trial' NOT NULL,
	"default_content_status" "content_status" DEFAULT 'draft' NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "curriculum_phase_overrides" ADD CONSTRAINT "curriculum_phase_overrides_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_settings" ADD CONSTRAINT "product_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;