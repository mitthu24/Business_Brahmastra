CREATE TYPE "public"."user_role" AS ENUM('user', 'founder');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" "user_role" DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "trial_started_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "trial_ends_at" timestamp with time zone DEFAULT (now() + interval '3 days') NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "access_activated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "suspended_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
-- Grandfather every user that already existed before Phase 5's trial model: without this, an
-- existing user's brand-new trial_ends_at (now() + 3 days, set by the column default above) would
-- make an established account suddenly look like it's about to expire. Any row created by this
-- same migration's ADD COLUMN above has access_activated_at NULL at this point, so this WHERE
-- clause ony backfills true pre-Phase-5 rows - a user who signs up after this migration runs will
-- correctly fall into the real TRIAL state, not ACTIVE. See docs/PHASE-5.md "Database".
UPDATE "users" SET "access_activated_at" = COALESCE("access_activated_at", "created_at") WHERE "access_activated_at" IS NULL;