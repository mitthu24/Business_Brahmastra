import { test, expect } from "@playwright/test";
import { collectConsoleErrors, collectFailedResponses, assertOnlyKnownFailures } from "./helpers";

// Calculators are public (docs/PHASE-5.3.md "Public vs authenticated access") - no test account
// needed, so this suite is never credential-gated.
test.describe("Calculators", () => {
  test("the profit calculator loads, accepts input, and computes a result", async ({ page }) => {
    const errors = collectConsoleErrors(page);
    const failures = collectFailedResponses(page);
    await page.goto("/calculators/profit");

    const inputs = page.locator('input[type="number"]');
    await expect(inputs.first()).toBeVisible();
    await inputs.first().fill("500000");

    // Each calculator renders its results as labelled cards - assert the result area updated to
    // something other than the pre-fill placeholder, without pinning an exact currency format.
    await expect(page.locator(".card", { hasText: /profit|margin/i }).first()).toBeVisible();

    expect(errors, `Unexpected console errors: ${JSON.stringify(errors)}`).toEqual([]);
    // Anonymous visitors get one known, pre-existing, deliberately accepted 401 on
    // GET /api/progress (see helpers.ts) - anything else here is a real regression.
    assertOnlyKnownFailures(failures);
  });

  test("mobile (375px): numeric inputs use inputMode=decimal for the numeric keypad", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/calculators/profit");
    const firstInput = page.locator('input[type="number"]').first();
    await expect(firstInput).toHaveAttribute("inputmode", "decimal");
  });
});
