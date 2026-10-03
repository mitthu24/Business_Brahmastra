import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getCurrentUser } from "./session";
import { computeAccessStatus, hasProtectedAccess, getAccessInfo, type AccessStatus } from "@/lib/access/status";

/** Memoized per-request: safe to call from multiple server components without duplicate DB hits. */
export const verifySession = cache(async () => {
  const user = await getCurrentUser();
  return user ? { userId: user.id, email: user.email } : null;
});

/** Same per-request memoization as verifySession, but carries the full user row (role, trial
 * fields) so callers can compute access status without a second DB round trip. This is the one
 * place every access decision ultimately reads from - see docs/PHASE-5.md. */
export const verifyAccess = cache(async () => {
  const user = await getCurrentUser();
  if (!user) return null;
  const status = computeAccessStatus(user);
  return { user, status, accessInfo: getAccessInfo(user) };
});

/** For Server Components / layouts / pages: redirects unauthenticated visitors to /login. */
export async function requireUserOrRedirect() {
  const session = await verifySession();
  if (!session) redirect("/login");
  return session;
}

/** For Route Handlers / Server Actions: never redirects, just returns null when unauthenticated
 * so the caller can respond with 401/403 - never trust a client-supplied userId instead of this. */
export async function requireUserForApi() {
  const session = await verifySession();
  return session;
}

/**
 * For Route Handlers / Server Actions that perform a *protected learning action* (completing a
 * lesson, writing a journal entry, saving canvas/final-project content, submitting a quiz).
 * Reading a user's own historical data is NOT gated this way - see getProtectedReadSessionForApi -
 * only mutations are, so an expired/suspended user never loses visibility into their own progress.
 */
export type AccessDecision =
  | { ok: true; userId: string; email: string; status: AccessStatus }
  | { ok: false; code: "UNAUTHENTICATED" }
  | { ok: false; code: "ACCESS_DENIED"; status: AccessStatus };

export async function requireActiveAccessForApi(): Promise<AccessDecision> {
  const result = await verifyAccess();
  if (!result) return { ok: false, code: "UNAUTHENTICATED" };
  if (!hasProtectedAccess(result.status)) return { ok: false, code: "ACCESS_DENIED", status: result.status };
  return { ok: true, userId: result.user.id, email: result.user.email, status: result.status };
}

/** For Server Components that render protected *learning content* (e.g. a lesson day): redirects
 * unauthenticated visitors to /login, and returns the access info for authenticated visitors so
 * the page can render its own expired/suspended state - it never redirects an expired user, since
 * they should still see navigation and keep their account, just not the gated content/actions. */
export async function requireLearnerOrRedirect() {
  const result = await verifyAccess();
  if (!result) redirect("/login");
  return result;
}

/** For founder-only Server Components (layouts/pages). Founder role is read fresh from the DB on
 * every call - never from a cookie value, header, or client state, so it cannot be spoofed. An
 * authenticated non-founder is sent back to their own dashboard rather than the founder login
 * screen (which would be confusing - they ARE logged in, just not authorized here). */
export async function requireFounderOrRedirect() {
  const result = await verifyAccess();
  if (!result) redirect("/founder/login");
  if (result.user.role !== "founder") redirect("/dashboard");
  return result;
}

/** For founder-only Route Handlers / Server Actions: never redirects. */
export async function requireFounderForApi() {
  const result = await verifyAccess();
  if (!result || result.user.role !== "founder") return null;
  return result;
}
