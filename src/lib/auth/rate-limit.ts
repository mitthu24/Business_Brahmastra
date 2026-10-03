import "server-only";

/**
 * Best-effort in-memory rate limiting for auth endpoints (login, forgot-password).
 * Limitation (documented in docs/PHASE-4.md): this is per-process state. On Vercel's
 * serverless platform each invocation may be a different process, so this does not provide a
 * hard guarantee across instances - it is a pragmatic mitigation, not a replacement for an
 * infra-level rate limiter (e.g. Vercel Firewall / Upstash) which the spec says not to add here.
 */
const attempts = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 10;

export function checkRateLimit(key: string): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterMs: 0 };
  }
  if (entry.count >= MAX_ATTEMPTS) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }
  entry.count += 1;
  return { allowed: true, retryAfterMs: 0 };
}
