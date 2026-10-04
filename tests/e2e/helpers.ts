import type { Page } from "@playwright/test";

/**
 * Credential gate for every authenticated E2E test (CLAUDE.md Rule A: "never fabricate
 * verification" - a test that can't actually log in must report BLOCKED, never a fabricated
 * PASS). Real test accounts must be provisioned by a human against whichever database BASE_URL
 * points at (local dev DB or a real, non-production-customer test account) and their
 * credentials passed via these env vars - never hardcoded here, never invented.
 */
export const credsA = {
  email: process.env.E2E_TEST_EMAIL,
  password: process.env.E2E_TEST_PASSWORD,
};

export const credsB = {
  email: process.env.E2E_TEST_EMAIL_B,
  password: process.env.E2E_TEST_PASSWORD_B,
};

export const hasUserA = Boolean(credsA.email && credsA.password);
export const hasUserB = Boolean(credsB.email && credsB.password);

export const SKIP_NO_CREDS =
  "BLOCKED: E2E_TEST_EMAIL/E2E_TEST_PASSWORD are not set. See tests/e2e/README.md to provision a test account.";
export const SKIP_NO_CREDS_B =
  "BLOCKED: E2E_TEST_EMAIL_B/E2E_TEST_PASSWORD_B are not set (needed for the user-isolation test). See tests/e2e/README.md.";

export async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.fill('input[type="email"], input#email', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard/, { timeout: 15_000 });
}

export async function logout(page: Page) {
  await page.goto("/account");
  await page.getByRole("button", { name: /log out/i }).first().click();
  await page.waitForURL(/\/login/, { timeout: 15_000 });
}

/**
 * Collects console errors and uncaught page exceptions during a test, filtering out noise that
 * isn't actionable (CLAUDE.md Rule A: "classify errors carefully... do not blindly fail on
 * harmless third-party warnings"). Attach early, read `.errors` at the point you want to assert.
 *
 * Deliberately excludes the generic `Failed to load resource: the server responded with a
 * status of ...` message Chromium logs for ANY non-2xx network response: that text never
 * includes the failing URL, so it cannot be told apart from a genuinely bad first-party error by
 * pattern-matching alone, and reconciling it against the `response` event in real time is racy
 * (Playwright/CDP doesn't guarantee which of the two fires first). Network-level failures are a
 * strictly better signal when checked directly against `response`/`requestfailed` - see
 * `assertNoUnexpectedFailedResponses` below, which is precise (has the real URL) and is not racy
 * (collected first, asserted after network activity has settled). Use both together.
 */
export function collectConsoleErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    if (/favicon|ResizeObserver loop|Download the React DevTools/i.test(text)) return;
    if (/failed to load resource/i.test(text)) return; // see function doc comment - checked via response events instead
    errors.push(`console.error: ${text}`);
  });
  return errors;
}

/**
 * Precise, URL-aware network-failure check, meant to pair with collectConsoleErrors (which
 * deliberately ignores the ambiguous generic "Failed to load resource" console text). Call
 * `collectFailedResponses(page)` before navigating, then `assertOnlyKnownFailures(...)` after -
 * anything NOT in `allowedPaths` fails the assertion with the real URL and status.
 *
 * `allowedPaths` default covers the one confirmed, pre-existing, deliberately documented
 * exception: GET /api/progress returning 401 for an anonymous visitor on a public page (see
 * src/app/(public)/layout.tsx's own comment - "ProgressBootstrap... degrades gracefully (401s
 * silently) for anonymous visitors"). Any OTHER failing request still fails the test.
 */
export function collectFailedResponses(page: Page) {
  const failures: { url: string; status: number }[] = [];
  page.on("response", (res) => {
    if (res.status() >= 400) failures.push({ url: res.url(), status: res.status() });
  });
  return failures;
}

export function assertOnlyKnownFailures(
  failures: { url: string; status: number }[],
  allowedPaths: { path: string; status: number }[] = [{ path: "/api/progress", status: 401 }]
) {
  const unexpected = failures.filter(
    (f) => !allowedPaths.some((a) => f.url.includes(a.path) && f.status === a.status)
  );
  if (unexpected.length > 0) {
    throw new Error(`Unexpected failed request(s): ${JSON.stringify(unexpected)}`);
  }
}
