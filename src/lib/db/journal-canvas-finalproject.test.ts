// @vitest-environment node
import { describe, it, expect, beforeEach } from "vitest";
import { createTestDb } from "./test-client";
import { users } from "./schema";
import { listJournalEntries, createJournalEntryRow, deleteJournalEntryRow } from "./journal-queries";
import { getCanvas, upsertCanvas } from "./canvas-queries";
import { getFinalProjectAnswers, saveFinalProjectStep } from "./final-project-queries";
import type { Database } from "./types";

let db: Database;
let userA: string;
let userB: string;

beforeEach(async () => {
  db = await createTestDb();
  const [a] = await db.insert(users).values({ email: "a@example.com", passwordHash: "x" }).returning();
  const [b] = await db.insert(users).values({ email: "b@example.com", passwordHash: "x" }).returning();
  userA = a.id;
  userB = b.id;
});

describe("journal", () => {
  it("creates, lists (newest first) and deletes entries scoped to the owning user", async () => {
    await createJournalEntryRow(db, userA, "Idea", "first");
    await createJournalEntryRow(db, userA, "Finance", "second");
    const entries = await listJournalEntries(db, userA);
    expect(entries.map((e) => e.text)).toEqual(["second", "first"]);

    const otherUserEntries = await listJournalEntries(db, userB);
    expect(otherUserEntries).toHaveLength(0);
  });

  it("IDOR: a user cannot delete another user's journal entry", async () => {
    const entry = await createJournalEntryRow(db, userA, "Idea", "secret plan");
    const deletedByWrongUser = await deleteJournalEntryRow(db, userB, entry.id);
    expect(deletedByWrongUser).toBe(false);
    const stillThere = await listJournalEntries(db, userA);
    expect(stillThere).toHaveLength(1);

    const deletedByOwner = await deleteJournalEntryRow(db, userA, entry.id);
    expect(deletedByOwner).toBe(true);
  });
});

describe("canvas", () => {
  it("autosaves per user and does not leak between users", async () => {
    await upsertCanvas(db, userA, { valueProposition: "Solve X for Y" });
    const canvasA = await getCanvas(db, userA);
    expect(canvasA.valueProposition).toBe("Solve X for Y");

    const canvasB = await getCanvas(db, userB);
    expect(canvasB.valueProposition).toBe("");
  });
});

describe("final project", () => {
  it("saves steps idempotently (unique(finalProjectId, stepNumber) + upsert)", async () => {
    await saveFinalProjectStep(db, userA, 1, "My idea");
    const after1 = await saveFinalProjectStep(db, userA, 1, "My improved idea");
    expect(after1.answers.idea).toBe("My improved idea");

    await saveFinalProjectStep(db, userA, 2, "The problem");
    const { answers } = await getFinalProjectAnswers(db, userA);
    expect(answers.idea).toBe("My improved idea");
    expect(answers.problem).toBe("The problem");

    const otherUser = await getFinalProjectAnswers(db, userB);
    expect(otherUser.answers.idea).toBe("");
  });
});
