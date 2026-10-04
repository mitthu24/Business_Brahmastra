import { pgTable, pgEnum, text, integer, boolean, timestamp, uniqueIndex, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

function id() {
  return text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());
}

export const userRoleEnum = pgEnum("user_role", ["user", "founder"]);

/**
 * Phase 5 access fields (see docs/PHASE-5.md "Access-state model"):
 * - `role` distinguishes founder accounts from regular learners. Checked server-side on every
 *   founder route/action - never trusted from the client.
 * - `trialStartedAt`/`trialEndsAt` are set once, server-side, at signup (never from the client or
 *   browser clock) and are the sole basis for the TRIAL/EXPIRED boundary.
 * - `accessActivatedAt` presence means a founder has granted this user standing ACTIVE access
 *   (bypasses trial expiry). `suspendedAt` presence means a founder has revoked access; it is
 *   checked first so it always wins over an activated or still-trialing account.
 * Access status itself is never stored - it's derived on every read by
 * src/lib/access/status.ts#computeAccessStatus, so there is nothing to go stale.
 */
export const users = pgTable("users", {
  id: id(),
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("user"),
  trialStartedAt: timestamp("trial_started_at", { withTimezone: true }).notNull().defaultNow(),
  trialEndsAt: timestamp("trial_ends_at", { withTimezone: true })
    .notNull()
    .default(sql`(now() + interval '3 days')`),
  accessActivatedAt: timestamp("access_activated_at", { withTimezone: true }),
  suspendedAt: timestamp("suspended_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("users_email_unique").on(t.email),
  index("users_role_idx").on(t.role),
]);

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

/**
 * Append-only founder action log (Phase 5.3, docs/PHASE-5.3.md "Audit logging"). Written by every
 * founder mutation (user create/update/suspend/reactivate/access-grant/password-reset, and later
 * content CRUD) - never by learner actions. `founderId` is nullable with ON DELETE SET NULL rather
 * than CASCADE so a log entry survives even if the founder account is later removed - an audit
 * trail that disappears when its author is deleted defeats its own purpose. Never stores passwords,
 * hashes, DATABASE_URL, or session tokens - only entity references and small descriptive metadata.
 */
export const auditLogs = pgTable("audit_logs", {
  id: id(),
  founderId: text("founder_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  metadata: text("metadata"), // JSON-encoded, small descriptive context only - see note above
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("audit_logs_founder_id_idx").on(t.founderId),
  index("audit_logs_action_idx").on(t.action),
  index("audit_logs_entity_idx").on(t.entityType, t.entityId),
  index("audit_logs_created_at_idx").on(t.createdAt),
]);

/**
 * Reference-content CMS (Phase 5.3 slice 2, docs/PHASE-5.3.md "Reference content CMS"). Three
 * tables - glossary, formula library, case studies - each carrying a founder-managed `status` so
 * draft/archived rows are never learner-visible. The primary key is the SAME stable slug/id the
 * existing hardcoded content in src/lib/content/{glossary,formulas,case-studies}.ts already uses
 * (e.g. "revenue", "profit", "zerodha") - not a generated UUID - so a future cutover of the public
 * routes to read from these tables needs no reference rewriting anywhere. Array fields are
 * JSON-encoded text, matching the auditLogs.metadata convention above (this schema has no jsonb
 * column type in use elsewhere, and PGlite/postgres.js parity is easier to keep with plain text).
 */
export const contentStatusEnum = pgEnum("content_status", ["draft", "published", "archived"]);

export const glossaryEntries = pgTable("glossary_entries", {
  id: text("id").primaryKey(), // the existing stable slug, e.g. "revenue"
  term: text("term").notNull(),
  slug: text("slug").notNull(),
  definition: text("definition").notNull(),
  example: text("example").notNull(),
  formula: text("formula"),
  mnemonic: text("mnemonic"),
  relatedTerms: text("related_terms").notNull().default("[]"), // JSON-encoded string[]
  status: contentStatusEnum("status").notNull().default("draft"),
  createdBy: text("created_by").references(() => users.id, { onDelete: "set null" }),
  updatedBy: text("updated_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("glossary_entries_slug_unique").on(t.slug),
  index("glossary_entries_status_idx").on(t.status),
]);

export const formulaEntries = pgTable("formula_entries", {
  id: text("id").primaryKey(), // the existing stable id, e.g. "profit"
  name: text("name").notNull(),
  category: text("category").notNull(),
  expression: text("expression").notNull(),
  explanation: text("explanation").notNull(),
  example: text("example").notNull(),
  status: contentStatusEnum("status").notNull().default("draft"),
  createdBy: text("created_by").references(() => users.id, { onDelete: "set null" }),
  updatedBy: text("updated_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("formula_entries_status_idx").on(t.status),
  index("formula_entries_category_idx").on(t.category),
]);

export const caseStudyEntries = pgTable("case_study_entries", {
  id: text("id").primaryKey(), // the existing stable id, e.g. "zerodha"
  company: text("company").notNull(),
  category: text("category").notNull(),
  industry: text("industry").notNull(),
  factType: text("fact_type").notNull(),
  problem: text("problem").notNull(),
  solution: text("solution").notNull(),
  customer: text("customer").notNull(),
  businessModel: text("business_model").notNull(),
  revenueModel: text("revenue_model").notNull(),
  growth: text("growth").notNull(),
  competition: text("competition").notNull(),
  challenges: text("challenges").notNull(),
  lessons: text("lessons").notNull().default("[]"), // JSON-encoded string[]
  status: contentStatusEnum("status").notNull().default("draft"),
  createdBy: text("created_by").references(() => users.id, { onDelete: "set null" }),
  updatedBy: text("updated_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("case_study_entries_status_idx").on(t.status),
  index("case_study_entries_category_idx").on(t.category),
]);

/**
 * Curriculum/lesson CMS (Phase 5.3 slice 3, docs/PHASE-5.3.md "Curriculum + lesson CMS"). One flat
 * table mirroring the existing `Lesson` shape (src/lib/content/types.ts) field-for-field - no
 * lesson_sections/vocabulary/exercises/quizzes normalization, since the real lesson model has no
 * variable-cardinality content beyond the small, fixed-shape `quiz` array, which is stored as JSON
 * exactly like glossaryEntries.relatedTerms above.
 *
 * `day` (1-90) is the canonical identifier used by every piece of learner state in this app
 * (lesson_completions.day, exercise_completions.day, case_study_completions.day, quiz_attempts.day,
 * achievements' phase-range checks, the client progress store, the localStorage migration) - see
 * docs/PHASE-5.3.md "Curriculum CMS: stable identifiers" for the full inventory. `id` is kept as
 * the exact "day-N" string the app already uses as a lesson identifier (lesson_reflections.lesson_id
 * persists this literal string), generated from `day` so it never drifts. `slug` is carried along
 * for parity with the hardcoded source but - like in the hardcoded model - has no route or
 * progress-key role; it is purely descriptive.
 *
 * `phaseId` is a plain text reference to the existing hardcoded `phases` array
 * (src/lib/content/phases.ts), not a foreign key to a curriculum_phases table: there are exactly
 * 15 fixed phases with fixed day ranges, nothing about them is founder-editable in this slice, and
 * a phases table would add a join everywhere phases are already resolved by a simple day-range
 * lookup (getPhaseForDay) with zero behavioral benefit.
 */
export const lessons = pgTable("lessons", {
  id: text("id").primaryKey(), // "day-N", generated from day - see note above
  day: integer("day").notNull(),
  phaseId: text("phase_id").notNull(),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  objective: text("objective").notNull(),
  concept: text("concept").notNull(),
  simpleExplanation: text("simple_explanation").notNull(),
  analogy: text("analogy").notNull(),
  businessExample: text("business_example").notNull(),
  indiaExample: text("india_example"),
  startupExample: text("startup_example"),
  formula: text("formula"), // JSON-encoded {name, expression, workedExample} | null
  mnemonic: text("mnemonic"), // JSON-encoded {label, breakdown: string[]} | null
  commonMistake: text("common_mistake").notNull(),
  exercisePrompt: text("exercise_prompt").notNull(),
  exerciseAnswer: text("exercise_answer").notNull(),
  caseStudy: text("case_study").notNull(),
  founderQuestion: text("founder_question").notNull(),
  quiz: text("quiz").notNull().default("[]"), // JSON-encoded QuizQuestion[]
  takeaways: text("takeaways").notNull().default("[]"), // JSON-encoded string[]
  rememberThis: text("remember_this").notNull(),
  status: contentStatusEnum("status").notNull().default("draft"),
  // Phase 5.3 slice 4 (docs/PHASE-5.3.md "Exercise/Quiz CMS"): the exercise and quiz are sub-fields
  // of the lesson, not separate content types (there is no standalone exercise/quiz table or id
  // anywhere in this app), so their founder-facing CMS pages are specialized views onto THESE two
  // columns rather than a duplicate table - that would create a second, divergent source of truth
  // for content the lesson editor already owns. Independent of the lesson's own `status`, so a
  // founder can hide just the exercise or just the quiz within an otherwise-published lesson
  // (checked by the learner read path in lesson-queries.ts). Migrating the 90 existing lessons
  // backfills both to 'published' (see content-seed.ts) so already-live exercises/quizzes are never
  // hidden by this column's existence; new lessons default to 'draft' like the lesson itself.
  exerciseStatus: contentStatusEnum("exercise_status").notNull().default("draft"),
  quizStatus: contentStatusEnum("quiz_status").notNull().default("draft"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdBy: text("created_by").references(() => users.id, { onDelete: "set null" }),
  updatedBy: text("updated_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("lessons_day_unique").on(t.day),
  uniqueIndex("lessons_slug_unique").on(t.slug),
  index("lessons_phase_id_idx").on(t.phaseId),
  index("lessons_status_idx").on(t.status),
  index("lessons_updated_at_idx").on(t.updatedAt),
  index("lessons_exercise_status_idx").on(t.exerciseStatus),
  index("lessons_quiz_status_idx").on(t.quizStatus),
]);

/**
 * Achievement CMS (Phase 5.3 slice 4). Metadata-only, by design (docs/PHASE-5.3.md "Achievement
 * CMS"): unlock REQUIREMENTS stay exactly where they are, as trusted code in
 * src/lib/progress/achievements.ts#computeUnlockedAchievements - this table never stores or
 * executes founder-entered logic. `id` is the SAME stable string the trusted engine already uses
 * ("first-step", "seven-day-founder", ...), not a generated id, and a row can only be created for
 * an id the engine already knows about (enforced in src/app/founder/achievement-actions.ts) -
 * never a free-form new id, which would silently never unlock for anyone. `xp` is informational
 * display copy only; actual XP awarded is still the flat constants in src/lib/progress/xp.ts,
 * unchanged.
 */
export const achievementEntries = pgTable("achievement_entries", {
  id: text("id").primaryKey(), // the existing trusted achievement id, e.g. "first-step"
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  category: text("category").notNull().default("Milestone"),
  xp: integer("xp").notNull().default(0),
  status: contentStatusEnum("status").notNull().default("draft"),
  createdBy: text("created_by").references(() => users.id, { onDelete: "set null" }),
  updatedBy: text("updated_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("achievement_entries_status_idx").on(t.status),
  index("achievement_entries_category_idx").on(t.category),
]);

/**
 * Calculator CMS (Phase 5.3 slice 4). Directory metadata only (docs/PHASE-5.3.md "Calculator
 * CMS") - the 12 calculation functions (src/lib/calculators.ts) and their React forms stay trusted
 * application code; nothing founder-entered is ever evaluated. `id` is the existing calculator
 * slug (e.g. "profit"), matching src/lib/calculator-meta.ts, not a generated id - there is no
 * "create a new calculator" flow since a new calculator needs real trusted compute code, not data.
 */
export const calculatorEntries = pgTable("calculator_entries", {
  id: text("id").primaryKey(), // the existing calculator slug, e.g. "profit"
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull().default("General"),
  helpText: text("help_text"),
  ordering: integer("ordering").notNull().default(0),
  status: contentStatusEnum("status").notNull().default("draft"),
  createdBy: text("created_by").references(() => users.id, { onDelete: "set null" }),
  updatedBy: text("updated_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("calculator_entries_status_idx").on(t.status),
  index("calculator_entries_category_idx").on(t.category),
  index("calculator_entries_ordering_idx").on(t.ordering),
]);
