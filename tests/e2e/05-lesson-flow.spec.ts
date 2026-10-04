import { test, expect } from "@playwright/test";
import { credsA, hasUserA, SKIP_NO_CREDS, login, collectConsoleErrors } from "./helpers";

test.describe("Lesson flow (moving between days)", () => {
  test.skip(!hasUserA, SKIP_NO_CREDS);

  test("day 1 -> day 2 via the Next link, with no blank screen, broken route, or unexpected logout", async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await login(page, credsA.email!, credsA.password!);
    await page.goto("/learn/day/1");

    await page.getByRole("link", { name: /Day 2/i }).click();
    await page.waitForURL(/\/learn\/day\/2/);
    await expect(page).toHaveURL(/\/learn\/day\/2/);

    // Not blank, not logged out: the lesson chrome and nav are both still present.
    await expect(page.getByText(/today's mission/i)).toBeVisible();
    await expect(page.getByRole("navigation", { name: /main navigation/i })).toBeVisible();

    expect(errors, `Unexpected console errors: ${JSON.stringify(errors)}`).toEqual([]);
  });
});
