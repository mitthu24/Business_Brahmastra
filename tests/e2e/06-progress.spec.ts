import { test, expect } from "@playwright/test";
import { credsA, hasUserA, SKIP_NO_CREDS, login, collectConsoleErrors } from "./helpers";

test.describe("Progress page", () => {
  test.skip(!hasUserA, SKIP_NO_CREDS);

  test("renders XP, streak, completion and achievements for the logged-in test account", async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await login(page, credsA.email!, credsA.password!);
    await page.goto("/progress");

    await expect(page.getByText(/current streak/i)).toBeVisible();
    await expect(page.getByText(/total xp/i)).toBeVisible();
    await expect(page.getByText(/achievements/i).first()).toBeVisible();
    await expect(page.getByText(/days completed/i)).toBeVisible();

    expect(errors, `Unexpected console errors: ${JSON.stringify(errors)}`).toEqual([]);
  });
});
