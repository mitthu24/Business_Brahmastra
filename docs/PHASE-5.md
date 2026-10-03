# Phase 5 — Authenticated Learning Experience, 3-Day Trial & Founder Access

## 1. Scope

Phase 5 adds, on top of Phase 4's accounts/sessions/cloud-progress foundation:

- An automatic, server-timestamped 3-day trial for every new regular user.
- A canonical, derived (never stored) access-status model: `ACTIVE | TRIAL | EXPIRED | SUSPENDED`.
- Server-side enforcement of that status on every protected learning action, independent of what
  the client has cached or previously loaded.
- A completely separate founder authentication path (`/founder/login`), backed by a `role` column
  on the existing `users` table rather than a second auth system.
- A founder dashboard and user-management area (`/founder/dashboard`, `/founder/users`) with
  activate/suspend/reactivate actions.
- Moving the reference/tool pages (roadmap, glossary, formulas, calculators, case studies,
  simulator) out from behind login, since they don't need an account.
- Trial-aware UI: a trial banner on the dashboard, access status on `/account`, and an
  "access expired" state for gated content instead of a dead end.

Explicitly out of scope (per the brief): payments/subscriptions, AI features, a CMS, email
delivery, any new infrastructure beyond what Phase 4 already stood up.

## 2. Existing architecture reused (not duplicated)

- **Sessions**: the same `sessions` table, `SESSION_COOKIE`, `createSessionCookie`/
  `clearSessionCookie`/`getCurrentUser` from Phase 4 are used for founders too - a founder is just
  a `users` row with `role = "founder"`. There is only one session mechanism in the app.
- **Password hashing**: `src/lib/auth/password.ts` (bcryptjs) - unchanged, reused by founder login.
- **Progress/XP/streak/achievements**: entirely untouched. `getProgressSnapshot` and the
  `*Tx` functions in `src/lib/db/progress-queries.ts` remain the single source of truth; Phase 5
  only adds an access check *before* calling them from the write API routes.
- **localStorage → cloud migration**: `src/lib/db/migration-queries.ts` and
  `ProgressBootstrap`/`/api/migrate` are unchanged.
- **DAL pattern**: Phase 4's `requireUserOrRedirect`/`requireUserForApi` pattern in
  `src/lib/auth/dal.ts` is extended with access- and founder-aware counterparts, not replaced.

## 3. Authentication changes

No new authentication mechanism. `src/app/(auth)/actions.ts#login`/`signup` are unchanged in
shape; `signup` now also seeds the trial window via `createUser`. Password change
(`changePassword`) now additionally revokes every existing session for that user and issues a
fresh one for the current browser, so a leaked session token elsewhere stops working the moment
the password changes.

## 4. 3-day trial implementation

At signup (`src/lib/db/auth-queries.ts#createUser`):

```ts
const trialStartedAt = new Date();                                  // server clock
const trialEndsAt = new Date(trialStartedAt.getTime() + TRIAL_DURATION_MS); // + exactly 3 days
```

Both are also column defaults (`now()` / `now() + interval '3 days'`) as a second line of defense,
but the application always sets them explicitly at insert time. Nothing about the trial window
ever comes from the browser clock, `localStorage`, or a request body.

## 5. Access-state model

`src/lib/access/status.ts` is the single, pure, server-only function every access decision in the
app calls through:

```ts
function computeAccessStatus(user): AccessStatus {
  if (user.role === "founder") return "ACTIVE";
  if (user.suspendedAt) return "SUSPENDED";
  if (user.accessActivatedAt) return "ACTIVE";
  if (now < user.trialEndsAt) return "TRIAL";
  return "EXPIRED";
}
```

This matches the brief's pseudocode exactly, plus a founder short-circuit. It is **derived on every
call**, never cached in a column - there is no `accessStatus` field to go stale. `getAccessInfo`
wraps it with `daysRemaining`/`msRemaining` for display.

`hasProtectedAccess(status)` is `true` for `ACTIVE`/`TRIAL`, `false` for `EXPIRED`/`SUSPENDED`, and
is the single predicate every gate (lesson page, write API routes) calls.

## 6. Founder authorization

- `users.role` is a Postgres enum (`user_role`: `"user" | "founder"`), defaulting to `"user"`.
- `founderLogin` (`src/app/founder/actions.ts`) verifies the password exactly like regular login,
  then additionally requires `role === "founder"`, rejecting with the *same generic error* used
  for a wrong password - a bad guess can't distinguish "wrong password" from "not a founder" from
  "no such account".
