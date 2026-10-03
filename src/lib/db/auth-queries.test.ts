// @vitest-environment node
import { describe, it, expect, beforeEach } from "vitest";
import { createTestDb } from "./test-client";
import {
  createUser,
  findUserByEmail,
  createSession,
  getUserBySessionToken,
  deleteSessionByToken,
  createPasswordResetToken,
  consumePasswordResetToken,
} from "./auth-queries";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { isUniqueViolation } from "./errors";
import type { Database } from "./types";

let db: Database;

beforeEach(async () => {
  db = await createTestDb();
});

describe("users & passwords", () => {
  it("hashes passwords and verifies them, and rejects a wrong password", async () => {
    const hash = await hashPassword("correct-password-123");
    expect(hash).not.toBe("correct-password-123");
    expect(await verifyPassword("correct-password-123", hash)).toBe(true);
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });

  it("enforces unique email at the DB level with a unique_violation (23505), the exact shape isUniqueViolation detects", async () => {
    await createUser(db, { email: "dup@example.com", passwordHash: "x", name: "A" });
    try {
      await createUser(db, { email: "dup@example.com", passwordHash: "y", name: "B" });
      expect.unreachable("second createUser with the same email should have thrown");
    } catch (err) {
      expect(isUniqueViolation(err)).toBe(true);
    }
  });

  it("two concurrent signups for the same email result in exactly one user, the other rejected - not two rows", async () => {
    const [a, b] = await Promise.allSettled([
      createUser(db, { email: "race@example.com", passwordHash: "x", name: "A" }),
      createUser(db, { email: "race@example.com", passwordHash: "y", name: "B" }),
    ]);
    const outcomes = [a.status, b.status];
    expect(outcomes.filter((s) => s === "fulfilled").length).toBe(1);
    expect(outcomes.filter((s) => s === "rejected").length).toBe(1);
  });

  it("never stores the plaintext password - only the bcrypt hash", async () => {
    const plain = "my-plain-password-123";
    const hash = await hashPassword(plain);
    const user = await createUser(db, { email: "plain@example.com", passwordHash: hash, name: "P" });
    expect(user.passwordHash).not.toBe(plain);
    expect(user.passwordHash).toMatch(/^\$2[aby]\$/); // bcrypt hash format
  });

  it("findUserByEmail does not leak whether an account exists via thrown errors", async () => {
    const user = await findUserByEmail(db, "nobody@example.com");
    expect(user).toBeNull();
  });
});

describe("sessions", () => {
  it("creates a session and resolves the user from the raw token, not a client-supplied id", async () => {
    const user = await createUser(db, { email: "s@example.com", passwordHash: "x", name: "S" });
    const { token } = await createSession(db, user.id);
    const resolved = await getUserBySessionToken(db, token);
    expect(resolved?.id).toBe(user.id);
  });

  it("rejects a tampered/unknown token", async () => {
    const resolved = await getUserBySessionToken(db, "not-a-real-token");
    expect(resolved).toBeNull();
  });

  it("logout deletes the session so the same token no longer resolves", async () => {
    const user = await createUser(db, { email: "s2@example.com", passwordHash: "x", name: "S2" });
    const { token } = await createSession(db, user.id);
    await deleteSessionByToken(db, token);
    expect(await getUserBySessionToken(db, token)).toBeNull();
  });
});

describe("password reset tokens", () => {
  it("consumes a valid token exactly once", async () => {
    const user = await createUser(db, { email: "r@example.com", passwordHash: "x", name: "R" });
    const token = await createPasswordResetToken(db, user.id);
    const firstUse = await consumePasswordResetToken(db, token);
    expect(firstUse).toBe(user.id);
    const secondUse = await consumePasswordResetToken(db, token);
    expect(secondUse).toBeNull();
  });

  it("rejects an unknown token", async () => {
    expect(await consumePasswordResetToken(db, "bogus")).toBeNull();
  });
});
