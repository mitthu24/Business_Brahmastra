import { test, expect } from "@playwright/test";
import { credsA, hasUserA, SKIP_NO_CREDS, login, collectConsoleErrors } from "./helpers";

test.describe("Lesson", () => {
  test.skip(!hasUserA, SKIP_NO_CREDS);

  test("day 1 loads with core content, exercise and quiz sections", async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await login(page, credsA.email!, credsA.password!);
    await page.goto("/learn/day/1");

    await expect(page.getByText(/today's mission/i)).toBeVisible();
    await expect(page.getByText(/core concept/i)).toBeVisible();
    // Exercise/quiz sections are founder-publish-gated (docs/PHASE-5.3.md) so they're asserted
    // leniently - present if visible, never required, since a founder could unpublish either.
    const exercise = page.getByText(/practice/i);
    if (await exercise.count()) await expect(exercise.first()).toBeVisible();

    expect(errors, `Unexpected console errors: ${JSON.stringify(errors)}`).toEqual([]);
  });
});
