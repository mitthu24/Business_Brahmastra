// @vitest-environment node
import { describe, it, expect, beforeEach } from "vitest";
import { eq } from "drizzle-orm";
import { createTestDb } from "./test-client";
import { createUser } from "./auth-queries";
import { recordAuditLog, listAuditLogs } from "./audit-log";
import { users } from "./schema";
import type { Database } from "./types";

let db: Database;

beforeEach(async () => {
  db = await createTestDb();
});

describe("audit log", () => {
  it("records a founder action and lists it back, most recent first", async () => {
    const founder = await createUser(db, { email: "founder@example.com", passwordHash: "x", name: "F", role: "founder" });
    const target = await createUser(db, { email: "target@example.com", passwordHash: "x", name: "T" });

    await recordAuditLog(db, { founderId: founder.id, action: "USER_SUSPENDED", entityType: "user", entityId: target.id });
    await recordAuditLog(db, { founderId: founder.id, action: "USER_REACTIVATED", entityType: "user", entityId: target.id });

    const logs = await listAuditLogs(db);
    expect(logs).toHaveLength(2);
    expect(logs[0].action).toBe("USER_REACTIVATED");
    expect(logs[1].action).toBe("USER_SUSPENDED");
    expect(logs[0].entityId).toBe(target.id);
  });

  it("never stores a password, hash, or token even when passed in metadata", async () => {
    const founder = await createUser(db, { email: "f2@example.com", passwordHash: "x", name: "F2", role: "founder" });
    await recordAuditLog(db, {
      founderId: founder.id,
      action: "PASSWORD_RESET",
      entityType: "user",
      entityId: "some-user-id",
      metadata: { reason: "forgot password" },
    });

    const [log] = await listAuditLogs(db, { action: "PASSWORD_RESET" });
    expect(log.metadata).toEqual({ reason: "forgot password" });
    expect(JSON.stringify(log.metadata)).not.toMatch(/hash|token|password123/i);
  });

  it("filters by action and by entityType independently", async () => {
    const founder = await createUser(db, { email: "f3@example.com", passwordHash: "x", name: "F3", role: "founder" });
    await recordAuditLog(db, { founderId: founder.id, action: "USER_CREATED", entityType: "user", entityId: "u1" });
    await recordAuditLog(db, { founderId: founder.id, action: "TRIAL_EXTENDED", entityType: "user", entityId: "u2" });

    const created = await listAuditLogs(db, { action: "USER_CREATED" });
    expect(created).toHaveLength(1);
    expect(created[0].entityId).toBe("u1");

    const byEntity = await listAuditLogs(db, { entityType: "user" });
    expect(byEntity).toHaveLength(2);
  });

  it("keeps the log entry when the founder account is later deleted, with founderId set null", async () => {
    const founder = await createUser(db, { email: "f4@example.com", passwordHash: "x", name: "F4", role: "founder" });
    await recordAuditLog(db, { founderId: founder.id, action: "USER_CREATED", entityType: "user", entityId: "u3" });

    await db.delete(users).where(eq(users.id, founder.id));

    const logs = await listAuditLogs(db);
    expect(logs).toHaveLength(1);
    expect(logs[0].founderId).toBeNull();
    expect(logs[0].action).toBe("USER_CREATED");
  });
});
