// @vitest-environment node
import { describe, it, expect, beforeEach } from "vitest";
import { createTestDb } from "./test-client";
import { users } from "./schema";
import {
  completeDayTx,
  completeExerciseTx,
  completeCaseStudyTx,
  submitQuizTx,
  completeFinalProjectTx,
  getProgressSnapshot,
} from "./progress-queries";
import type { Database } from "./types";

let db: Database;
let userId: string;

beforeEach(async () => {
  db = await createTestDb();
  const [user] = await db.insert(users).values({ email: "founder@example.com", passwordHash: "x" }).returning();
  userId = user.id;
});

describe("completeDayTx", () => {
  it("awards XP and marks the day complete", async () => {
    const snap = await completeDayTx(db, userId, 1);
    expect(snap.completedDays).toEqual([1]);
    expect(snap.xp).toBe(50);
    expect(snap.streak.currentStreak).toBe(1);
    expect(snap.unlockedAchievements).toContain("first-step");
  });

  it("is idempotent: completing the same day twice does not duplicate XP or rows", async () => {
    await completeDayTx(db, userId, 1);
    const snap = await completeDayTx(db, userId, 1);
    expect(snap.completedDays).toEqual([1]);
    expect(snap.xp).toBe(50);
  });

  it("is idempotent under concurrent duplicate requests", async () => {
    await Promise.all([completeDayTx(db, userId, 2), completeDayTx(db, userId, 2), completeDayTx(db, userId, 2)]);
    const snap = await getProgressSnapshot(db, userId);
    expect(snap.completedDays).toEqual([2]);
    expect(snap.xp).toBe(50);
  });

  it("unlocks seven-day-founder after 7 distinct days", async () => {
    for (let d = 1; d <= 7; d++) await completeDayTx(db, userId, d);
    const snap = await getProgressSnapshot(db, userId);
    expect(snap.unlockedAchievements).toContain("seven-day-founder");
    expect(snap.xp).toBe(7 * 50);
  });
});

describe("completeExerciseTx / completeCaseStudyTx", () => {
  it("are idempotent per day", async () => {
    await completeExerciseTx(db, userId, 1);
    await completeExerciseTx(db, userId, 1);
    await completeCaseStudyTx(db, userId, 1);
    await completeCaseStudyTx(db, userId, 1);
    const snap = await getProgressSnapshot(db, userId);
    expect(snap.completedExercises).toEqual([1]);
    expect(snap.completedCaseStudies).toEqual([1]);
    expect(snap.xp).toBe(25 + 50);
  });
});

describe("submitQuizTx", () => {
  const answers = [
    { questionId: "q1", selectedIndex: 0, correctIndex: 0 },
    { questionId: "q2", selectedIndex: 1, correctIndex: 0 },
  ];

  it("scores the quiz and awards XP only on first attempt", async () => {
    const first = await submitQuizTx(db, userId, 1, answers);
    expect(first.result.correctCount).toBe(1);
    expect(first.snapshot.xp).toBe(25);

    const second = await submitQuizTx(db, userId, 1, answers);
    // Re-submission still scores correctly, but XP is not awarded a second time.
    expect(second.result.correctCount).toBe(1);
    expect(second.snapshot.xp).toBe(25);
  });
});

describe("completeFinalProjectTx", () => {
  it("awards the final project XP once", async () => {
    const first = await completeFinalProjectTx(db, userId);
    expect(first.finalProjectCompleted).toBe(true);
    expect(first.xp).toBe(500);
    const second = await completeFinalProjectTx(db, userId);
    expect(second.xp).toBe(500);
  });
});
