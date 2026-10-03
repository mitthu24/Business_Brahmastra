import "server-only";
import { eq, and } from "drizzle-orm";
import type { Database } from "./types";
import {
  migrationStatus,
  lessonCompletions,
  exerciseCompletions,
  caseStudyCompletions,
  quizAttempts,
  userStreaks,
  lessonReflections,
  finalProjects,
  journalEntries,
} from "./schema";
import { computeUnlockedAchievements } from "@/lib/progress/achievements";
import { achievements } from "./schema";
import { wizardSteps } from "@/lib/final-project";
import { getCanvas, upsertCanvas, type CanvasData } from "./canvas-queries";
import type { JournalCategory } from "@/lib/journal";

/** Shape of the client's localStorage snapshot, sent once on first post-login load.
 * See docs/PHASE-4.md "Migration strategy" for the exact conflict rules implemented below. */
export interface LocalStorageSnapshot {
  progress?: {
    completedDays?: number[];
    completedExercises?: string[]; // lesson ids like "day-5"
    completedCaseStudies?: string[];
    quizAttempts?: Record<string, { accuracyPercent: number; completedAt: string }>;
    streak?: { currentStreak: number; lastActiveDate: string | null };
    unlockedAchievements?: string[];
    finalProjectCompleted?: boolean;
    reflections?: Record<string, { learned: string; application: string }>;
  };
  journal?: Array<{ id: string; category: string; text: string; createdAt: string }>;
  canvas?: Partial<CanvasData>;
  finalProjectAnswers?: Record<string, string>;
}

function dayFromLessonId(lessonId: string): number | null {
  const match = lessonId.match(/day-(\d+)/);
  return match ? Number(match[1]) : null;
}

export async function hasMigrated(db: Database, userId: string): Promise<boolean> {
  const rows = await db.select().from(migrationStatus).where(eq(migrationStatus.userId, userId)).limit(1);
  return rows.length > 0;
}

/** Idempotent: a repeat call (or a concurrent duplicate) is a guaranteed no-op once the
 * migration_status row exists - checked and inserted inside the same transaction. */
