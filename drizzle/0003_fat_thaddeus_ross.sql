CREATE TYPE "public"."content_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TABLE "case_study_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"company" text NOT NULL,
	"category" text NOT NULL,
	"industry" text NOT NULL,
	"fact_type" text NOT NULL,
	"problem" text NOT NULL,
	"solution" text NOT NULL,
	"customer" text NOT NULL,
	"business_model" text NOT NULL,
	"revenue_model" text NOT NULL,
	"growth" text NOT NULL,
	"competition" text NOT NULL,
	"challenges" text NOT NULL,
	"lessons" text DEFAULT '[]' NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "formula_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"expression" text NOT NULL,
	"explanation" text NOT NULL,
	"example" text NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "glossary_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"term" text NOT NULL,
	"slug" text NOT NULL,
	"definition" text NOT NULL,
	"example" text NOT NULL,
	"formula" text,
	"mnemonic" text,
	"related_terms" text DEFAULT '[]' NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "case_study_entries" ADD CONSTRAINT "case_study_entries_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "case_study_entries" ADD CONSTRAINT "case_study_entries_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "formula_entries" ADD CONSTRAINT "formula_entries_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "formula_entries" ADD CONSTRAINT "formula_entries_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "glossary_entries" ADD CONSTRAINT "glossary_entries_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "glossary_entries" ADD CONSTRAINT "glossary_entries_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "case_study_entries_status_idx" ON "case_study_entries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "case_study_entries_category_idx" ON "case_study_entries" USING btree ("category");--> statement-breakpoint
CREATE INDEX "formula_entries_status_idx" ON "formula_entries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "formula_entries_category_idx" ON "formula_entries" USING btree ("category");--> statement-breakpoint
CREATE UNIQUE INDEX "glossary_entries_slug_unique" ON "glossary_entries" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "glossary_entries_status_idx" ON "glossary_entries" USING btree ("status");