import "server-only";
import { eq, and } from "drizzle-orm";
import type { Database } from "./types";
import {
  lessonCompletions,
  exerciseCompletions,
  caseStudyCompletions,
  quizAttempts,
  achievements,
  userStreaks,
  lessonReflections,
  finalProjects,
} from "./schema";
import { xpForEvent, scoreQuiz, type QuizAnswer, type QuizResult } from "@/lib/progress/xp";
import { updateStreak, type StreakState } from "@/lib/progress/streak";
import { computeUnlockedAchievements } from "@/lib/progress/achievements";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export interface ProgressSnapshot {
  completedDays: number[];
  completedExercises: number[];
  completedCaseStudies: number[];
  quizAttempts: Record<number, { accuracyPercent: number; completedAt: string }>;
  xp: number;
  streak: StreakState;
  longestStreak: number;
  unlockedAchievements: string[];
  finalProjectCompleted: boolean;
  reflections: Record<string, { learned: string; application: string }>;
}

/** Reads all progress rows for a user and derives XP/streak/achievements using the same pure
 * functions the original client-only store used (src/lib/progress/*) - never reimplemented. */
export async function getProgressSnapshot(db: Database, userId: string): Promise<ProgressSnapshot> {
  const [lessons, exercises, caseStudies, quizzes, unlocked, streakRow, reflections, project] = await Promise.all([
    db.select().from(lessonCompletions).where(eq(lessonCompletions.userId, userId)),
    db.select().from(exerciseCompletions).where(eq(exerciseCompletions.userId, userId)),
    db.select().from(caseStudyCompletions).where(eq(caseStudyCompletions.userId, userId)),
    db.select().from(quizAttempts).where(eq(quizAttempts.userId, userId)),
    db.select().from(achievements).where(eq(achievements.userId, userId)),
    db.select().from(userStreaks).where(eq(userStreaks.userId, userId)).limit(1),
    db.select().from(lessonReflections).where(eq(lessonReflections.userId, userId)),
    db.select().from(finalProjects).where(eq(finalProjects.userId, userId)).limit(1),
  ]);

  const finalProjectCompleted = project[0]?.completed ?? false;

  const xp =
    lessons.length * xpForEvent("lessonComplete") +
    exercises.length * xpForEvent("exercise") +
    caseStudies.length * xpForEvent("caseStudy") +
    quizzes.length * xpForEvent("quiz") +
    (finalProjectCompleted ? xpForEvent("finalProject") : 0);

  const quizRecord: ProgressSnapshot["quizAttempts"] = {};
  for (const q of quizzes) {
    quizRecord[q.day] = {
      accuracyPercent: q.totalQuestions > 0 ? Math.round((q.score / q.totalQuestions) * 100) : 0,
      completedAt: q.completedAt.toISOString().slice(0, 10),
    };
  }

  const reflectionRecord: ProgressSnapshot["reflections"] = {};
  for (const r of reflections) {
    reflectionRecord[r.lessonId] = { learned: r.learned, application: r.application };
  }

  return {
    completedDays: lessons.map((l) => l.day).sort((a, b) => a - b),
    completedExercises: exercises.map((e) => e.day),
    completedCaseStudies: caseStudies.map((c) => c.day),
    quizAttempts: quizRecord,
    xp,
    streak: {
      currentStreak: streakRow[0]?.currentStreak ?? 0,
      lastActiveDate: streakRow[0]?.lastActivityDate ?? null,
    },
    longestStreak: streakRow[0]?.longestStreak ?? 0,
    unlockedAchievements: unlocked.map((a) => a.achievementId),
    finalProjectCompleted,
    reflections: reflectionRecord,
  };
}

/** Inserts any newly-unlocked achievements (idempotent via unique(userId, achievementId)). */
async function syncAchievements(db: Database, userId: string, completedDays: number[]) {
  const unlockedIds = computeUnlockedAchievements({ completedDays: new Set(completedDays) });
  if (unlockedIds.length === 0) return;
  await db
    .insert(achievements)
    .values(unlockedIds.map((achievementId) => ({ userId, achievementId })))
    .onConflictDoNothing();
}

