import "server-only";
import { eq, desc, sql } from "drizzle-orm";
import type { Database } from "./types";
import {
  users,
  userProfiles,
  userStreaks,
  lessonCompletions,
  exerciseCompletions,
  quizAttempts,
  achievements,
  finalProjects,
} from "./schema";
import { computeAccessStatus, getAccessInfo, type AccessStatus, type AccessInfo } from "@/lib/access/status";
import { getProgressSnapshot, type ProgressSnapshot } from "./progress-queries";
import { deleteAllSessionsForUser } from "./auth-queries";

export interface FounderUserRow {
  id: string;
  email: string;
  name: string | null;
  role: "user" | "founder";
  createdAt: Date;
  trialStartedAt: Date;
  trialEndsAt: Date;
  accessActivatedAt: Date | null;
  suspendedAt: Date | null;
  status: AccessStatus;
  completedDays: number;
}

/** Everything the founder Users page needs, in one query per table (no N+1) - see
 * docs/PHASE-5.md "Founder user management". Status is computed in app code with the same
 * canonical function every other access check uses, never duplicated. */
export async function listUsersForFounder(db: Database): Promise<FounderUserRow[]> {
  const [userRows, profileRows, completionCounts] = await Promise.all([
    db.select().from(users).orderBy(desc(users.createdAt)),
    db.select().from(userProfiles),
    db
      .select({ userId: lessonCompletions.userId, count: sql<number>`count(*)::int` })
      .from(lessonCompletions)
      .groupBy(lessonCompletions.userId),
  ]);

  const nameByUserId = new Map(profileRows.map((p) => [p.userId, p.name]));
  const completedByUserId = new Map(completionCounts.map((c) => [c.userId, c.count]));

  return userRows.map((u) => ({
    id: u.id,
    email: u.email,
    name: nameByUserId.get(u.id) ?? null,
    role: u.role,
    createdAt: u.createdAt,
    trialStartedAt: u.trialStartedAt,
    trialEndsAt: u.trialEndsAt,
    accessActivatedAt: u.accessActivatedAt,
    suspendedAt: u.suspendedAt,
    status: computeAccessStatus(u),
    completedDays: completedByUserId.get(u.id) ?? 0,
  }));
}

export interface FounderDashboardStats {
  totalUsers: number;
  activeTrials: number;
  expiredTrials: number;
  activeUsers: number;
  suspendedUsers: number;
  recentSignups: FounderUserRow[];
  totalLessonsCompleted: number;
  averageProgressPercent: number;
  usersStarted: number;
  usersCompleted: number;
}

export async function getFounderDashboardStats(db: Database, totalDays: number): Promise<FounderDashboardStats> {
  const allUsers = await listUsersForFounder(db);
  const learners = allUsers.filter((u) => u.role !== "founder");
  const totalLessonsCompleted = learners.reduce((sum, u) => sum + u.completedDays, 0);
  const averageProgressPercent =
    learners.length === 0 ? 0 : Math.round((totalLessonsCompleted / (learners.length * totalDays)) * 100);
  return {
    totalUsers: learners.length,
    activeTrials: learners.filter((u) => u.status === "TRIAL").length,
    expiredTrials: learners.filter((u) => u.status === "EXPIRED").length,
    activeUsers: learners.filter((u) => u.status === "ACTIVE").length,
    suspendedUsers: learners.filter((u) => u.status === "SUSPENDED").length,
    recentSignups: allUsers.slice(0, 10),
    totalLessonsCompleted,
    averageProgressPercent,
    usersStarted: learners.filter((u) => u.completedDays > 0).length,
    usersCompleted: learners.filter((u) => u.completedDays >= totalDays).length,
  };
}

/** Grants standing ACTIVE access (bypasses trial expiry) and lifts any suspension. */
export async function activateUserAccess(db: Database, userId: string) {
  await db.update(users).set({ accessActivatedAt: new Date(), suspendedAt: null, updatedAt: new Date() }).where(eq(users.id, userId));
}

/** Suspends access immediately. Takes priority over ACTIVE/TRIAL in computeAccessStatus. Does not
 * touch any progress/journal/canvas/final-project data. */
export async function suspendUser(db: Database, userId: string) {
  await db.update(users).set({ suspendedAt: new Date(), updatedAt: new Date() }).where(eq(users.id, userId));
}

/** Lifts a suspension, returning the user to whatever their underlying trial/active state is
 * (does NOT itself grant ACTIVE - use activateUserAccess for that). */
export async function reactivateUser(db: Database, userId: string) {
  await db.update(users).set({ suspendedAt: null, updatedAt: new Date() }).where(eq(users.id, userId));
}

