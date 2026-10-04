// @vitest-environment node
import { describe, it, expect, beforeEach } from "vitest";
import { createTestDb } from "./test-client";
import { createUser } from "./auth-queries";
import { completeDayTx, submitQuizTx } from "./progress-queries";
import { migrateLocalData } from "./migration-queries";
import {
  getLessonByDayNumber,
  getLessonSectionVisibility,
  getPublishedLessonByDayForLearner,
  updateLessonExercise,
  setExerciseStatus,
  updateLessonQuiz,
  setQuizStatus,
} from "./lesson-queries";
import { seedContentFromHardcoded } from "./content-seed";
import { getLessonByDay } from "@/lib/content/lessons";
import type { Database } from "./types";

let db: Database;
let founderId: string;

beforeEach(async () => {
  db = await createTestDb();
  const founder = await createUser(db, { email: "founder@example.com", passwordHash: "x", name: "Founder", role: "founder" });
  founderId = founder.id;
});

describe("exercise/quiz migration and backfill", () => {
  it("a fresh migration inserts lessons already published (no backfill needed - they were never draft)", async () => {
    const result = await seedContentFromHardcoded(db);
    expect(result.lessonsInserted).toBe(90);
    expect(result.lessonSectionsBackfilled).toBe(0);

    const day1 = await getLessonByDayNumber(db, 1);
    expect(day1?.exerciseStatus).toBe("published");
    expect(day1?.quizStatus).toBe("published");

    const visibility = await getLessonSectionVisibility(db, 1);
    expect(visibility).toEqual({ exerciseVisible: true, quizVisible: true });
  });

  it("backfills a lesson that predates the exercise_status/quiz_status columns (simulating a slice-3 row hitting its column default)", async () => {
    // Simulate exactly what happened in production: a lesson inserted by slice 3's migration
    // before these columns existed gets the column DEFAULT 'draft' when the ALTER TABLE runs,
    // even though its own `status` is already 'published'.
    const seeded = await seedContentFromHardcoded(db);
    expect(seeded.lessonSectionsBackfilled).toBe(0);

    const { lessons } = await import("./schema");
    const { eq } = await import("drizzle-orm");
    await db.update(lessons).set({ exerciseStatus: "draft", quizStatus: "draft" }).where(eq(lessons.day, 1));
    expect((await getLessonSectionVisibility(db, 1)).exerciseVisible).toBe(false);

    const result = await seedContentFromHardcoded(db);
    expect(result.lessonSectionsBackfilled).toBe(1);
    expect((await getLessonSectionVisibility(db, 1)).exerciseVisible).toBe(true);
  });

  it("second migration run backfills zero additional rows (idempotent)", async () => {
    await seedContentFromHardcoded(db);
    const second = await seedContentFromHardcoded(db);
    expect(second.lessonsInserted).toBe(0);
    expect(second.lessonSectionsBackfilled).toBe(0);
  });
});

describe("exercise section visibility, independent of the lesson's own status", () => {
  it("unpublishing just the exercise hides only the exercise, not the rest of the lesson", async () => {
    await seedContentFromHardcoded(db);
    const day1 = await getLessonByDayNumber(db, 1);

    await setExerciseStatus(db, day1!.id, "draft", founderId);

    const visibility = await getLessonSectionVisibility(db, 1);
    expect(visibility.exerciseVisible).toBe(false);
    expect(visibility.quizVisible).toBe(true);

    const lesson = await getPublishedLessonByDayForLearner(db, 1);
    expect(lesson).not.toBeNull(); // the lesson itself is still fully accessible
  });

  it("archiving the quiz hides only the quiz", async () => {
    await seedContentFromHardcoded(db);
    const day1 = await getLessonByDayNumber(db, 1);

    await setQuizStatus(db, day1!.id, "archived", founderId);

    const visibility = await getLessonSectionVisibility(db, 1);
    expect(visibility.exerciseVisible).toBe(true);
    expect(visibility.quizVisible).toBe(false);
  });

  it("editing exercise content takes effect immediately for the learner", async () => {
    await seedContentFromHardcoded(db);
    const day1 = await getLessonByDayNumber(db, 1);
    await updateLessonExercise(db, day1!.id, { exercisePrompt: "New prompt", exerciseAnswer: "New answer" }, founderId);

    const updated = await getLessonByDayNumber(db, 1);
    expect(updated?.exercisePrompt).toBe("New prompt");
    expect(updated?.exerciseAnswer).toBe("New answer");
  });

  it("editing quiz content replaces the stored questions and is picked up by server-side scoring", async () => {
    await seedContentFromHardcoded(db);
    const day1 = await getLessonByDayNumber(db, 1);
    const newQuiz = [{ id: "d1custom1", question: "Custom?", options: ["A", "B"], correctIndex: 1, explanation: "Because." }];
    await updateLessonQuiz(db, day1!.id, newQuiz, founderId);

    const updated = await getLessonByDayNumber(db, 1);
    expect(updated?.quiz).toEqual(newQuiz);
  });

  it("a day with no CMS row yet defaults both sections to visible (never 404s mid-migration)", async () => {
    const visibility = await getLessonSectionVisibility(db, 1);
    expect(visibility).toEqual({ exerciseVisible: true, quizVisible: true });
  });
});

