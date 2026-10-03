// @vitest-environment node
import { describe, it, expect, beforeEach } from "vitest";
import { createTestDb } from "./test-client";
import { createUser, findUserByEmail } from "./auth-queries";
import {
  listUsersForFounder,
  getFounderDashboardStats,
  activateUserAccess,
  suspendUser,
  reactivateUser,
} from "./founder-queries";
import { computeAccessStatus, TRIAL_DURATION_MS } from "@/lib/access/status";
import { completeDayTx } from "./progress-queries";
import type { Database } from "./types";

let db: Database;

beforeEach(async () => {
  db = await createTestDb();
});

describe("3-day trial at signup", () => {
  it("sets a server-generated trial window of exactly 3 days, never from the client", async () => {
    const before = Date.now();
    const user = await createUser(db, { email: "trial@example.com", passwordHash: "x", name: "T" });
    const after = Date.now();

    expect(user.trialStartedAt.getTime()).toBeGreaterThanOrEqual(before);
    expect(user.trialStartedAt.getTime()).toBeLessThanOrEqual(after);
    expect(user.trialEndsAt.getTime() - user.trialStartedAt.getTime()).toBe(TRIAL_DURATION_MS);
  });

  it("defaults a new user to role 'user' and TRIAL access", async () => {
    const user = await createUser(db, { email: "trial2@example.com", passwordHash: "x", name: "T2" });
    expect(user.role).toBe("user");
    expect(computeAccessStatus(user)).toBe("TRIAL");
  });

  it("a user whose trial has elapsed is EXPIRED, independent of any client-supplied date", async () => {
    const user = await createUser(db, { email: "trial3@example.com", passwordHash: "x", name: "T3" });
    const farFuture = new Date(user.trialEndsAt.getTime() + 1000);
    expect(computeAccessStatus(user, farFuture)).toBe("EXPIRED");
  });
});

describe("founder user management", () => {
  it("activateUserAccess grants ACTIVE and clears any suspension", async () => {
    const user = await createUser(db, { email: "act@example.com", passwordHash: "x", name: "Act" });
    await suspendUser(db, user.id);
    await activateUserAccess(db, user.id);
    const refreshed = await findUserByEmail(db, "act@example.com");
    expect(refreshed?.suspendedAt).toBeNull();
    expect(computeAccessStatus(refreshed!)).toBe("ACTIVE");
  });

  it("suspendUser denies protected access even mid-trial", async () => {
    const user = await createUser(db, { email: "susp@example.com", passwordHash: "x", name: "Susp" });
    await suspendUser(db, user.id);
    const refreshed = await findUserByEmail(db, "susp@example.com");
    expect(computeAccessStatus(refreshed!)).toBe("SUSPENDED");
  });

  it("reactivateUser lifts a suspension back to the underlying trial/active state, not straight to ACTIVE", async () => {
    const user = await createUser(db, { email: "react@example.com", passwordHash: "x", name: "React" });
    await suspendUser(db, user.id);
    await reactivateUser(db, user.id);
    const refreshed = await findUserByEmail(db, "react@example.com");
    expect(computeAccessStatus(refreshed!)).toBe("TRIAL");
  });

  it("listUsersForFounder reports each user's derived status and completed-day count", async () => {
    const user = await createUser(db, { email: "list@example.com", passwordHash: "x", name: "List" });
    await completeDayTx(db, user.id, 1);
    const rows = await listUsersForFounder(db);
    const row = rows.find((r) => r.id === user.id);
    expect(row?.status).toBe("TRIAL");
    expect(row?.completedDays).toBe(1);
  });

  it("getFounderDashboardStats buckets learners by status and excludes founders from totals", async () => {
    const active = await createUser(db, { email: "f1@example.com", passwordHash: "x", name: "F1" });
    await activateUserAccess(db, active.id);
    const suspended = await createUser(db, { email: "f2@example.com", passwordHash: "x", name: "F2" });
    await suspendUser(db, suspended.id);
    await createUser(db, { email: "f3@example.com", passwordHash: "x", name: "F3" }); // stays TRIAL

    const stats = await getFounderDashboardStats(db);
    expect(stats.totalUsers).toBe(3);
    expect(stats.activeUsers).toBe(1);
    expect(stats.suspendedUsers).toBe(1);
    expect(stats.activeTrials).toBe(1);
  });
});
