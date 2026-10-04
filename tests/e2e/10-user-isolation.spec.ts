import { test, expect } from "@playwright/test";
import { credsA, credsB, hasUserA, hasUserB, SKIP_NO_CREDS, SKIP_NO_CREDS_B, login, logout } from "./helpers";

/**
 * CRITICAL - this test exists specifically to prevent recurrence of the ProgressBootstrap bug
 * fixed in Phase 5.5.2's follow-up (src/components/sync/ProgressBootstrap.tsx's module-level
 * "already synced" flag was not reset on logout, so a second user logging in on the same
 * browser tab could see the first user's progress still sitting in the Zustand store). This
 * test drives that exact lifecycle in a real browser: A logs in, B logs in afterward IN THE SAME
 * PAGE/TAB (no hard reload between them, which is the precise condition that bug needed).
 *
 * The primary assertion is on the MECHANISM, not just the data: GET /api/progress must actually
 * fire again for User B. Comparing A's and B's progress VALUES is a weaker, secondary check -
 * two freshly-provisioned test accounts can legitimately both start at zero XP/streak/days, so
 * value-equality alone can't distinguish "correctly isolated, both empty" from "the bug, B never
 * fetched, A's empty-ish leftover state happened to render" for brand-new fixtures. Requesting a
 * fresh fetch is what the bug actually broke, so that's what this test pins down.
 *
 * Requires two distinct test accounts (E2E_TEST_EMAIL/PASSWORD for A, E2E_TEST_EMAIL_B/PASSWORD_B
 * for B) - never the same account twice, which would make this test pass trivially.
 */
test.describe("User isolation (cross-user data leak regression test)", () => {
  test.skip(!hasUserA || !hasUserB, !hasUserA ? SKIP_NO_CREDS : SKIP_NO_CREDS_B);

  test("logging in as User B after User A logs out (same tab) triggers a fresh /api/progress fetch, never a skipped one", async ({ page }) => {
    await login(page, credsA.email!, credsA.password!);
    await page.goto("/dashboard");

    const userAEmail = await page.evaluate(() => window.localStorage.getItem("business-school-progress"));
    expect(userAEmail, "User A's session must have persisted a progress snapshot").toBeTruthy();

    // Logout WITHOUT a hard page reload - this is the exact scenario the bug needed.
    await logout(page);

    // Watch for the real network request as User B logs in, in the SAME tab/page object.
    const progressRequests: string[] = [];
    page.on("request", (req) => {
      if (req.url().includes("/api/progress")) progressRequests.push(req.method());
    });

    await login(page, credsB.email!, credsB.password!);
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    expect(
      progressRequests.filter((m) => m === "GET").length,
      "User B's login must trigger its own GET /api/progress - if this is 0, the bootstrap guard " +
        "was not reset at logout and User B is seeing User A's leftover client state."
    ).toBeGreaterThan(0);

    // Secondary check: the account page must identify B, never A, confirming the server session
    // itself (not just the client fetch) is correctly scoped.
    await page.goto("/account");
    const accountPageText = await page.locator("body").innerText();
    expect(accountPageText).toContain(credsB.email!);
    expect(accountPageText).not.toContain(credsA.email!);
  });
});
