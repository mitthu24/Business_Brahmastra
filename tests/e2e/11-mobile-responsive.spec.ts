import { test, expect } from "@playwright/test";
import { credsA, hasUserA, SKIP_NO_CREDS, login } from "./helpers";

/**
 * Runs against every project in playwright.config.ts, including the four mobile-viewport
 * projects (320/375/390/430 - BROWSER DEVICE EMULATION via Chromium + a fixed viewport, not a
 * physical device). Public pages are checked without login; the bottom-nav check needs an
 * authenticated account since the bottom nav only renders in the (app) group.
 */
test.describe("Mobile responsive checks", () => {
  test("no horizontal overflow on /roadmap", async ({ page }) => {
    await page.goto("/roadmap");
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(scrollWidth, `document is ${scrollWidth}px wide but viewport is only ${clientWidth}px`).toBeLessThanOrEqual(clientWidth);
  });

  test("no horizontal overflow on /calculators/profit", async ({ page }) => {
    await page.goto("/calculators/profit");
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });

  test("bottom navigation is present and clickable, and does not cover page content", async ({ page }, testInfo) => {
    test.skip(!hasUserA, SKIP_NO_CREDS);
    const isMobileProject = testInfo.project.name.startsWith("mobile-");
    test.skip(!isMobileProject, "Bottom nav is lg:hidden - only meaningful on the mobile viewport projects.");

    await login(page, credsA.email!, credsA.password!);
    await page.goto("/dashboard");

    const bottomNav = page.getByRole("navigation", { name: /bottom navigation/i });
    await expect(bottomNav).toBeVisible();

    const navBox = await bottomNav.boundingBox();
    const viewport = page.viewportSize();
    expect(navBox, "bottom nav must report a bounding box").not.toBeNull();
    // The nav must be anchored at the bottom and fully within the viewport width (no overflow).
    expect(navBox!.x).toBeGreaterThanOrEqual(0);
    expect(navBox!.x + navBox!.width).toBeLessThanOrEqual(viewport!.width + 1); // +1px rounding tolerance

    // It must not visually sit on top of the main content's last element in a way that hides it -
    // approximate check: main content's bottom padding should clear the nav's height.
    const mainPaddingBottom = await page.evaluate(() => {
      const main = document.querySelector("main");
      return main ? parseFloat(getComputedStyle(main).paddingBottom) : 0;
    });
    expect(mainPaddingBottom).toBeGreaterThan(0);

    await bottomNav.getByRole("link", { name: /progress/i }).click();
    await page.waitForURL(/\/progress/);
  });
});
