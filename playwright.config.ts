import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "fs";

/**
 * Permanent browser-verification layer (see CLAUDE.md "Browser / E2E verification"). Runs
 * against a locally-started `next dev` server by default (BASE_URL unset), or against any other
 * URL - including production - when BASE_URL is set explicitly; `pnpm test:e2e:production`
 * does this. Never starts a `webServer` when BASE_URL is already set, so a production run can
 * never accidentally spin up a second local server.
 *
 * This environment ships a pre-installed Chromium at PLAYWRIGHT_BROWSERS_PATH
 * (/opt/pw-browsers) that does not match the version @playwright/test expects to download on
 * its own - `playwright install` fails here because the sandbox's network policy blocks
 * cdn.playwright.dev. Pointing `launchOptions.executablePath` at the pre-installed binary avoids
 * that download entirely and was confirmed working in this sandbox (real Chromium launch,
 * real page load, zero console errors) before this config was written.
 */
const baseURL = process.env.BASE_URL ?? "http://localhost:3000";
const isLocal = !process.env.BASE_URL;
const PRE_INSTALLED_CHROMIUM = "/opt/pw-browsers/chromium";
// Only override the browser binary when that sandbox-specific path actually exists, so this
// config stays portable on any other machine/CI where a normal `playwright install` applies.
const executablePath = existsSync(PRE_INSTALLED_CHROMIUM) ? PRE_INSTALLED_CHROMIUM : undefined;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false, // the user-isolation test depends on sequential, deterministic login/logout
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL,
    launchOptions: executablePath ? { executablePath } : {},
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
    { name: "mobile-320", use: { ...devices["Desktop Chrome"], viewport: { width: 320, height: 720 }, isMobile: true, hasTouch: true } },
    { name: "mobile-375", use: { ...devices["Desktop Chrome"], viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true } },
    { name: "mobile-390", use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
    { name: "mobile-430", use: { ...devices["Desktop Chrome"], viewport: { width: 430, height: 932 }, isMobile: true, hasTouch: true } },
  ],
  // Only auto-start a local server when no explicit BASE_URL was given - never for a production run.
  webServer: isLocal
    ? {
        command: "pnpm dev",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
      }
    : undefined,
});
