# E2E / browser verification

Permanent browser tests (Playwright) for the learner app's critical flows. See `CLAUDE.md`
("Browser / E2E verification") for the rules governing when these results may be reported as
PASS vs BLOCKED.

## Running locally

```bash
pnpm test:e2e
```

This starts `next dev` automatically (via `playwright.config.ts`'s `webServer`) and runs every
spec against it. Tests that don't need an account (login page itself, calculators, search,
mobile overflow checks) run with no setup.

## Running against production (read-only checks only)

```bash
BASE_URL=https://90-day-business-school.vercel.app pnpm test:e2e:production
```

Never run destructive flows against production. This is for safe navigation/smoke checks only.

## Provisioning test accounts (required for the authenticated suites)

Tests 02 (dashboard), 03 (navigation), 04-05 (lesson), 06 (progress), 09 (logout) and 11 (bottom
nav) need ONE test account. Test 10 (user isolation - the most important one, added specifically
to catch a repeat of the ProgressBootstrap cross-user leak) needs TWO.

**Do not reuse a real customer account. Do not hardcode credentials in source.**

1. Sign up two fresh accounts through the app's own `/signup` flow (locally against a dev
   database, or as genuine non-production test accounts) - call them, say,
   `e2e-test-a@example.com` and `e2e-test-b@example.com`.
2. For test 10 to be meaningful even on two freshly-created accounts, it asserts on the
   *mechanism* (a fresh `GET /api/progress` actually fires for the second login) rather than on
   the two accounts having different progress values - so you do not need to manually complete
   any lessons first, though doing so for at least one account makes the suite more thorough.
3. Export the credentials as environment variables before running the suite - never commit them:

   ```bash
   export E2E_TEST_EMAIL="e2e-test-a@example.com"
   export E2E_TEST_PASSWORD="..."
   export E2E_TEST_EMAIL_B="e2e-test-b@example.com"
   export E2E_TEST_PASSWORD_B="..."
   pnpm test:e2e
   ```

Without these set, every authenticated test reports **skipped (BLOCKED)**, not a fabricated pass
- `pnpm test:e2e` still runs and exits successfully on the tests that don't need an account.

## Browser binary note (this sandbox)

This environment ships a pre-installed Chromium at `/opt/pw-browsers/chromium` that
`playwright.config.ts` points to directly via `launchOptions.executablePath`, because
`playwright install` cannot reach `cdn.playwright.dev` from here. If you run this suite somewhere
else (CI, your own machine) and that path doesn't exist, either remove the `executablePath`
override or run `npx playwright install chromium` first.
