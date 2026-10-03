import { pgTable, text, integer, boolean, timestamp, uniqueIndex, index } from "drizzle-orm/pg-core";

function id() {
  return text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());
}

export const users = pgTable("users", {
  id: id(),
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex("users_email_unique").on(t.email)]);

export const userProfiles = pgTable("user_profiles", {
  id: id(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  avatarInitials: text("avatar_initials").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex("user_profiles_user_id_unique").on(t.userId)]);

/**
 * Streak state that cannot be derived from completion rows alone (it depends on *when*,
 * in calendar time, the user was last active - see src/lib/progress/streak.ts). Everything
 * else (XP, completed days, achievements) is derived on read from the completion tables below
 * instead of being duplicated here - see docs/PHASE-4.md "Why no duplicated UserProgress row".
 */
export const userStreaks = pgTable("user_streaks", {
  userId: text("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastActivityDate: text("last_activity_date"), // YYYY-MM-DD
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const lessonCompletions = pgTable("lesson_completions", {
  id: id(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  day: integer("day").notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("lesson_completions_user_day_unique").on(t.userId, t.day),
  index("lesson_completions_user_id_idx").on(t.userId),
]);

export const exerciseCompletions = pgTable("exercise_completions", {
  id: id(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  day: integer("day").notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("exercise_completions_user_day_unique").on(t.userId, t.day),
  index("exercise_completions_user_id_idx").on(t.userId),
]);

export const caseStudyCompletions = pgTable("case_study_completions", {
  id: id(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  day: integer("day").notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("case_study_completions_user_day_unique").on(t.userId, t.day),
  index("case_study_completions_user_id_idx").on(t.userId),
]);

export const quizAttempts = pgTable("quiz_attempts", {
  id: id(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  day: integer("day").notNull(),
  score: integer("score").notNull(), // count of correct answers
  totalQuestions: integer("total_questions").notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  // One recorded attempt per lesson day, mirroring the existing store (quizAttempts keyed by lessonId,
  // XP only awarded once - see src/lib/progress/store.ts submitQuiz).
  uniqueIndex("quiz_attempts_user_day_unique").on(t.userId, t.day),
  index("quiz_attempts_user_id_idx").on(t.userId),
]);

export const achievements = pgTable("achievements", {
  id: id(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  achievementId: text("achievement_id").notNull(),
  unlockedAt: timestamp("unlocked_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("achievements_user_achievement_unique").on(t.userId, t.achievementId),
  index("achievements_user_id_idx").on(t.userId),
]);

export const lessonReflections = pgTable("lesson_reflections", {
  id: id(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  lessonId: text("lesson_id").notNull(),
  learned: text("learned").notNull().default(""),
  application: text("application").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("lesson_reflections_user_lesson_unique").on(t.userId, t.lessonId),
  index("lesson_reflections_user_id_idx").on(t.userId),
]);

export const journalEntries = pgTable("journal_entries", {
  id: id(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  category: text("category").notNull(),
  text: text("text").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("journal_entries_user_id_idx").on(t.userId),
  index("journal_entries_user_created_idx").on(t.userId, t.createdAt),
]);

// Business Model Canvas - one row per user, one column per of the 9 canvas blocks
// (field names match src/components/canvas/CanvasView.tsx block ids exactly).
export const canvases = pgTable("canvases", {
  userId: text("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  keyPartners: text("key_partners").notNull().default(""),
  keyActivities: text("key_activities").notNull().default(""),
  valueProposition: text("value_proposition").notNull().default(""),
  customerRelationships: text("customer_relationships").notNull().default(""),
  customerSegments: text("customer_segments").notNull().default(""),
  keyResources: text("key_resources").notNull().default(""),
  channels: text("channels").notNull().default(""),
  costStructure: text("cost_structure").notNull().default(""),
  revenueStreams: text("revenue_streams").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const finalProjects = pgTable("final_projects", {
  id: id(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull().default(""),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex("final_projects_user_id_unique").on(t.userId)]);

export const finalProjectSteps = pgTable("final_project_steps", {
  id: id(),
  finalProjectId: text("final_project_id").notNull().references(() => finalProjects.id, { onDelete: "cascade" }),
  stepNumber: integer("step_number").notNull(),
  content: text("content").notNull().default(""),
  completed: boolean("completed").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("final_project_steps_project_step_unique").on(t.finalProjectId, t.stepNumber),
  index("final_project_steps_project_id_idx").on(t.finalProjectId),
]);

export const sessions = pgTable("sessions", {
  id: id(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("sessions_token_hash_unique").on(t.tokenHash),
  index("sessions_user_id_idx").on(t.userId),
]);

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: id(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  consumedAt: timestamp("consumed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("password_reset_tokens_token_hash_unique").on(t.tokenHash),
  index("password_reset_tokens_user_id_idx").on(t.userId),
]);

// Marks that the one-time localStorage -> cloud merge has run for a user, so it is never repeated.
export const migrationStatus = pgTable("migration_status", {
  userId: text("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  migratedAt: timestamp("migrated_at", { withTimezone: true }).notNull().defaultNow(),
});
