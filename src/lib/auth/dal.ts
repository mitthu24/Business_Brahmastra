import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getCurrentUser } from "./session";

/** Memoized per-request: safe to call from multiple server components without duplicate DB hits. */
export const verifySession = cache(async () => {
  const user = await getCurrentUser();
  return user ? { userId: user.id, email: user.email } : null;
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
