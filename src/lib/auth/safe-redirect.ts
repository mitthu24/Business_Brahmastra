/**
 * Validates a client-supplied "return to this page after login" path (docs/PHASE-5.2.md
 * "Login redirect"). Only ever used to redirect within this app - never trusts the value enough
 * to redirect off-site. A value that isn't a safe same-app relative path is rejected entirely
 * (the caller falls back to its own default, e.g. "/dashboard"), never partially sanitized and
 * used anyway.
 */
export function sanitizeNextPath(raw: FormDataEntryValue | string | null | undefined): string | null {
  if (typeof raw !== "string" || raw.length === 0) return null;
  // Must start with a single "/" (a real relative path) and never "//" or "/\" (protocol-relative
  // / backslash tricks some browsers normalize into a scheme-relative URL, e.g. //evil.com).
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return null;
  // Reject anything that could embed a scheme/host (e.g. "/\t/evil.com", "/..%2f..") by requiring
  // it parse cleanly as a path-only URL relative to a fixed, harmless base.
  try {
    const url = new URL(raw, "http://localhost");
    if (url.origin !== "http://localhost") return null;
    return url.pathname + url.search;
  } catch {
    return null;
  }
}
