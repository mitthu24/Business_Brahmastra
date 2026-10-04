import { test, expect } from "@playwright/test";
import { credsA, hasUserA, SKIP_NO_CREDS, login, collectConsoleErrors } from "./helpers";

test.describe("Primary navigation", () => {
  test.skip(!hasUserA, SKIP_NO_CREDS);

  test("Dashboard -> Journey -> Learn -> Progress -> Dashboard, via SPA navigation, no errors", async ({ page }) => {
    const errors = collectConsoleErrors(page);
    const navigations: string[] = [];
    page.on("framenavigated", (frame) => {
      if (frame === page.mainFrame()) navigations.push(frame.url());
    });

    await login(page, credsA.email!, credsA.password!);

    await page.getByRole("link", { name: /90-Day Journey/i }).first().click();
    await page.waitForURL(/\/roadmap/);
    await expect(page).toHaveURL(/\/roadmap/);

    await page.getByRole("link", { name: /^Learn$/i }).first().click();
    await page.waitForURL(/\/learn\/day\/\d+/);
    await expect(page).toHaveURL(/\/learn\/day\/\d+/);

    await page.getByRole("link", { name: /^Progress$/i }).first().click();
    await page.waitForURL(/\/progress/);
    await expect(page).toHaveURL(/\/progress/);

    await page.getByRole("link", { name: /^Home$/i }).first().click();
    await page.waitForURL(/\/dashboard/);
    await expect(page).toHaveURL(/\/dashboard/);

    expect(errors, `Unexpected console errors: ${JSON.stringify(errors)}`).toEqual([]);
  });
});
