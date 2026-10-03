import "server-only";
import { createHash, randomBytes } from "node:crypto";

/** Generates a high-entropy, URL-safe random token (used for session and reset tokens). */
export function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

/** Only the hash of a token is ever stored in the database - the raw token lives only in the
 * cookie (sessions) or the emailed link (password reset), so a DB read alone can't impersonate. */
export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}