export async function migrateLocalData(db: Database, userId: string, snapshot: LocalStorageSnapshot) {
  return db.transaction(async (tx) => {
    const already = await tx.select().from(migrationStatus).where(eq(migrationStatus.userId, userId)).limit(1);
    if (already.length > 0) {
      return { migrated: false as const, reason: "already-migrated" as const };
    }

    const progress = snapshot.progress ?? {};

    // Lesson/exercise/case-study completions: additive union - never overwrites, never duplicates
    // (unique(userId, day) + ON CONFLICT DO NOTHING), so cloud progress can only grow.
    const days = (progress.completedDays ?? []).filter((d) => Number.isInteger(d));
    if (days.length > 0) {
      await tx.insert(lessonCompletions).values(days.map((day) => ({ userId, day }))).onConflictDoNothing();
    }
    const exerciseDays = (progress.completedExercises ?? []).map(dayFromLessonId).filter((d): d is number => d !== null);
    if (exerciseDays.length > 0) {
      await tx.insert(exerciseCompletions).values(exerciseDays.map((day) => ({ userId, day }))).onConflictDoNothing();
    }
    const caseStudyDays = (progress.completedCaseStudies ?? []).map(dayFromLessonId).filter((d): d is number => d !== null);
    if (caseStudyDays.length > 0) {
      await tx.insert(caseStudyCompletions).values(caseStudyDays.map((day) => ({ userId, day }))).onConflictDoNothing();
    }

    // Quiz attempts: only fill in days with no cloud record yet (cloud attempt, if any, wins -
    // it may already reflect a more recent/accurate attempt). accuracyPercent is stored as a
    // score-out-of-100 pair so it round-trips exactly through getProgressSnapshot's math, since
    // the client never persisted raw correct/total counts.
    for (const [lessonId, attempt] of Object.entries(progress.quizAttempts ?? {})) {
      const day = dayFromLessonId(lessonId);
      if (day === null) continue;
      const existing = await tx
        .select()
        .from(quizAttempts)
        .where(and(eq(quizAttempts.userId, userId), eq(quizAttempts.day, day)))
        .limit(1);
      if (existing.length === 0) {
        await tx.insert(quizAttempts).values({
          userId,
          day,
          score: Math.round(attempt.accuracyPercent),
          totalQuestions: 100,
        });
      }
    }

    // Achievements: recompute from the now-merged completed days (idempotent insert-if-missing).
    const mergedDays = await tx.select().from(lessonCompletions).where(eq(lessonCompletions.userId, userId));
    const unlockedIds = new Set([
      ...computeUnlockedAchievements({ completedDays: new Set(mergedDays.map((d) => d.day)) }),
      ...(progress.unlockedAchievements ?? []),
    ]);
    if (unlockedIds.size > 0) {
      await tx
        .insert(achievements)
        .values(Array.from(unlockedIds).map((achievementId) => ({ userId, achievementId })))
        .onConflictDoNothing();
    }

    // Final project completion flag: local "true" can only turn cloud "false" into "true", never
    // the reverse (never overwrite greater progress with lower).
    if (progress.finalProjectCompleted) {
      const existingProject = await tx.select().from(finalProjects).where(eq(finalProjects.userId, userId)).limit(1);
      if (existingProject[0]) {
        if (!existingProject[0].completed) {
          await tx.update(finalProjects).set({ completed: true, updatedAt: new Date() }).where(eq(finalProjects.userId, userId));
        }
      } else {
        await tx.insert(finalProjects).values({ userId, completed: true });
      }
    }

    // Streak: keep whichever of {local, cloud} has the most recent lastActivityDate - that one
    // reflects the user's true most-recent activity; ties keep the higher currentStreak.
    if (progress.streak?.lastActiveDate) {
      const cloudRows = await tx.select().from(userStreaks).where(eq(userStreaks.userId, userId)).limit(1);
      const cloud = cloudRows[0];
      const localIsNewer = !cloud?.lastActivityDate || progress.streak.lastActiveDate >= cloud.lastActivityDate;
      if (localIsNewer) {
        const longest = Math.max(cloud?.longestStreak ?? 0, progress.streak.currentStreak);
        if (cloud) {
          await tx
            .update(userStreaks)
            .set({ currentStreak: progress.streak.currentStreak, lastActivityDate: progress.streak.lastActiveDate, longestStreak: longest, updatedAt: new Date() })
            .where(eq(userStreaks.userId, userId));
        } else {
          await tx.insert(userStreaks).values({
            userId,
            currentStreak: progress.streak.currentStreak,
            lastActivityDate: progress.streak.lastActiveDate,
            longestStreak: longest,
          });
        }
      }
    }

    // Reflections: fill in any lesson the cloud doesn't have yet; never overwrite an existing one.
    for (const [lessonId, reflection] of Object.entries(progress.reflections ?? {})) {
      await tx
        .insert(lessonReflections)
        .values({ userId, lessonId, learned: reflection.learned, application: reflection.application })
        .onConflictDoNothing();
    }

    // Journal entries: append any local entry not already present for this user (matched by
    // category+text+createdAt, since local entries have no server id yet).
    const existingEntries = await tx.select().from(journalEntries).where(eq(journalEntries.userId, userId));
    const existingKeys = new Set(existingEntries.map((e) => `${e.category}\u0000${e.text}\u0000${e.createdAt.toISOString()}`));
    const toInsert = (snapshot.journal ?? []).filter((e) => {
      const key = `${e.category}\u0000${e.text}\u0000${new Date(e.createdAt).toISOString()}`;
      return !existingKeys.has(key);
    });
    if (toInsert.length > 0) {
      await tx.insert(journalEntries).values(
        toInsert.map((e) => ({
          userId,
          category: e.category as JournalCategory,
          text: e.text,
          createdAt: new Date(e.createdAt),
        }))
      );
    }

    // Canvas: local fills in only the blocks the cloud doesn't already have content for.
    if (snapshot.canvas) {
      const cloudCanvas = await getCanvas(tx, userId);
      const merged: Partial<CanvasData> = {};
      for (const [k, v] of Object.entries(snapshot.canvas)) {
        const key = k as keyof CanvasData;
        if (!cloudCanvas[key]?.trim() && v?.trim()) merged[key] = v;
      }
      if (Object.keys(merged).length > 0) await upsertCanvas(tx, userId, merged);
    }

    // Final project answers: same "fill empty steps only" rule as canvas.
    if (snapshot.finalProjectAnswers) {
      const projectRows = await tx.select().from(finalProjects).where(eq(finalProjects.userId, userId)).limit(1);
      let project = projectRows[0];
      if (!project) {
        const [created] = await tx.insert(finalProjects).values({ userId }).returning();
        project = created;
      }
      const { finalProjectSteps } = await import("./schema");
      const existingSteps = await tx.select().from(finalProjectSteps).where(eq(finalProjectSteps.finalProjectId, project.id));
      const existingByStep = new Map(existingSteps.map((s) => [s.stepNumber, s]));
      for (const step of wizardSteps) {
        const localValue = snapshot.finalProjectAnswers[step.id];
        if (!localValue?.trim()) continue;
        const existingStep = existingByStep.get(step.stepNumber);
        if (!existingStep || !existingStep.content.trim()) {
          await tx
            .insert(finalProjectSteps)
            .values({ finalProjectId: project.id, stepNumber: step.stepNumber, content: localValue })
            .onConflictDoUpdate({
              target: [finalProjectSteps.finalProjectId, finalProjectSteps.stepNumber],
              set: { content: localValue, updatedAt: new Date() },
            });
        }
      }
    }

    await tx.insert(migrationStatus).values({ userId });
    return { migrated: true as const };
  });
}
