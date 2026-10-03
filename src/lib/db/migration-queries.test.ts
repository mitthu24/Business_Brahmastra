// @vitest-environment node
import { describe, it, expect, beforeEach } from "vitest";
import { createTestDb } from "./test-client";
import { users } from "./schema";
import { migrateLocalData, hasMigrated, type LocalStorageSnapshot } from "./migration-queries";
import { completeDayTx, getProgressSnapshot } from "./progress-queries";
import { getCanvas } from "./canvas-queries";
import type { Database } from "./types";

let db: Database;
let userId: string;

beforeEach(async () => {
  db = await createTestDb();
  const [user] = await db.insert(users).values({ email: "founder@example.com", passwordHash: "x" }).returning();
  userId = user.id;
});

const snapshot: LocalStorageSnapshot = {
  progress: {
    completedDays: [1, 2, 3],
    completedExercises: ["day-1"],
    completedCaseStudies: ["day-1"],
    quizAttempts: { "day-1": { accuracyPercent: 100, completedAt: "2026-01-01" } },
    streak: { currentStreak: 3, lastActiveDate: "2026-01-03" },
    unlockedAchievements: ["first-step"],
    finalProjectCompleted: false,
    reflections: { "day-1": { learned: "L", application: "A" } },
  },
  journal: [{ id: "x", category: "Idea", text: "local idea", createdAt: "2026-01-01T00:00:00.000Z" }],
  canvas: { valueProposition: "local VP" },
  finalProjectAnswers: { idea: "local business idea" },
};

describe("migrateLocalData", () => {
  it("merges localStorage data into a fresh cloud account", async () => {
    const result = await migrateLocalData(db, userId, snapshot);
    expect(result.migrated).toBe(true);

    const progress = await getProgressSnapshot(db, userId);
    expect(progress.completedDays).toEqual([1, 2, 3]);
    expect(progress.completedExercises).toEqual([1]);
    expect(progress.xp).toBeGreaterThan(0);
    expect(progress.reflections["day-1"]).toEqual({ learned: "L", application: "A" });

    const canvas = await getCanvas(db, userId);
    expect(canvas.valueProposition).toBe("local VP");
  });

  it("is idempotent: migrating twice does not duplicate anything", async () => {
    await migrateLocalData(db, userId, snapshot);
    const second = await migrateLocalData(db, userId, snapshot);
    expect(second.migrated).toBe(false);

    const progress = await getProgressSnapshot(db, userId);
    expect(progress.completedDays).toEqual([1, 2, 3]); // not doubled

    expect(await hasMigrated(db, userId)).toBe(true);
  });

  it("never overwrites greater cloud progress with lower local progress", async () => {
    // Cloud is already ahead: day 1-5 completed server-side before migration runs.
    for (let d = 1; d <= 5; d++) await completeDayTx(db, userId, d);

    const behindSnapshot: LocalStorageSnapshot = {
      progress: { completedDays: [1], streak: { currentStreak: 1, lastActiveDate: "2020-01-01" } },
    };
    await migrateLocalData(db, userId, behindSnapshot);

    const progress = await getProgressSnapshot(db, userId);
    // Cloud's extra days are preserved - a union, not a replace.
    expect(progress.completedDays).toEqual([1, 2, 3, 4, 5]);
    // The older local streak date must not clobber the newer cloud streak date.
    expect(progress.streak.lastActiveDate).not.toBe("2020-01-01");
  });

  it("when local is ahead of an empty cloud account, local progress wins", async () => {
    await migrateLocalData(db, userId, snapshot);
    const progress = await getProgressSnapshot(db, userId);
    expect(progress.completedDays).toEqual([1, 2, 3]);
    expect(progress.streak.currentStreak).toBe(3);
  });
});
