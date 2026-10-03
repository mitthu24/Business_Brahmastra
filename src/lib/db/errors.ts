/**
 * Postgres SQLSTATE 23505 (unique_violation). Drizzle wraps the underlying driver's error in a
 * DrizzleQueryError with the real error on `.cause` - verified against both the postgres.js driver
 * used in production and the PGlite driver used in tests - so this checks both that shape and a
 * bare top-level `.code`, rather than assuming one specific driver's wrapping behavior.
 * See docs/PHASE-5.2.md "Duplicate email" for where this is used (the signup race condition).
 */
export function isUniqueViolation(err: unknown): boolean {
  const code = (candidate: unknown): unknown =>
    typeof candidate === "object" && candidate !== null ? (candidate as { code?: unknown }).code : undefined;
  if (code(err) === "23505") return true;
  const cause = typeof err === "object" && err !== null ? (err as { cause?: unknown }).cause : undefined;
  return code(cause) === "23505";
}
