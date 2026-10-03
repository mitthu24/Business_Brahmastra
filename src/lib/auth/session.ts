import "server-only";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db/client";
import {
  createSession as createSessionRow,
  deleteSessionByToken,
  getUserBySessionToken,
} from "@/lib/db/auth-queries";

export const SESSION_COOKIE = "session";

export async function createSessionCookie(userId: string) {
  const db = getDb();
  const { token, expiresAt } = await createSessionRow(db, userId);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    try {
      await deleteSessionByToken(getDb(), token);
    } catch {
      // DB unavailable - still clear the cookie so the client is logged out locally.
    }
  }
  store.delete(SESSION_COOKIE);
}

/** Returns the authenticated user for the current request, or null. Never trusts anything the
 * client sends except the HttpOnly session cookie - every lookup re-validates against the DB. */
export async function getCurrentUser() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return getUserBySessionToken(getDb(), token);
}
