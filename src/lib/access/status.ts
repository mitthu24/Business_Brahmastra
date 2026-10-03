/**
 * Canonical, server-only access-status calculation (see docs/PHASE-5.md "Access-state model").
 *
 * This is the ONLY place access decisions are computed. It is a pure function over fields already
 * read from the `users` table - callers (DAL, API routes, pages) feed it a fresh row on every
 * request, so there is no cached/stale "accessStatus" field anywhere to fall out of sync. Nothing
 * here trusts the client: no browser clock, no localStorage, no request body.
 */

export type AccessStatus = "ACTIVE" | "TRIAL" | "EXPIRED" | "SUSPENDED";

export interface AccessSubject {
  role: "user" | "founder";
  trialEndsAt: Date;
  accessActivatedAt: Date | null;
  suspendedAt: Date | null;
}

export interface AccessInfo {
  status: AccessStatus;
  trialEndsAt: Date;
  /** Whole days remaining until trialEndsAt, floored at 0. Only meaningful while status is TRIAL. */
  daysRemaining: number;
  /** Milliseconds remaining until trialEndsAt, floored at 0. */
  msRemaining: number;
}

export const TRIAL_DURATION_MS = 3 * 24 * 60 * 60 * 1000;

export function computeAccessStatus(user: AccessSubject, now: Date = new Date()): AccessStatus {
  // Founders are never trial-gated - they authenticate through a wholly separate, server-checked
  // role, not a client flag, so this can't be spoofed by a regular user.
  if (user.role === "founder") return "ACTIVE";
  if (user.suspendedAt) return "SUSPENDED";
  if (user.accessActivatedAt) return "ACTIVE";
  if (now.getTime() < user.trialEndsAt.getTime()) return "TRIAL";
  return "EXPIRED";
}

export function getAccessInfo(user: AccessSubject, now: Date = new Date()): AccessInfo {
  const status = computeAccessStatus(user, now);
  const msRemaining = Math.max(0, user.trialEndsAt.getTime() - now.getTime());
  return {
    status,
    trialEndsAt: user.trialEndsAt,
    daysRemaining: Math.ceil(msRemaining / (24 * 60 * 60 * 1000)),
    msRemaining,
  };
}

/** Whether this status may use protected learning features (view + act). EXPIRED/SUSPENDED may
 * still read their own historical data (dashboard, progress, journal, canvas) so nothing looks
 * deleted - see docs/PHASE-5.md "Trial UX". */
export function hasProtectedAccess(status: AccessStatus): boolean {
  return status === "ACTIVE" || status === "TRIAL";
}