async function bumpStreak(db: Database, userId: string) {
  const rows = await db.select().from(userStreaks).where(eq(userStreaks.userId, userId)).limit(1);
  const current: StreakState = {
    currentStreak: rows[0]?.currentStreak ?? 0,
    lastActiveDate: rows[0]?.lastActivityDate ?? null,
  };
  const updated = updateStreak(current, todayISO());
  const longest = Math.max(rows[0]?.longestStreak ?? 0, updated.currentStreak);
  if (rows[0]) {
    await db
      .update(userStreaks)
      .set({ currentStreak: updated.currentStreak, lastActivityDate: updated.lastActiveDate, longestStreak: longest, updatedAt: new Date() })
      .where(eq(userStreaks.userId, userId));
  } else {
    await db.insert(userStreaks).values({
      userId,
      currentStreak: updated.currentStreak,
      lastActivityDate: updated.lastActiveDate,
      longestStreak: longest,
    });
  }
}

/** Idempotent: completing the same day twice only ever inserts one row (unique constraint +
 * ON CONFLICT DO NOTHING), so double-clicks / duplicate requests cannot duplicate XP or streak bumps. */
export async function completeDayTx(db: Database, userId: string, day: number): Promise<ProgressSnapshot> {
  return db.transaction(async (tx) => {
    const inserted = await tx
      .insert(lessonCompletions)
      .values({ userId, day })
      .onConflictDoNothing()
      .returning();
    if (inserted.length > 0) {
      // Only a genuinely new completion bumps the streak - re-sending the same request is a no-op.
      await bumpStreak(tx, userId);
    }
    const days = await tx.select().from(lessonCompletions).where(eq(lessonCompletions.userId, userId));
    await syncAchievements(tx, userId, days.map((d) => d.day));
    return getProgressSnapshot(tx, userId);
  });
}

export async function completeExerciseTx(db: Database, userId: string, day: number): Promise<ProgressSnapshot> {
  return db.transaction(async (tx) => {
    await tx.insert(exerciseCompletions).values({ userId, day }).onConflictDoNothing();
    return getProgressSnapshot(tx, userId);
  });
}

export async function completeCaseStudyTx(db: Database, userId: string, day: number): Promise<ProgressSnapshot> {
  return db.transaction(async (tx) => {
    await tx.insert(caseStudyCompletions).values({ userId, day }).onConflictDoNothing();
    return getProgressSnapshot(tx, userId);
  });
}

/** Mirrors the original store's submitQuiz: scoring always happens and is returned, but XP is
 * only ever awarded for the first attempt at a given lesson day (unique(userId, day) + a check). */
export async function submitQuizTx(
  db: Database,
  userId: string,
  day: number,
  answers: QuizAnswer[]
): Promise<{ result: QuizResult; snapshot: ProgressSnapshot }> {
  const result = scoreQuiz(answers);
  const snapshot = await db.transaction(async (tx) => {
    const existing = await tx
      .select()
      .from(quizAttempts)
      .where(and(eq(quizAttempts.userId, userId), eq(quizAttempts.day, day)))
      .limit(1);
    if (existing.length === 0) {
      await tx.insert(quizAttempts).values({
        userId,
        day,
        score: result.correctCount,
        totalQuestions: result.total,
      });
    }
    // else: already attempted - existing record and its XP contribution are left untouched.
    return getProgressSnapshot(tx, userId);
  });
  return { result, snapshot };
}

export async function completeFinalProjectTx(db: Database, userId: string): Promise<ProgressSnapshot> {
  return db.transaction(async (tx) => {
    const rows = await tx.select().from(finalProjects).where(eq(finalProjects.userId, userId)).limit(1);
    if (rows[0]) {
      if (!rows[0].completed) {
        await tx.update(finalProjects).set({ completed: true, updatedAt: new Date() }).where(eq(finalProjects.userId, userId));
      }
    } else {
      await tx.insert(finalProjects).values({ userId, completed: true });
    }
    return getProgressSnapshot(tx, userId);
  });
}

export async function saveReflectionTx(
  db: Database,
  userId: string,
  lessonId: string,
  learned: string,
  application: string
): Promise<ProgressSnapshot> {
  return db.transaction(async (tx) => {
    await tx
      .insert(lessonReflections)
      .values({ userId, lessonId, learned, application })
      .onConflictDoUpdate({
        target: [lessonReflections.userId, lessonReflections.lessonId],
        set: { learned, application, updatedAt: new Date() },
      });
    return getProgressSnapshot(tx, userId);
  });
}
