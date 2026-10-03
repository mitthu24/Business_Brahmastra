# Phase 5.2 — Login & Signup Hardening

## 1. Authentication audit

Audited before changing anything (per the brief's Step 1). Everything below already existed from
Phase 4/5 and was reused, not replaced:

| Piece | File |
|---|---|
| Signup page | `src/app/(auth)/signup/page.tsx` |
| Login page | `src/app/(auth)/login/page.tsx` |
| Signup/login/logout/forgot/reset/change-password actions | `src/app/(auth)/actions.ts` |
| Session creation/lookup/cookie | `src/lib/auth/session.ts` |
| Password hashing/verification | `src/lib/auth/password.ts` (bcryptjs, 12 rounds) |
| User/session/reset-token queries | `src/lib/db/auth-queries.ts` |
| Zod validation schemas | `src/lib/auth/validation.ts` |
| Rate limiting | `src/lib/auth/rate-limit.ts` |
| Coarse route protection | `src/proxy.ts` |
| Real authorization boundary | `src/lib/auth/dal.ts` (`requireUserOrRedirect`, `requireUserForApi`, access/founder variants from Phase 5) |
| Trial creation | `src/lib/db/auth-queries.ts#createUser` (Phase 5) |

No second authentication system was introduced. Three concrete gaps were found and fixed (§2-§4);
everything else audited was already correct and is documented as "no change needed" below.

## 2. Signup flow (what changed and why)

Before: `findUserByEmail` check → `createUser` → session → redirect, with **no rate limiting** and
**no handling of the DB unique-constraint error** if two requests raced past the `findUserByEmail`
check at the same time (it would throw an unhandled error instead of showing the generic
duplicate-email message).

After (`src/app/(auth)/actions.ts#signup`):
1. Zod validation (unchanged schema).
2. Rate limit, keyed by normalized email (`signup:<email>`), same `checkRateLimit` utility already
   used for login/forgot-password - **new**.
3. `findUserByEmail` check (unchanged) - a fast-path, not the real guarantee.
4. `createUser` in a `try/catch`; if it fails with a Postgres unique_violation (SQLSTATE `23505`,
   detected via the new `src/lib/db/errors.ts#isUniqueViolation`, which checks both a bare
   `.code` and Drizzle's `DrizzleQueryError.cause.code` wrapping), return the same generic
   `"An account with this email already exists."` message instead of crashing - **new**. Any other
   error still propagates (never silently swallowed).
5. Session cookie + redirect to `/dashboard` (unchanged).

Signup already wrapped user + profile creation in one DB transaction (`db.transaction` in
`createUser`) before this phase - no partial-account failure mode existed, so no additional
transaction was needed (brief's Step 6: "do not introduce unnecessary transactions if the current
architecture already guarantees consistency").

## 3. Login flow (what changed and why)

Before: validate → rate limit (already existed) → find user → verify password → session →
**always** redirect to `/dashboard`, even though `src/proxy.ts` already appends `?next=<path>`
when it sends an unauthenticated visitor to `/login` from a protected route - that parameter was
silently dropped.

After: the login page reads `?next=` via `useSearchParams()` and passes it through as a hidden
form field; `login()` validates it with the new `src/lib/auth/safe-redirect.ts#sanitizeNextPath`
before using it - **never** redirects anywhere that doesn't parse as a same-origin relative path
(rejects `//evil.com`, `/\evil.com`, absolute URLs to other hosts, anything not starting with a
single `/`). An invalid/missing `next` falls back to `/dashboard` exactly as before. This closes a
real (if currently unexploited, since nothing consumed the parameter) open-redirect surface and
fixes the broken UX where a user following a deep link into a protected page, found themselves
redirected to `/login`, then landed on `/dashboard` instead of the page they wanted.

Everything else in login (email normalization via the shared `emailSchema`, generic
"Incorrect email or password." for both a nonexistent account and a wrong password, rate limiting)
was already correct - no change needed.

## 4. Session architecture

No changes. Re-verified: `SESSION_COOKIE` is `httpOnly: true`, `secure: process.env.NODE_ENV ===
"production"`, `sameSite: "lax"`, `path: "/"`, 30-day expiry (`src/lib/auth/session.ts`). The
session token is never written to `localStorage` or exposed to client JS. `getCurrentUser` always
re-validates the token hash against the `sessions` table on every call - there is no
client-trusted identity anywhere. Logout (`clearSessionCookie`) deletes the session row server-side
and clears the cookie.

## 5. Trial creation

Unchanged from Phase 5 - `createUser` sets `trialStartedAt`/`trialEndsAt` from the server clock at
insert time only. Audited login/logout/refresh: none of them touch these columns, so a trial is
never restarted by anything other than a fresh signup (there is exactly one `UPDATE`/`INSERT` site
that can set them - `createUser`).

## 6. Error handling

- Duplicate email now reads "An account with this email already exists." (previously "Could not
  create an account with those details.") - clearer per the brief's example, while remaining
  generic enough not to leak anything beyond "this address is taken."
- Invalid login remains "Incorrect email or password." for both a nonexistent account and a wrong
  password - unchanged, already correct.
- No SQL errors, stack traces, or DB details are ever returned to the client - the signup race
  handler is the one place a raw DB error could have leaked, and it's now caught and translated.
- Forms are client components using `useActionState`; a failed submission does not unmount the
  form, so field values are retained automatically (password fields are cleared by normal browser
  behavior - no code needed either way).

## 7. Security checks

- **IDOR**: unaffected by this phase - the existing per-`userId`-scoped queries from Phase 4/5
  remain untouched.
- **Founder separation**: not modified. `/founder/login` remains a separate action
  (`src/app/founder/actions.ts#founderLogin`) from `/login`; founder authorization remains a
  server-side DB role check, never client state. Verified by re-reading the code - nothing here
  changed.
- **Open redirect**: closed (see §3).
- **Race-condition account duplication**: closed (see §2) - verified with a real concurrent-insert
  test against the DB (see §11).
- **Password never logged/stored in plaintext**: verified - `createUser` only ever receives an
  already-bcrypt-hashed string; added a test asserting the stored value matches bcrypt's `$2a/b/y$`
  format and is not the plaintext.

## 8. Database constraints

Audited `users`, `sessions`, `user_profiles`, trial fields, role field - no schema changes made
this phase (brief's Step 17 explicitly says not to redesign unless absolutely necessary; nothing
found required it):

- `users.email` - `NOT NULL` + `UNIQUE` index (`users_email_unique`) - confirmed still enforces
  uniqueness at the DB level, independent of and backstopping the application-level check.
- `users.password_hash` - `NOT NULL`, no plaintext column exists anywhere.
- `sessions.token_hash` - `NOT NULL` + `UNIQUE`, `sessions.user_id` indexed and FK'd with
  `ON DELETE CASCADE`.
- `user_profiles.user_id` - `NOT NULL` + `UNIQUE` index, FK'd to `users`.
- Trial/role fields (`role`, `trial_started_at`, `trial_ends_at`, `access_activated_at`,
  `suspended_at`) - unchanged from Phase 5, all still correctly typed/defaulted/indexed.

## 9. Rate limiting status

Already existed (`src/lib/auth/rate-limit.ts`, in-memory, 10 attempts / 10 minutes per key,
documented limitation: per-process on serverless, so not a hard cross-instance guarantee - this
was already the case and is unchanged). It was applied to `login` and `forgotPassword` but **not**
`signup` - now also applied to `signup`, keyed by normalized email rather than IP, so repeated
signup attempts against one address are limited regardless of source IP. No new dependency, no
external service - reuses the existing utility exactly as instructed.

## 10. Mobile/accessibility checks

Not independently verified in a real browser (no browser access in this environment - same
limitation as every prior phase). Code-level accessibility improvements made to the login and
signup forms: every input with a validation error now has `aria-invalid` and `aria-describedby`
pointing at its error message's `id`, and the top-level form error now also carries
`aria-live="polite"` so a screen reader announces it without requiring focus to move. Existing
`autoComplete` values (`email`, `new-password`, `current-password`, `name`) were already correct
and unchanged. No layout/CSS changes were made, so no new mobile-breakpoint risk was introduced.

## 11. Automated tests

Added (all passing, see final report for totals):

- `src/lib/auth/validation.test.ts` - email normalization (`User@Email.com` → `user@email.com`),
  signup schema accepts valid input and rejects empty name / weak password / mismatched
  confirmation, login schema's looser password rule.
- `src/lib/auth/safe-redirect.test.ts` - accepts a plain relative path, preserves query strings,
  rejects `//host`, `/\host`, absolute URLs, non-`/`-prefixed values, null/undefined/empty, and a
  non-string `FormData` value (e.g. a `File`).
- `src/lib/db/errors.test.ts` - `isUniqueViolation` detects a bare `.code` and a `.cause.code`,
  returns false for unrelated codes and plain errors.
- `src/lib/db/auth-queries.test.ts` additions - the unique-violation shape `isUniqueViolation`
  actually detects is produced by a real duplicate insert against the DB; two concurrent
  `createUser` calls for the same email resolve to exactly one fulfilled and one rejected promise
  (no duplicate row); a created user's `passwordHash` is never the plaintext and matches bcrypt's
  format.

Existing Phase 4/5 tests (signup/login/session/trial/founder/progress/migration) re-run unchanged
and still pass.

## 12. Production deployment

See final report for the exact deployment ID, commit SHA, and control-plane verification. Deployed
only because real code changed; no speculative redeploy.

## 13. Manual browser verification checklist

(Same production URL as before: `https://90-day-business-school.vercel.app`)

1. **Signup**: `/signup` with a brand-new email → lands on `/dashboard`, trial banner shows ~3 days.
2. **Duplicate signup**: sign up again with the *same* email → "An account with this email already
   exists." shown, no crash, no second account created.
3. **Invalid login**: `/login` with a wrong password, then with a nonexistent email → both show
   "Incorrect email or password.", not two different messages.
4. **Session persistence**: after logging in, refresh `/dashboard` → still authenticated. Logout →
   `/login` → login again → `/dashboard` again, same progress.
5. **Return-URL redirect**: while logged out, visit a protected URL directly (e.g.
   `/learn/day/3`) → redirected to `/login?next=/learn/day/3` → log in → should land on
   `/learn/day/3`, not `/dashboard`.
6. **Open-redirect check**: manually try `/login?next=https://example.com` (or `//example.com`) in
   the address bar, then log in → must land on `/dashboard` (the invalid `next` is rejected), never
   redirect off-site.
7. **Founder separation unaffected**: `/founder/login` still works independently; a regular user
   still cannot reach `/founder/dashboard` directly (re-verify briefly - this phase did not touch
   that code path, but worth confirming nothing regressed).
8. **Double-submit**: click "Create account" / "Log in" rapidly twice → button disables immediately
   (`disabled={pending}`), no duplicate accounts/sessions created.
9. **Mobile** (320/375/390/430px): `/login` and `/signup` - no horizontal overflow, error messages
   wrap and remain attached to their field, keyboard navigation reaches every field and the submit
   button in order.

## 14. Known limitations

- Rate limiting remains in-memory/per-process, as documented since Phase 4 - a determined attacker
  distributing requests across many serverless instances could exceed the intended 10-per-10-minute
  limit. Upgrading this would mean an external store (e.g. Upstash), which the brief explicitly says
  not to add this phase.
- No browser/device testing was performed in this environment - §13's checklist is unexecuted here.
- Back-button/bfcache behavior after logout was not specifically hardened (no `Cache-Control`
  headers added to protected pages) - a logged-out user's browser may briefly show a cached
  rendering of a protected page from bfcache, but any interactive action or navigation on it
  triggers a fresh server round-trip that correctly re-checks the session and redirects. This is
  standard behavior across most SSR'd Next.js apps, not a regression introduced here, and wasn't
  called out as broken by any test - noting it rather than engineering a speculative fix.
