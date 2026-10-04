// @vitest-environment node
import { describe, it, expect, beforeEach } from "vitest";
import { createTestDb } from "./test-client";
import { createUser } from "./auth-queries";
import {
  getProductSettings,
  updateProductSettings,
  listPhasesForFounder,
  updatePhaseOverride,
} from "./settings-queries";
import { getContentHubStats, getRecentContentActivity } from "./content-hub-queries";
import { getLearningMetrics } from "./analytics-queries";
import { seedContentFromHardcoded } from "./content-seed";
import { recordAuditLog } from "./audit-log";
import { completeDayTx, completeExerciseTx, submitQuizTx } from "./progress-queries";
import { phases as hardcodedPhases } from "@/lib/content/phases";
import type { Database } from "./types";

let db: Database;
let founderId: string;

beforeEach(async () => {
  db = await createTestDb();
  const founder = await createUser(db, { email: "founder@example.com", passwordHash: "x", name: "Founder", role: "founder" });
  founderId = founder.id;
});

describe("global product settings", () => {
  it("returns sane defaults before any row exists", async () => {
    const settings = await getProductSettings(db);
    expect(settings.productName).toBe("90-Day Business School");
    expect(settings.defaultTrialDays).toBe(3);
  });

  it("persists an update and never touches existing users' trial dates", async () => {
    const learner = await createUser(db, { email: "learner@example.com", passwordHash: "x", name: "L" });
    const { users } = await import("./schema");
    const { eq } = await import("drizzle-orm");
    const [before] = await db.select().from(users).where(eq(users.id, learner.id));

    await updateProductSettings(db, { defaultTrialDays: 14, productName: "New Name" }, founderId);

    const after = await getProductSettings(db);
    expect(after.defaultTrialDays).toBe(14);
    expect(after.productName).toBe("New Name");

    const [learnerAfter] = await db.select().from(users).where(eq(users.id, learner.id));
    expect(learnerAfter.trialEndsAt).toEqual(before.trialEndsAt); // unaffected - see settings-queries.ts
  });

  it("a second update overwrites the first (singleton row, no duplicates)", async () => {
    await updateProductSettings(db, { productName: "First" }, founderId);
    await updateProductSettings(db, { productName: "Second" }, founderId);
    const { productSettings } = await import("./schema");
    const rows = await db.select().from(productSettings);
    expect(rows).toHaveLength(1);
    expect(rows[0].productName).toBe("Second");
  });
});

describe("curriculum phase overrides", () => {
  it("falls back to the hardcoded phase name/description with no override", async () => {
    const phases = await listPhasesForFounder(db);
    expect(phases).toHaveLength(15);
    expect(phases[0].name).toBe(hardcodedPhases[0].title);
    expect(phases[0].overridden).toBe(false);
    expect(phases[0].startDay).toBe(1);
    expect(phases[0].endDay).toBe(7);
  });

  it("an override replaces only name/description, never the day range", async () => {
    await updatePhaseOverride(db, 1, { name: "Foundations Renamed", description: "New description" }, founderId);
    const phases = await listPhasesForFounder(db);
    const phase1 = phases.find((p) => p.number === 1)!;
    expect(phase1.name).toBe("Foundations Renamed");
    expect(phase1.description).toBe("New description");
    expect(phase1.overridden).toBe(true);
    expect(phase1.startDay).toBe(1);
    expect(phase1.endDay).toBe(7); // unchanged - day ranges are not stored/overridable
  });
});

describe("content hub stats", () => {
  it("reports real counts for every content type, matching the migrated totals", async () => {
    await seedContentFromHardcoded(db);
    const stats = await getContentHubStats(db);

    const byKey = new Map(stats.map((s) => [s.key, s]));
    expect(byKey.get("lessons")?.total).toBe(90);
    expect(byKey.get("lessons")?.published).toBe(90);
    expect(byKey.get("exercises")?.total).toBe(90);
    expect(byKey.get("quizzes")?.total).toBe(90);
    expect(byKey.get("achievements")?.total).toBe(9);
    expect(byKey.get("calculators")?.total).toBe(12);
  });

  it("reports zero (not fabricated numbers) on an empty database", async () => {
    const stats = await getContentHubStats(db);
    for (const s of stats) {
      expect(s.total).toBe(0);
      expect(s.published).toBe(0);
      expect(s.lastUpdated).toBeNull();
    }
  });

  it("recent activity surfaces real audit log rows for content entity types only", async () => {
    await recordAuditLog(db, { founderId, action: "CONTENT_UPDATED", entityType: "lesson", entityId: "day-1" });
    await recordAuditLog(db, { founderId, action: "USER_SUSPENDED", entityType: "user", entityId: "someone" });

    const recent = await getRecentContentActivity(db);
    expect(recent.some((r) => r.entityType === "lesson")).toBe(true);
    expect(recent.some((r) => r.entityType === "user")).toBe(false);
  });
});

describe("analytics: learning metrics are real aggregates", () => {
  it("reads zero across the board on an empty database", async () => {
    const metrics = await getLearningMetrics(db);
    expect(metrics).toEqual({
      lessonsStarted: 0,
      lessonsCompletedTotal: 0,
      activeLearners: 0,
      exerciseCompletions: 0,
      quizAttempts: 0,
      caseStudyCompletions: 0,
    });
  });

  it("counts real completions after learner activity", async () => {
    await seedContentFromHardcoded(db);
    const learner = await createUser(db, { email: "learner2@example.com", passwordHash: "x", name: "L2" });
    await completeDayTx(db, learner.id, 1);
    await completeExerciseTx(db, learner.id, 1);
    await submitQuizTx(db, learner.id, 1, [{ questionId: "d1q1", selectedIndex: 1, correctIndex: 1 }]);

    const metrics = await getLearningMetrics(db);
    expect(metrics.lessonsCompletedTotal).toBe(1);
    expect(metrics.activeLearners).toBe(1);
    expect(metrics.exerciseCompletions).toBe(1);
    expect(metrics.quizAttempts).toBe(1);
  });
});
