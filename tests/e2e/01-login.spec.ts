import { test, expect } from "@playwright/test";
import { credsA, hasUserA, SKIP_NO_CREDS, collectConsoleErrors } from "./helpers";

test.describe("Login", () => {
  test("the login page itself loads with working inputs (no account needed)", async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto("/login");
    await expect(page.locator('input[type="email"], input#email')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("logging in reaches the dashboard", async ({ page }) => {
    test.skip(!hasUserA, SKIP_NO_CREDS);
    const errors = collectConsoleErrors(page);
    await page.goto("/login");
    await page.fill('input[type="email"], input#email', credsA.email!);
    await page.fill('input[type="password"]', credsA.password!);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 15_000 });
    expect(page.url()).toContain("/dashboard");
    expect(errors).toEqual([]);
  });
});
