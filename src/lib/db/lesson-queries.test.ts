// @vitest-environment node
import { describe, it, expect, beforeEach } from "vitest";
import { createTestDb } from "./test-client";
import { createUser } from "./auth-queries";
import { completeDayTx } from "./progress-queries";
import { migrateLocalData } from "./migration-queries";
import {
  listLessons,
  getLessonById,
  getLessonByDayNumber,
  getPublishedLessonByDayForLearner,
  createLesson,
  updateLesson,
  setLessonStatus,
} from "./lesson-queries";
import { seedContentFromHardcoded } from "./content-seed";
import { allLessons, getLessonByDay } from "@/lib/content/lessons";
import type { Database } from "./types";

let db: Database;
let founderId: string;

beforeEach(async () => {
  db = await createTestDb();
  const founder = await createUser(db, { email: "founder@example.com", passwordHash: "x", name: "Founder", role: "founder" });
  founderId = founder.id;
});

describe("lesson CMS migration (idempotent)", () => {
  it("migrates exactly the 90 hardcoded lessons as published, with stable id/day/slug", async () => {
    const result = await seedContentFromHardcoded(db);
    expect(result.lessonsInserted).toBe(90);
    expect(result.lessonsInserted).toBe(allLessons.length);

    const rows = await listLessons(db);
    expect(rows).toHaveLength(90);
    expect(new Set(rows.map((r) => r.day)).size).toBe(90);
    expect(new Set(rows.map((r) => r.slug)).size).toBe(90);
    expect(new Set(rows.map((r) => r.id)).size).toBe(90);

    const day1 = await getLessonByDayNumber(db, 1);
    expect(day1?.id).toBe("day-1");
    expect(day1?.slug).toBe("what-is-a-business");
    expect(day1?.status).toBe("published");
  });

  it("is idempotent: a second run inserts zero duplicate lesson rows", async () => {
    await seedContentFromHardcoded(db);
    const second = await seedContentFromHardcoded(db);
    expect(second.lessonsInserted).toBe(0);
    expect(await listLessons(db)).toHaveLength(90);
  });

  it("preserves every content field exactly for day 45 and day 90", async () => {
    await seedContentFromHardcoded(db);
    for (const day of [45, 90]) {
      const source = getLessonByDay(day)!;
      const row = await getLessonByDayNumber(db, day);
      expect(row?.title).toBe(source.title);
      expect(row?.objective).toBe(source.objective);
      expect(row?.exercisePrompt).toBe(source.exercise.prompt);
      expect(row?.exerciseAnswer).toBe(source.exercise.answer);
      expect(row?.quiz).toEqual(source.quiz);
      expect(row?.takeaways).toEqual(source.takeaways);
      expect(row?.formula).toEqual(source.formula);
      expect(row?.mnemonic).toEqual(source.mnemonic);
    }
  });
});

