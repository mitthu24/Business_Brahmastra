import { test, expect } from "@playwright/test";
import { collectConsoleErrors, collectFailedResponses, assertOnlyKnownFailures } from "./helpers";

// GlobalSearch lives in the shared AppShell, which also renders on public pages - no login
// needed to exercise it.
test.describe("Global search", () => {
  test("opens, filters results while typing, Escape closes it, and focus returns to the trigger", async ({ page }) => {
    const errors = collectConsoleErrors(page);
    const failures = collectFailedResponses(page);
    await page.goto("/roadmap");

    const trigger = page.getByRole("button", { name: /open global search/i });
    await trigger.click();

    const input = page.getByRole("combobox");
    await expect(input).toBeFocused();
    await input.fill("profit");

    await expect(page.getByRole("option").first()).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(input).toBeHidden();
    await expect(trigger).toBeFocused();

    expect(errors, `Unexpected console errors: ${JSON.stringify(errors)}`).toEqual([]);
    assertOnlyKnownFailures(failures); // anonymous visitor's known /api/progress 401 - see helpers.ts
  });

  test("the X close button also closes the modal and restores focus", async ({ page }) => {
    await page.goto("/roadmap");
    const trigger = page.getByRole("button", { name: /open global search/i });
    await trigger.click();
    await page.getByRole("button", { name: /close search/i }).click();
    await expect(page.getByRole("combobox")).toBeHidden();
    await expect(trigger).toBeFocused();
  });
});