- `requireFounderOrRedirect`/`requireFounderForApi` (`src/lib/auth/dal.ts`) re-read the user's role
  from the database on every single call. Nothing about founder status is ever trusted from a
  cookie value, header, client state, or Zustand store.
- `src/proxy.ts` only does the same cheap, optimistic cookie-presence check it always did (now
  also covering `/founder/*`); the actual authorization boundary is
  `src/app/founder/(protected)/layout.tsx` calling `requireFounderOrRedirect()` server-side on
  every request to every founder page. A non-founder hitting `/founder/dashboard` directly is
  redirected to their own `/dashboard`, not shown any founder UI first.
- Founder server actions (`activateUserAction`, `suspendUserAction`, `reactivateUserAction`) each
  independently call `requireFounderForApi()` - they do not rely on the page that renders their
  buttons having already checked.
- **Bootstrapping the first founder account**: there is no public founder signup (by design -
  "founder credentials must never be exposed to the client"). An operator with `DATABASE_URL`
  access runs:
  ```bash
  DATABASE_URL=<connection string> FOUNDER_PASSWORD='<password>' \
    npx tsx scripts/create-founder.ts founder@example.com "Founder Name"
  ```
  (or `pnpm create-founder ...`). The password is read only from an environment variable (never
  argv, never hardcoded, never logged). Running it again on an existing regular-user email
  promotes that account to founder instead of creating a duplicate.

## 7. Founder dashboard

`/founder/dashboard` shows total learners, active trials, expired trials, active (standing) access,
suspended users, and the 10 most recent signups with their derived status - all computed by
`src/lib/db/founder-queries.ts#getFounderDashboardStats`, which reuses `listUsersForFounder` (no
duplicate query logic) and excludes founder accounts from the learner counts.

## 8. User management

`/founder/users` lists every account (`UsersTable.tsx`) with name, email, derived status, lessons
completed, trial end date, signup date, and Activate/Suspend/Reactivate buttons that call the
server actions above. The table scrolls horizontally on narrow viewports (`overflow-x-auto`) rather
than collapsing columns, so it stays usable on mobile without a separate mobile-only layout.

## 9. Progress architecture

Unchanged from Phase 4 - still derived entirely from `lesson_completions`, `exercise_completions`,
`quiz_attempts`, `achievements`, `user_streaks`, read through `getProgressSnapshot`. Phase 5 adds no
second progress system; `currentDay`/`completedDays`/XP/streak are still computed, never stored
redundantly. The dashboard now additionally receives the user's real name and `AccessInfo` as
server-fetched props (`verifyAccess()` + `getUserProfile`), layered on top of the existing
Zustand-backed client progress store - it does not replace it.

## 10. Security / IDOR checks

