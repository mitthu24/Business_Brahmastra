@AGENTS.md

# Permanent engineering verification rules

These rules apply to every future session working on this repository, not just the one that
wrote them. They exist because a prior performance change (the Phase 5.5.2 ProgressBootstrap
fix) was reported complete after passing `pnpm test`/`typecheck`/`lint`/`build`, but had an
unreviewed cross-user data-leak bug that only surfaced under manual scrutiny. Automated checks
passing is necessary, not sufficient.

## Rule A — Never fabricate verification

Never claim PASS, COMPLETE, VERIFIED, READY, FIXED, PRODUCTION-SAFE, or PERFORMANCE IMPROVED
without having actually run the corresponding check. Never fabricate screenshots, LCP/INP/CLS/
TTFB, network waterfalls, request counts, Lighthouse scores, console output, or any other
"observed" result that wasn't genuinely observed this session.

If browser testing cannot actually run (no reachable browser, no network path to the target,
no test credentials), the status is **BLOCKED**. Never convert BLOCKED into PASS because the
code "should" work, or because an earlier session reported PASS on a related change.

## Rule B — Standard code verification

After any implementation, run all four:

```
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

(`pnpm verify` runs all four in order via `scripts/verify.mjs` and stops at the first failure -
prefer it for a single pass/fail signal, but the individual commands remain the source of truth.)
If any fails, fix it and rerun - do not report PASS with a known failing step.

## Rule C — Git verification

Before reporting anything complete, run `git status`, `git diff --stat`, and `git diff`. Check
for unrelated changes, debug/console logging left in, temporary files, secrets or credentials,
test bypasses, disabled lint rules (`eslint-disable` without a specific, justified rule name),
disabled TypeScript checks (`@ts-ignore`/`@ts-expect-error` without justification), and
accidentally-committed generated files.

## Rule D — Security verification / user isolation

Any change touching authentication, authorization, cookies, sessions, localStorage, Zustand
stores, caching, progress, users, roles, server actions, or database queries must be checked
against this lifecycle, not just "does it compile":

```
User A logs in -> uses the app -> logs out -> User B logs in (same browser session/tab)
  -> verify User A's data is NOT present for User B
```

`tests/e2e/10-user-isolation.spec.ts` automates exactly this and must be run (or explicitly
reported BLOCKED with a reason) whenever such a change is made. This existed because a session-
state guard added for a legitimate performance reason was not reset on logout - trace the actual
lifecycle in code, don't reason about it abstractly.

## Rule E — Performance claims

Distinguish **structural optimization** (fewer DB queries, `Promise.all` instead of sequential
awaits, a smaller bundle, less hydration, fewer re-renders, caching, better prefetching) from
**measured performance** (an actual LCP/INP/CLS/network-timing number captured from a real page
load). A structural change is a reasonable, explainable improvement - it is not itself proof the
app is faster. State which kind of claim is being made. Only report a measured number that was
actually captured this session (via `tests/e2e/` or equivalent); otherwise say "structural only"
or "not measured."

## Rule F — No security tradeoff for speed

Never, for any performance reason: remove or weaken an authorization check, cache private/
user-specific data globally (across users or across requests in a way that could leak between
them), move a security check entirely to the client, share one user's cached data with another,
trust a client-supplied access/role flag, or weaken session validation. If a performance idea
requires any of these, don't do it - find a different optimization or say it can't be done
safely.

## Rule G — Browser / E2E verification

Playwright is the permanent browser-verification layer for this repo (`playwright.config.ts`,
`tests/e2e/`). This environment ships a pre-installed Chromium the config points to directly
(see `playwright.config.ts`'s comment) because `playwright install`'s own download is blocked by
this sandbox's network policy; outbound network to the public internet (including this app's own
production URL) is also blocked from this sandbox, so only locally-served (`pnpm dev`/`pnpm
start`) E2E runs are actually executable here - production E2E (`pnpm test:e2e:production`) is
configured and ready, but running it depends on whichever environment has that network path.

Authenticated E2E tests require `E2E_TEST_EMAIL`/`E2E_TEST_PASSWORD` (and `_B` variants for the
user-isolation test) as environment variables pointing at dedicated, non-customer test accounts
- see `tests/e2e/README.md`. Never invent or hardcode credentials. Without them, those tests are
skipped and reported as such, not silently treated as passing.

## Workflow

```
UNDERSTAND -> INSPECT -> IMPLEMENT -> UNIT/INTEGRATION TEST -> TYPECHECK -> LINT -> BUILD
  -> E2E BROWSER TEST (affected critical flows) -> SECURITY REGRESSION (Rule D, if applicable)
  -> GIT DIFF REVIEW -> DEPLOY -> PRODUCTION SMOKE TEST (if possible) -> FINAL REPORT
```

Not every task needs every browser test - but every critical flow the change actually touches
must be covered, and anything skipped must be named, not silently omitted.

## Final report format

Use this structure for any report on an implementation task:

```
# FINAL VERIFICATION REPORT

## Status
PASS / PARTIAL / BLOCKED

## Starting HEAD / Ending HEAD

## Implementation

## Automated Tests
- pnpm test: PASS/FAIL
- pnpm typecheck: PASS/FAIL
- pnpm lint: PASS/FAIL
- pnpm build: PASS/FAIL

## Browser QA
- Desktop: PASS/FAIL/BLOCKED
- Mobile emulation: PASS/FAIL/BLOCKED
- Critical flows: PASS/FAIL/BLOCKED

## Security
PASS / FAIL / NOT APPLICABLE

## User Isolation
PASS / FAIL / NOT APPLICABLE

## Performance
Measured / Structural only / BLOCKED

## Production
PASS / FAIL / BLOCKED

## Remaining Risks

## Exact limitations
```

Never write "fast" or "verified" in prose without the corresponding line above backing it up.