/** Sets a new trial end date directly (e.g. "extend trial by N days" computed by the caller).
 * Only meaningful while the user is still in TRIAL status - has no effect on an ACTIVE or
 * SUSPENDED account's computed status, since those branches of computeAccessStatus are checked
 * first and never consult trialEndsAt. */
export async function extendTrial(db: Database, userId: string, newTrialEndsAt: Date) {
  await db.update(users).set({ trialEndsAt: newTrialEndsAt, updatedAt: new Date() }).where(eq(users.id, userId));
}

/** Founder-initiated password reset: the founder does not know (and is never asked for) the
 * user's current password - unlike self-service change-password, there is nothing to verify here
 * beyond founder authorization (checked by the caller). Revokes every existing session for that
 * user, exactly like self-service change-password does, so a compromised session can't persist
 * through a founder-initiated reset. */
export async function resetUserPasswordByFounder(db: Database, userId: string, passwordHash: string) {
  await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, userId));
  await deleteAllSessionsForUser(db, userId);
}

/** Updates editable profile fields. Email uniqueness is still enforced by the DB's own unique
 * index (users_email_unique) - this does not duplicate that check, it just surfaces the same
 * unique_violation the caller can detect with isUniqueViolation, exactly like signup does. */
export async function updateUserProfileByFounder(
  db: Database,
  userId: string,
  updates: { name?: string; email?: string }
) {
  await db.transaction(async (tx) => {
    if (updates.email) {
      await tx.update(users).set({ email: updates.email, updatedAt: new Date() }).where(eq(users.id, userId));
    }
    if (updates.name) {
      await tx.update(userProfiles).set({ name: updates.name, updatedAt: new Date() }).where(eq(userProfiles.userId, userId));
    }
  });
}

export interface FounderUserDetail {
  id: string;
  email: string;
  name: string | null;
  role: "user" | "founder";
  status: AccessStatus;
  accessInfo: AccessInfo;
  trialStartedAt: Date;
  trialEndsAt: Date;
  accessActivatedAt: Date | null;
  suspendedAt: Date | null;
  createdAt: Date;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  quizAttemptCount: number;
  exerciseCompletedCount: number;
  achievementCount: number;
  finalProjectCompleted: boolean;
  progress: ProgressSnapshot;
}

/** Everything the founder user-detail page needs for one user, in a handful of targeted queries
 * (not N+1 across the whole user list). Returns null if the user doesn't exist - the caller is
 * responsible for a safe not-found response (see docs/PHASE-5.3.md "IDOR protection": a founder
 * can look up any user by design, but an invalid id must 404, never throw a raw DB error). */
export async function getUserDetailForFounder(db: Database, userId: string): Promise<FounderUserDetail | null> {
  const [userRows, profileRows, streakRows, quizRows, exerciseRows, achievementRows, finalProjectRows, progress] =
    await Promise.all([
      db.select().from(users).where(eq(users.id, userId)).limit(1),
      db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1),
      db.select().from(userStreaks).where(eq(userStreaks.userId, userId)).limit(1),
      db.select({ count: sql<number>`count(*)::int` }).from(quizAttempts).where(eq(quizAttempts.userId, userId)),
      db.select({ count: sql<number>`count(*)::int` }).from(exerciseCompletions).where(eq(exerciseCompletions.userId, userId)),
      db.select({ count: sql<number>`count(*)::int` }).from(achievements).where(eq(achievements.userId, userId)),
      db.select().from(finalProjects).where(eq(finalProjects.userId, userId)).limit(1),
      getProgressSnapshot(db, userId),
    ]);

  const user = userRows[0];
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: profileRows[0]?.name ?? null,
    role: user.role,
    status: computeAccessStatus(user),
    accessInfo: getAccessInfo(user),
    trialStartedAt: user.trialStartedAt,
    trialEndsAt: user.trialEndsAt,
    accessActivatedAt: user.accessActivatedAt,
    suspendedAt: user.suspendedAt,
    createdAt: user.createdAt,
    currentStreak: streakRows[0]?.currentStreak ?? 0,
    longestStreak: streakRows[0]?.longestStreak ?? 0,
    lastActivityDate: streakRows[0]?.lastActivityDate ?? null,
    quizAttemptCount: quizRows[0]?.count ?? 0,
    exerciseCompletedCount: exerciseRows[0]?.count ?? 0,
    achievementCount: achievementRows[0]?.count ?? 0,
    finalProjectCompleted: finalProjectRows[0]?.completed ?? false,
    progress,
  };
}