- Every write API route (`/api/progress` POST, `/api/journal` POST, `/api/canvas` PUT,
  `/api/final-project` PUT) now calls `requireActiveAccessForApi()` instead of only
  `requireUserForApi()`: it 401s if unauthenticated, 403s (`{ accessStatus }`) if authenticated but
  `EXPIRED`/`SUSPENDED`. GET routes (reading one's own data) remain on plain authentication, so an
  expired user never loses visibility into their own progress/journal/canvas/final project.
- All of these continue to scope every query to the session's `userId` server-side - never a
  client-supplied id - exactly as Phase 4 established (`deleteJournalEntryRow`, etc.).
- Founder mutation actions check `role === "founder"` server-side on every call; there is no code
  path where a regular user's request can reach `activateUserAccess`/`suspendUser`/`reactivateUser`.
- Password change now revokes all other sessions (see §3).
- Session cookie remains `HttpOnly`, `Secure` in production, `SameSite=Lax` (unchanged from Phase 4,
  re-verified, not re-implemented).

## 11. Database changes

One additive, non-destructive migration (`drizzle/0001_simple_korvac.sql`) adds to `users`:

| Column | Type | Notes |
|---|---|---|
| `role` | enum `user_role` (`user`\|`founder`) | default `'user'`, indexed |
| `trial_started_at` | timestamptz | default `now()` |
| `trial_ends_at` | timestamptz | default `now() + interval '3 days'` |
| `access_activated_at` | timestamptz, nullable | presence ⇒ ACTIVE |
| `suspended_at` | timestamptz, nullable | presence ⇒ SUSPENDED |

No columns were dropped, no existing table was altered destructively, and no existing rows were
deleted. The same migration includes one data backfill, scoped by `WHERE access_activated_at IS
NULL` so it only ever touches rows that already existed before this migration ran (any row this
same migration just added the column to): it sets `access_activated_at = created_at` for them, so
every pre-Phase-5 account is grandfathered as `ACTIVE` rather than suddenly looking like a
3-day-old trial about to expire. New signups after this migration get `access_activated_at = NULL`
and correctly land in `TRIAL`.

Run via the same Railway-internal migration job pattern established in Phase 4B (the sandbox
cannot reach the Postgres port directly): `npx drizzle-kit migrate` against `DATABASE_URL`.

## 12. Tests

Added (all passing, see §15):

- `src/lib/access/status.test.ts` - pure unit tests of `computeAccessStatus`/`getAccessInfo`/
  `hasProtectedAccess`: TRIAL while unexpired, EXPIRED at and after the boundary, SUSPENDED always
  wins, ACTIVE via `accessActivatedAt` even past trial end, founders always ACTIVE.
- `src/lib/db/trial-and-founder.test.ts` (real-Postgres PGlite harness, same as all Phase 4 DB
  tests) - signup sets a server-generated exact 3-day window; new users default to `TRIAL`;
  `activateUserAccess`/`suspendUser`/`reactivateUser` each produce the correct derived status;
  `listUsersForFounder`/`getFounderDashboardStats` report correct per-user and aggregate numbers.

Existing Phase 4 tests (auth, sessions, progress idempotency, localStorage migration conflict
rules) were re-run unmodified and still pass - nothing about their behavior changed.

Not added: request-level tests of `proxy.ts`/`dal.ts`'s redirect behavior or of the founder Server
Actions end-to-end, since (consistent with how Phase 4 was tested) that would require mocking
Next.js's request/cookie plumbing rather than exercising real database logic; the query-layer and
pure-function tests above cover the actual access-control logic those layers call into.

## 13. Production verification

The sandbox this was built in cannot reach `*.vercel.app` (egress policy), so this phase's
production verification is split:

**Verified via the Vercel control-plane API** (not the sandbox reaching the site):
- Latest deployment state, target, and git commit (see final report for exact values).
- Production alias assignment.
- `DATABASE_URL` present on Production (existence only - value never read).

**Not verified here, needs a real browser** (manual checklist):
1. Visit `/roadmap`, `/glossary`, `/calculators`, `/case-studies`, `/formulas`, `/simulator` while
   logged out - confirm no redirect to `/login`.
2. Sign up a new test account - confirm immediate access to `/dashboard`, trial banner shows
   "3 days remaining" (or similar).
3. Visit `/account` - confirm trial end date/time shown.
4. Visit `/founder/login` while logged out - confirm the regular `/login` page is NOT shown.
5. As a regular user, try `/founder/dashboard` directly - confirm redirect to `/dashboard`, not an
   error page or founder content.
6. Bootstrap a founder (`pnpm create-founder ...` against production `DATABASE_URL`), log in at
   `/founder/login`, confirm `/founder/dashboard` and `/founder/users` load with real data.
7. From `/founder/users`, suspend the test account from step 2; log back in as that user, confirm
   `/learn/day/1` shows the suspended notice instead of lesson content, and `/dashboard`,
   `/journal`, `/progress` still show their existing data.
8. Reactivate, confirm lesson access returns.
9. Mobile width (375px): confirm the founder users table scrolls horizontally rather than
   overflowing the page, and the trial banner wraps instead of clipping.

## 14. Known limitations

- Mobile/accessibility were implemented using the same responsive/semantic patterns already in the
  Phase 4 codebase (Tailwind utility classes, `aria-label`/`role` attributes, horizontal-scroll
  tables), but were **not** independently verified in a real browser at the specific breakpoints
  listed in the brief (320–1440px) - no browser automation is available in this environment.
- Production functional verification (step 2 onward in §13's checklist) was not performed for the
  same reason - only Vercel's control-plane state was checked.
- There is no UI yet for a founder to change their own password or manage other founders - only
  the bootstrap script.
- `role` has exactly two values (`user`, `founder`); no intermediate "admin"/"staff" tier exists,
  matching the brief's explicit two-tier access model.
- `/startup-validator` remains behind regular-user login (unchanged from Phase 4) - the brief's
  public-pages list didn't mention it either way, so it was left as-is.

## 15. Future work

- Payments/subscriptions to convert `ACTIVE` from a founder-granted state into a billed one.
- Founder-facing content management (explicitly deferred per the brief).
- Email delivery for trial-ending reminders (password reset email delivery is also still not
  configured, per Phase 4B).
- A real browser/device pass against the checklist in §13.
