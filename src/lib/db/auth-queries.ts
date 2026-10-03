import "server-only";
import { eq, and, isNull, gt } from "drizzle-orm";
import type { Database } from "./types";
import { users, userProfiles, sessions, passwordResetTokens } from "./schema";
import { hashToken, generateToken } from "@/lib/auth/tokens";
import { TRIAL_DURATION_MS } from "@/lib/access/status";

export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function findUserByEmail(db: Database, email: string) {
  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return rows[0] ?? null;
}

export async function findUserById(db: Database, userId: string) {
  const rows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return rows[0] ?? null;
}

export async function createUser(
  db: Database,
  input: { email: string; passwordHash: string; name: string; role?: "user" | "founder" }
) {
  return db.transaction(async (tx) => {
    // Trial window is computed from the server clock at the moment of signup, never the browser's
    // - see docs/PHASE-5.md "3-day trial". The column defaults mirror this for safety, but setting
    // it explicitly here means the exact instant is always known and auditable from app code too.
    // A founder-created account (role: "founder") is exempt from the trial model entirely
    // (computeAccessStatus always returns ACTIVE for founders) - the trial fields are still set for
    // schema consistency but are never consulted for that role.
    const trialStartedAt = new Date();
    const trialEndsAt = new Date(trialStartedAt.getTime() + TRIAL_DURATION_MS);
    const [user] = await tx
      .insert(users)
      .values({ email: input.email, passwordHash: input.passwordHash, trialStartedAt, trialEndsAt, role: input.role ?? "user" })
      .returning();
    const initials = initialsFromName(input.name);
    await tx.insert(userProfiles).values({ userId: user.id, name: input.name, avatarInitials: initials });
    return user;
  });
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export async function getUserProfile(db: Database, userId: string) {
  const rows = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  return rows[0] ?? null;
}

export async function updateUserPassword(db: Database, userId: string, passwordHash: string) {
  await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, userId));
}

/** Creates a session and returns the RAW token to store in the cookie. Only the hash is persisted. */
export async function createSession(db: Database, userId: string): Promise<{ token: string; expiresAt: Date }> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.insert(sessions).values({ userId, tokenHash: hashToken(token), expiresAt });
  return { token, expiresAt };
}

export async function getUserBySessionToken(db: Database, rawToken: string) {
  const tokenHash = hashToken(rawToken);
  const rows = await db
    .select({ user: users, expiresAt: sessions.expiresAt })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.tokenHash, tokenHash))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  if (row.expiresAt.getTime() < Date.now()) return null;
  return row.user;
}

export async function deleteSessionByToken(db: Database, rawToken: string) {
  await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(rawToken)));
}

/** Revokes every session for a user. Used on password change (docs/PHASE-5.md "Account settings")
 * so a stolen session token on another device is invalidated the moment the password is changed. */
export async function deleteAllSessionsForUser(db: Database, userId: string) {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

export async function createPasswordResetToken(db: Database, userId: string): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  await db.insert(passwordResetTokens).values({ userId, tokenHash: hashToken(token), expiresAt });
  return token;
}

export async function consumePasswordResetToken(db: Database, rawToken: string): Promise<string | null> {
  const tokenHash = hashToken(rawToken);
  const now = new Date();
  const rows = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.tokenHash, tokenHash),
        isNull(passwordResetTokens.consumedAt),
        gt(passwordResetTokens.expiresAt, now)
      )
    )
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  await db.update(passwordResetTokens).set({ consumedAt: now }).where(eq(passwordResetTokens.id, row.id));
  return row.userId;
}
