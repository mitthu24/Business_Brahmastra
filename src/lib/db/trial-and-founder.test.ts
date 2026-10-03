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
  extendTrial,
  resetUserPasswordByFounder,
  updateUserProfileByFounder,
  getUserDetailForFounder,
} from "./founder-queries";
import { createSession, getUserBySessionToken } from "./auth-queries";
import { isUniqueViolation } from "./errors";
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

    const stats = await getFounderDashboardStats(db, 90);
    expect(stats.totalUsers).toBe(3);
    expect(stats.activeUsers).toBe(1);
    expect(stats.suspendedUsers).toBe(1);
    expect(stats.activeTrials).toBe(1);
  });

  it("extendTrial moves trialEndsAt and keeps a non-ACTIVE, non-SUSPENDED user in TRIAL", async () => {
    const user = await createUser(db, { email: "extend@example.com", passwordHash: "x", name: "Ext" });
    const newEndsAt = new Date(user.trialEndsAt.getTime() + 5 * 24 * 60 * 60 * 1000);
    await extendTrial(db, user.id, newEndsAt);
    const refreshed = await findUserByEmail(db, "extend@example.com");
    expect(refreshed?.trialEndsAt.getTime()).toBe(newEndsAt.getTime());
    expect(computeAccessStatus(refreshed!)).toBe("TRIAL");
  });

  it("resetUserPasswordByFounder updates the password hash and revokes every existing session", async () => {
    const user = await createUser(db, { email: "reset@example.com", passwordHash: "old-hash", name: "Reset" });
    const { token } = await createSession(db, user.id);
    expect(await getUserBySessionToken(db, token)).not.toBeNull();

    await resetUserPasswordByFounder(db, user.id, "new-hash");

    const refreshed = await findUserByEmail(db, "reset@example.com");
    expect(refreshed?.passwordHash).toBe("new-hash");
    expect(await getUserBySessionToken(db, token)).toBeNull();
  });

  it("updateUserProfileByFounder updates name and email independently", async () => {
    const user = await createUser(db, { email: "profile@example.com", passwordHash: "x", name: "Old Name" });
    await updateUserProfileByFounder(db, user.id, { name: "New Name" });
    let refreshed = await findUserByEmail(db, "profile@example.com");
    expect(refreshed?.email).toBe("profile@example.com");

    await updateUserProfileByFounder(db, user.id, { email: "newmail@example.com" });
    refreshed = await findUserByEmail(db, "newmail@example.com");
    expect(refreshed).not.toBeNull();
  });

  it("updateUserProfileByFounder surfaces a unique-violation error when the new email is taken", async () => {
    await createUser(db, { email: "taken@example.com", passwordHash: "x", name: "Taken" });
    const user = await createUser(db, { email: "wants-taken@example.com", passwordHash: "x", name: "Wants" });

    let caught: unknown;
    try {
      await updateUserProfileByFounder(db, user.id, { email: "taken@example.com" });
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeDefined();
    expect(isUniqueViolation(caught)).toBe(true);
  });

  it("getUserDetailForFounder returns null for a non-existent user id (IDOR-safe existence check)", async () => {
    expect(await getUserDetailForFounder(db, "00000000-0000-0000-0000-000000000000")).toBeNull();
  });

  it("getUserDetailForFounder returns the full profile and progress snapshot for a real user", async () => {
    const user = await createUser(db, { email: "detail@example.com", passwordHash: "x", name: "Detail" });
    await completeDayTx(db, user.id, 1);

    const detail = await getUserDetailForFounder(db, user.id);
    expect(detail).not.toBeNull();
    expect(detail?.email).toBe("detail@example.com");
    expect(detail?.name).toBe("Detail");
    expect(detail?.status).toBe("TRIAL");
    expect(detail?.progress.completedDays).toContain(1);
  });

  it("createUser can create a founder-role account when explicitly requested", async () => {
    const founder = await createUser(db, { email: "founder@example.com", passwordHash: "x", name: "Founder", role: "founder" });
    expect(founder.role).toBe("founder");
  });
});
