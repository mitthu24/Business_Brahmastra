CREATE TABLE "lessons" (
	"id" text PRIMARY KEY NOT NULL,
	"day" integer NOT NULL,
	"phase_id" text NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"objective" text NOT NULL,
	"concept" text NOT NULL,
	"simple_explanation" text NOT NULL,
	"analogy" text NOT NULL,
	"business_example" text NOT NULL,
	"india_example" text,
	"startup_example" text,
	"formula" text,
	"mnemonic" text,
	"common_mistake" text NOT NULL,
	"exercise_prompt" text NOT NULL,
	"exercise_answer" text NOT NULL,
	"case_study" text NOT NULL,
	"founder_question" text NOT NULL,
	"quiz" text DEFAULT '[]' NOT NULL,
	"takeaways" text DEFAULT '[]' NOT NULL,
	"remember_this" text NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "lessons_day_unique" ON "lessons" USING btree ("day");--> statement-breakpoint
CREATE UNIQUE INDEX "lessons_slug_unique" ON "lessons" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "lessons_phase_id_idx" ON "lessons" USING btree ("phase_id");--> statement-breakpoint
CREATE INDEX "lessons_status_idx" ON "lessons" USING btree ("status");--> statement-breakpoint
CREATE INDEX "lessons_updated_at_idx" ON "lessons" USING btree ("updated_at");