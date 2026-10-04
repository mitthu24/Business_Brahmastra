CREATE TABLE "achievement_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"icon" text NOT NULL,
	"category" text DEFAULT 'Milestone' NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calculator_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text DEFAULT 'General' NOT NULL,
	"help_text" text,
	"ordering" integer DEFAULT 0 NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "exercise_status" "content_status" DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "quiz_status" "content_status" DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "achievement_entries" ADD CONSTRAINT "achievement_entries_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "achievement_entries" ADD CONSTRAINT "achievement_entries_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calculator_entries" ADD CONSTRAINT "calculator_entries_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calculator_entries" ADD CONSTRAINT "calculator_entries_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "achievement_entries_status_idx" ON "achievement_entries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "achievement_entries_category_idx" ON "achievement_entries" USING btree ("category");--> statement-breakpoint
CREATE INDEX "calculator_entries_status_idx" ON "calculator_entries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "calculator_entries_category_idx" ON "calculator_entries" USING btree ("category");--> statement-breakpoint
CREATE INDEX "calculator_entries_ordering_idx" ON "calculator_entries" USING btree ("ordering");--> statement-breakpoint
CREATE INDEX "lessons_exercise_status_idx" ON "lessons" USING btree ("exercise_status");--> statement-breakpoint
CREATE INDEX "lessons_quiz_status_idx" ON "lessons" USING btree ("quiz_status");