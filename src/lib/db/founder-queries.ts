import "server-only";
import { eq, desc, sql } from "drizzle-orm";
import type { Database } from "./types";
import { users, userProfiles, lessonCompletions } from "./schema";
import { computeAccessStatus, type AccessStatus } from "@/lib/access/status";

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
}

export async function getFounderDashboardStats(db: Database): Promise<FounderDashboardStats> {
  const allUsers = await listUsersForFounder(db);
  const learners = allUsers.filter((u) => u.role !== "founder");
  return {
    totalUsers: learners.length,
    activeTrials: learners.filter((u) => u.status === "TRIAL").length,
    expiredTrials: learners.filter((u) => u.status === "EXPIRED").length,
    activeUsers: learners.filter((u) => u.status === "ACTIVE").length,
    suspendedUsers: learners.filter((u) => u.status === "SUSPENDED").length,
    recentSignups: allUsers.slice(0, 10),
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
