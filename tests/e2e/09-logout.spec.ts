import { test, expect } from "@playwright/test";
import { credsA, hasUserA, SKIP_NO_CREDS, login, logout } from "./helpers";

test.describe("Logout", () => {
  test.skip(!hasUserA, SKIP_NO_CREDS);

  test("removes the authenticated session, and a protected page is no longer reachable", async ({ page }) => {
    await login(page, credsA.email!, credsA.password!);
    await logout(page);
    expect(page.url()).toContain("/login");

    // The strongest signal: try to load a protected page directly after logout. The (app)
    // layout's requireUserOrRedirect (src/lib/auth/dal.ts) must send us straight back to /login,
    // never render dashboard content for a logged-out visitor.
    await page.goto("/dashboard");
    await page.waitForURL(/\/login/, { timeout: 10_000 });
    expect(page.url()).toContain("/login");
  });
});