describe("learner read path: draft/publish/archive safety", () => {
  it("falls back to the hardcoded lesson when no CMS row exists yet for that day", async () => {
    const lesson = await getPublishedLessonByDayForLearner(db, 1);
    expect(lesson?.title).toBe(getLessonByDay(1)!.title);
  });

  it("a freshly created draft lesson is NOT visible to the learner read path", async () => {
    const draft = await createLesson(
      db,
      {
        day: 1,
        phaseId: "business",
        slug: "what-is-a-business-v2",
        title: "Rewritten Day 1",
        objective: "o",
        concept: "c",
        simpleExplanation: "s",
        analogy: "a",
        businessExample: "b",
        commonMistake: "m",
        exercisePrompt: "p",
        exerciseAnswer: "ans",
        caseStudy: "cs",
        founderQuestion: "fq",
        quiz: [],
        takeaways: [],
        rememberThis: "r",
      },
      "draft",
      founderId
    );
    expect(draft.status).toBe("draft");

    // A row now exists for day 1 but is not published - must be inaccessible, NOT fall back to
    // the hardcoded version (that would silently leak an unrelated old lesson past the founder's
    // intent, and contradicts "draft must never be learner-visible").
    const learnerView = await getPublishedLessonByDayForLearner(db, 1);
    expect(learnerView).toBeNull();
  });

  it("publishing makes the lesson visible, with the edited content", async () => {
    const draft = await createLesson(
      db,
      {
        day: 1,
        phaseId: "business",
        slug: "what-is-a-business-v2",
        title: "Rewritten Day 1",
        objective: "o",
        concept: "c",
        simpleExplanation: "s",
        analogy: "a",
        businessExample: "b",
        commonMistake: "m",
        exercisePrompt: "p",
        exerciseAnswer: "ans",
        caseStudy: "cs",
        founderQuestion: "fq",
        quiz: [],
        takeaways: [],
        rememberThis: "r",
      },
      "draft",
      founderId
    );
    await setLessonStatus(db, draft.id, "published", founderId);

    const learnerView = await getPublishedLessonByDayForLearner(db, 1);
    expect(learnerView?.title).toBe("Rewritten Day 1");
  });

  it("unpublishing (back to draft) immediately hides it from the learner read path again", async () => {
    const draft = await createLesson(
      db,
      {
        day: 1,
        phaseId: "business",
        slug: "what-is-a-business-v2",
        title: "Rewritten Day 1",
        objective: "o",
        concept: "c",
        simpleExplanation: "s",
        analogy: "a",
        businessExample: "b",
        commonMistake: "m",
        exercisePrompt: "p",
        exerciseAnswer: "ans",
        caseStudy: "cs",
        founderQuestion: "fq",
        quiz: [],
        takeaways: [],
        rememberThis: "r",
      },
      "published",
      founderId
    );
    expect(await getPublishedLessonByDayForLearner(db, 1)).not.toBeNull();

    await setLessonStatus(db, draft.id, "draft", founderId);
    expect(await getPublishedLessonByDayForLearner(db, 1)).toBeNull();
  });

  it("archiving also makes the lesson inaccessible through the learner read path", async () => {
    await seedContentFromHardcoded(db);
    const day1 = await getLessonByDayNumber(db, 1);
    await setLessonStatus(db, day1!.id, "archived", founderId);
    expect(await getPublishedLessonByDayForLearner(db, 1)).toBeNull();
  });

  it("editing a published lesson's content is reflected immediately to the learner", async () => {
    await seedContentFromHardcoded(db);
    const day1 = await getLessonByDayNumber(db, 1);
    await updateLesson(
      db,
      day1!.id,
      {
        day: 1,
        phaseId: day1!.phaseId,
        slug: day1!.slug,
        title: "Updated Title",
        objective: day1!.objective,
        concept: day1!.concept,
        simpleExplanation: day1!.simpleExplanation,
        analogy: day1!.analogy,
        businessExample: day1!.businessExample,
        commonMistake: day1!.commonMistake,
        exercisePrompt: day1!.exercisePrompt,
        exerciseAnswer: day1!.exerciseAnswer,
        caseStudy: day1!.caseStudy,
        founderQuestion: day1!.founderQuestion,
        quiz: day1!.quiz,
        takeaways: day1!.takeaways,
        rememberThis: day1!.rememberThis,
      },
      founderId
    );
    const learnerView = await getPublishedLessonByDayForLearner(db, 1);
    expect(learnerView?.title).toBe("Updated Title");
  });
});

describe("IDOR / not-found safety", () => {
  it("getLessonById returns null for a non-existent id rather than throwing", async () => {
    expect(await getLessonById(db, "day-9999")).toBeNull();
  });
});

describe("historical progress is unaffected by the lesson CMS", () => {
  it("completing day 1, 45 and 90 is unaffected by whether lessons have been migrated to the CMS", async () => {
    const user = await createUser(db, { email: "learner@example.com", passwordHash: "x", name: "L" });
    await completeDayTx(db, user.id, 1);
    await completeDayTx(db, user.id, 45);
    await completeDayTx(db, user.id, 90);

    // Now migrate lesson CONTENT into the CMS - this must not touch progress tables at all.
    await seedContentFromHardcoded(db);

    const { getProgressSnapshot } = await import("./progress-queries");
    const snapshot = await getProgressSnapshot(db, user.id);
    expect(snapshot.completedDays).toEqual([1, 45, 90]);
  });

  it("the localStorage -> cloud migration is unaffected by the lesson CMS tables existing", async () => {
    await seedContentFromHardcoded(db);
    const user = await createUser(db, { email: "migrator@example.com", passwordHash: "x", name: "M" });

    const result = await migrateLocalData(db, user.id, {
      progress: { completedDays: [1, 2, 3], completedExercises: ["day-1"], unlockedAchievements: [] },
    });
    expect(result.migrated).toBe(true);

    const second = await migrateLocalData(db, user.id, {
      progress: { completedDays: [1, 2, 3, 4] },
    });
    expect(second).toEqual({ migrated: false, reason: "already-migrated" });

    const { getProgressSnapshot } = await import("./progress-queries");
    const snapshot = await getProgressSnapshot(db, user.id);
    expect(snapshot.completedDays).toEqual([1, 2, 3]);
  });
});
