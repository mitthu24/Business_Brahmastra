import "server-only";
import { sql, eq } from "drizzle-orm";
import type { Database } from "./types";
import { exerciseCompletions, quizAttempts, caseStudyCompletions, lessonCompletions, users } from "./schema";

export interface LearningMetrics {
  lessonsStarted: number; // distinct users with >=1 completion
  lessonsCompletedTotal: number; // sum of all lesson completions across users
  activeLearners: number; // distinct users with any completion
  exerciseCompletions: number;
  quizAttempts: number;
  caseStudyCompletions: number;
}

/** Every number is a real aggregate query against the live tables - never fabricated (see
 * docs/PHASE-5.3.md "Founder Analytics": "Use real data... Never fabricate analytics"). Returns 0
 * for any metric with no rows yet, rather than omitting it. */
export async function getLearningMetrics(db: Database): Promise<LearningMetrics> {
  const [lessonAgg, exerciseAgg, quizAgg, caseStudyAgg] = await Promise.all([
    db
      .select({
        total: sql<number>`count(*)::int`,
        distinctUsers: sql<number>`count(distinct ${lessonCompletions.userId})::int`,
      })
      .from(lessonCompletions),
    db.select({ total: sql<number>`count(*)::int` }).from(exerciseCompletions),
    db.select({ total: sql<number>`count(*)::int` }).from(quizAttempts),
    db.select({ total: sql<number>`count(*)::int` }).from(caseStudyCompletions),
  ]);

  return {
    lessonsStarted: lessonAgg[0]?.distinctUsers ?? 0,
    lessonsCompletedTotal: lessonAgg[0]?.total ?? 0,
    activeLearners: lessonAgg[0]?.distinctUsers ?? 0,
    exerciseCompletions: exerciseAgg[0]?.total ?? 0,
    quizAttempts: quizAgg[0]?.total ?? 0,
    caseStudyCompletions: caseStudyAgg[0]?.total ?? 0,
  };
}

export async function getLearnerUserCount(db: Database): Promise<number> {
  const rows = await db.select({ count: sql<number>`count(*)::int` }).from(users).where(eq(users.role, "user"));
  return rows[0]?.count ?? 0;
}
