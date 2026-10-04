import { test, expect } from "@playwright/test";
import { credsA, hasUserA, SKIP_NO_CREDS, login, collectConsoleErrors } from "./helpers";

test.describe("Dashboard", () => {
  test.skip(!hasUserA, SKIP_NO_CREDS);

  test("loads with Today's Mission, progress, and navigation, no console errors", async ({ page }) => {
    const errors = collectConsoleErrors(page);
    const failedRequests: string[] = [];
    page.on("requestfailed", (req) => failedRequests.push(`${req.method()} ${req.url()} - ${req.failure()?.errorText}`));

    await login(page, credsA.email!, credsA.password!);

    await expect(page.getByText(/today's mission/i)).toBeVisible();
    await expect(page.getByRole("navigation", { name: /main navigation/i })).toBeVisible();
    // Progress is rendered via the CircularProgress ring + stat cards - assert at least one
    // percent/streak/XP indicator is present rather than pinning exact markup.
    await expect(page.getByText(/xp/i).first()).toBeVisible();

    expect(errors, `Unexpected console errors: ${JSON.stringify(errors)}`).toEqual([]);
    expect(failedRequests, `Unexpected failed requests: ${JSON.stringify(failedRequests)}`).toEqual([]);
  });
});