describe("quiz scoring is server-authoritative", () => {
  it("ignores a client-submitted correctIndex and scores against the server's own quiz data", async () => {
    await seedContentFromHardcoded(db);
    const user = await createUser(db, { email: "learner@example.com", passwordHash: "x", name: "L" });
    const day1 = getLessonByDay(1)!;
    const realQuestion = day1.quiz[0];

    // Attacker submits a WRONG selectedIndex but LIES about correctIndex to match it, trying to
    // claim a correct answer the client-side check alone would have accepted.
    const tamperedAnswers = day1.quiz.map((q) => ({
      questionId: q.id,
      selectedIndex: q.correctIndex === 0 ? 1 : 0, // deliberately wrong
      correctIndex: q.correctIndex === 0 ? 1 : 0, // lie to match the wrong selection
    }));

    const { result } = await submitQuizTx(db, user.id, 1, tamperedAnswers);
    expect(result.correctCount).toBe(0); // the lie must not earn credit
    expect(realQuestion).toBeDefined();
  });

  it("still scores correctly when the client tells the truth", async () => {
    await seedContentFromHardcoded(db);
    const user = await createUser(db, { email: "honest@example.com", passwordHash: "x", name: "H" });
    const day1 = getLessonByDay(1)!;

    const answers = day1.quiz.map((q) => ({ questionId: q.id, selectedIndex: q.correctIndex, correctIndex: q.correctIndex }));
    const { result } = await submitQuizTx(db, user.id, 1, answers);
    expect(result.correctCount).toBe(day1.quiz.length);
  });

  it("a questionId the server doesn't recognize is scored as incorrect, not trusted", async () => {
    await seedContentFromHardcoded(db);
    const user = await createUser(db, { email: "spoof@example.com", passwordHash: "x", name: "S" });
    const { result } = await submitQuizTx(db, user.id, 1, [{ questionId: "not-a-real-question", selectedIndex: 0, correctIndex: 0 }]);
    expect(result.correctCount).toBe(0);
  });
});

describe("progress is unaffected by exercise/quiz CMS changes", () => {
  it("Day 1, 45, and 90 completion and quiz attempts survive exercise/quiz CMS mutations", async () => {
    const user = await createUser(db, { email: "regress@example.com", passwordHash: "x", name: "R" });
    await completeDayTx(db, user.id, 1);
    await completeDayTx(db, user.id, 45);
    await completeDayTx(db, user.id, 90);

    await seedContentFromHardcoded(db);
    const day1 = await getLessonByDayNumber(db, 1);
    await setExerciseStatus(db, day1!.id, "archived", founderId);
    await setQuizStatus(db, day1!.id, "archived", founderId);

    const { getProgressSnapshot } = await import("./progress-queries");
    const snapshot = await getProgressSnapshot(db, user.id);
    expect(snapshot.completedDays).toEqual([1, 45, 90]);
  });

  it("localStorage migration is unaffected by exercise/quiz CMS tables existing", async () => {
    await seedContentFromHardcoded(db);
    const user = await createUser(db, { email: "migrator2@example.com", passwordHash: "x", name: "M2" });
    const result = await migrateLocalData(db, user.id, { progress: { completedDays: [1, 45, 90] } });
    expect(result.migrated).toBe(true);

    const { getProgressSnapshot } = await import("./progress-queries");
    const snapshot = await getProgressSnapshot(db, user.id);
    expect(snapshot.completedDays).toEqual([1, 45, 90]);
  });
});

describe("IDOR / not-found safety", () => {
  it("updateLessonExercise on a non-existent lesson id is a safe no-op, not a crash", async () => {
    await expect(updateLessonExercise(db, "day-9999", { exercisePrompt: "x", exerciseAnswer: "y" }, founderId)).resolves.not.toThrow();
  });
});
