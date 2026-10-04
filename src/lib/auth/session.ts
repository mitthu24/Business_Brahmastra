import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
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

/**
 * Returns the authenticated user for the current request, or null. Never trusts anything the
 * client sends except the HttpOnly session cookie - every lookup re-validates against the DB.
 *
 * Wrapped in React's `cache()` (Phase 5.5.2 performance pass): before this, both
 * src/lib/auth/dal.ts#verifySession and #verifyAccess called this function directly from inside
 * their OWN separate `cache()` wrappers - two distinct memoization boundaries around the same
 * underlying DB read. Any page that uses both (e.g. the (app) layout's requireUserOrRedirect PLUS
 * a page's own verifyAccess/requireLearnerOrRedirect - dashboard, the lesson page, account) ran
 * this exact session lookup TWICE per request. Memoizing it here instead means verifySession and
 * verifyAccess now share the same cached promise, so it runs at most once per request no matter
 * how many callers ask for it - request-scoped only (React's cache() never persists across
 * requests or users), so this changes nothing about security or data isolation, only how many
 * times the identical read happens within one request.
 */
export const getCurrentUser = cache(async () => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return getUserBySessionToken(getDb(), token);
});
