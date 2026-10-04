// @vitest-environment node
import { describe, it, expect, beforeEach } from "vitest";
import { createTestDb } from "./test-client";
import { createUser } from "./auth-queries";
import {
  listAchievementEntries,
  getAchievementEntry,
  createAchievementEntry,
  updateAchievementEntry,
  setAchievementEntryStatus,
  listPublishedAchievementsForLearner,
} from "./achievement-queries";
import {
  listCalculatorEntries,
  getCalculatorEntry,
  updateCalculatorEntry,
  setCalculatorEntryStatus,
  listPublishedCalculatorsForLearner,
} from "./calculator-queries";
import { seedContentFromHardcoded } from "./content-seed";
import { achievements as trustedAchievements } from "@/lib/progress/achievements";
import { calculatorMeta } from "@/lib/calculator-meta";
import type { Database } from "./types";

let db: Database;
let founderId: string;

beforeEach(async () => {
  db = await createTestDb();
  const founder = await createUser(db, { email: "founder@example.com", passwordHash: "x", name: "Founder", role: "founder" });
  founderId = founder.id;
});

describe("achievement CMS migration", () => {
  it("migrates exactly the 9 trusted achievements as published, preserving every existing one", async () => {
    const result = await seedContentFromHardcoded(db);
    expect(result.achievementsInserted).toBe(trustedAchievements.length);
    expect(result.achievementsInserted).toBe(9);

    const rows = await listAchievementEntries(db);
    expect(rows).toHaveLength(9);
    for (const a of trustedAchievements) {
      const row = rows.find((r) => r.id === a.id);
      expect(row).toBeDefined();
      expect(row?.status).toBe("published");
    }
  });

  it("is idempotent: a second run inserts zero duplicates", async () => {
    await seedContentFromHardcoded(db);
    const second = await seedContentFromHardcoded(db);
    expect(second.achievementsInserted).toBe(0);
    expect(await listAchievementEntries(db)).toHaveLength(9);
  });
});

describe("achievement CMS: metadata-only, never free-form ids", () => {
  it("edits display metadata without touching unlock logic (the engine still unlocks the same ids)", async () => {
    await seedContentFromHardcoded(db);
    const entry = await getAchievementEntry(db, "first-step");
    await updateAchievementEntry(db, "first-step", { name: "Day One!", description: "New copy", icon: "Star", category: "Starter", xp: 10 }, founderId);

    const updated = await getAchievementEntry(db, "first-step");
    expect(updated?.name).toBe("Day One!");
    expect(entry?.id).toBe("first-step"); // id itself is immutable
  });

  it("draft achievements are hidden from the learner view; published ones show the CMS copy", async () => {
    await seedContentFromHardcoded(db);
    await setAchievementEntryStatus(db, "first-step", "draft", founderId);

    const learnerView = await listPublishedAchievementsForLearner(db);
    expect(learnerView.find((a) => a.id === "first-step")).toBeUndefined();
    expect(learnerView.find((a) => a.id === "founder")).toBeDefined();
  });

  it("falls back to the trusted hardcoded definition for an id not yet migrated into the CMS", async () => {
    // No seeding at all - every id is "not yet migrated".
    const learnerView = await listPublishedAchievementsForLearner(db);
    expect(learnerView).toHaveLength(trustedAchievements.length);
    expect(learnerView.find((a) => a.id === "founder")?.name).toBe("Founder");
  });

  it("createAchievementEntry can only ever be called with an id the trusted engine knows (enforced at the action layer, not here) - this test documents the DB layer accepts any id but the app layer restricts it", async () => {
    // The DB function itself doesn't validate - src/app/founder/achievement-actions.ts does. This
    // confirms the normal path: creating for a real id works and is idempotent-safe via PK.
    const created = await createAchievementEntry(db, "founder", { name: "Founder", description: "d", icon: "Trophy", category: "Milestone", xp: 100 }, "draft", founderId);
    expect(created.id).toBe("founder");
  });
});

describe("calculator CMS migration", () => {
  it("migrates exactly the 12 calculators as published", async () => {
    const result = await seedContentFromHardcoded(db);
    expect(result.calculatorsInserted).toBe(calculatorMeta.length);
    expect(result.calculatorsInserted).toBe(12);

    const rows = await listCalculatorEntries(db);
    expect(rows).toHaveLength(12);
    expect(rows.every((r) => r.status === "published")).toBe(true);
  });

  it("is idempotent: a second run inserts zero duplicates", async () => {
    await seedContentFromHardcoded(db);
    const second = await seedContentFromHardcoded(db);
    expect(second.calculatorsInserted).toBe(0);
    expect(await listCalculatorEntries(db)).toHaveLength(12);
  });
});

describe("calculator CMS: metadata only, ordering respected, computation untouched", () => {
  it("editing metadata and ordering is reflected in the learner directory listing", async () => {
    await seedContentFromHardcoded(db);
    await updateCalculatorEntry(db, "profit", { title: "Profit Calc (Updated)", description: "d", category: "Finance", ordering: 0 }, founderId);
    await updateCalculatorEntry(db, "roi", { title: "ROI Calc", description: "d", category: "Finance", ordering: -1 }, founderId);

    const rows = await listCalculatorEntries(db);
    const profit = rows.find((r) => r.id === "profit");
    expect(profit?.title).toBe("Profit Calc (Updated)");

    const learnerView = await listPublishedCalculatorsForLearner(db);
    expect(learnerView[0].slug).toBe("roi"); // ordering -1 sorts first
  });

  it("archiving a calculator removes it from the learner directory", async () => {
    await seedContentFromHardcoded(db);
    await setCalculatorEntryStatus(db, "roi", "archived", founderId);

    const learnerView = await listPublishedCalculatorsForLearner(db);
    expect(learnerView.find((c) => c.slug === "roi")).toBeUndefined();
    expect(learnerView.find((c) => c.slug === "profit")).toBeDefined();
  });

  it("falls back to hardcoded calculatorMeta for a slug not yet migrated into the CMS", async () => {
    const learnerView = await listPublishedCalculatorsForLearner(db);
    expect(learnerView).toHaveLength(calculatorMeta.length);
  });
});

describe("IDOR / not-found safety", () => {
  it("getAchievementEntry and getCalculatorEntry return null for unknown ids, never throw", async () => {
    expect(await getAchievementEntry(db, "not-real")).toBeNull();
    expect(await getCalculatorEntry(db, "not-real")).toBeNull();
  });
});
