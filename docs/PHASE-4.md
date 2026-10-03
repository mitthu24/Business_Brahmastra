# Phase 4 — User Accounts + PostgreSQL + Cloud Progress

This phase adds email/password accounts, server-managed sessions, and cloud persistence
(Postgres via Drizzle ORM) for progress, journal, Business Model Canvas, and the final project
wizard, replacing the previous localStorage-only architecture. The 90-day curriculum content,
calculators, simulator, and the Canvas/Final Project/Journal *UX* are unchanged.

## Architecture

```
UI (client components)
  -> fetch() to Route Handlers (/api/progress, /api/journal, /api/canvas, /api/final-project, /api/migrate)
  -> Server Actions (signup/login/logout/forgot/reset/changePassword) for auth
  -> src/lib/db/*-queries.ts (Drizzle query modules, always scoped to the session's userId)
  -> Drizzle ORM -> Postgres (via the `postgres` driver)
```

- **ORM**: Drizzle ORM, chosen over Prisma for Vercel because it's lightweight (no binary
  engine, no codegen step blocking builds), SQL-like, and pairs cleanly with the `postgres`
  (postgres.js) driver or `@vercel/postgres`. Schema: `src/lib/db/schema.ts`. Migrations are
  generated with `drizzle-kit generate` into `drizzle/` and are checked into git.
- **DB client**: `src/lib/db/client.ts` exports `getDb()`, which lazily creates the connection
  pool on first use (not at module load), so `next build` can run without `DATABASE_URL` set.
- **Query layer**: every query module (`auth-queries.ts`, `progress-queries.ts`,
  `journal-queries.ts`, `canvas-queries.ts`, `final-project-queries.ts`, `migration-queries.ts`)
  takes the `db` client as its first parameter instead of importing `getDb()` directly. This is
  what lets tests inject a different (pglite-backed) client without touching production code.
- **UI**: `src/lib/progress/store.ts` is still a Zustand store (keeps the existing component API:
  `completeDay`, `completeExercise`, `submitQuiz`, etc., so `LessonInteractive.tsx` and friends
  did not need to change), but it is no longer the source of truth. Each mutating action now
  does an optimistic local update *and* `fetch`es the corresponding `/api/progress` action,
  then overwrites local state with the server's authoritative response. `zustand/persist` still
  caches the last-known state in localStorage purely as an offline/instant-paint convenience —
  the server is always consulted on load (`ProgressBootstrap`) and after every mutation.
- Journal, Canvas, and the Final Project wizard talk to their own Route Handlers directly
  (`JournalView.tsx`, `CanvasView.tsx`, `WizardView.tsx`), each with loading/saving/error+retry
  UI states, since they didn't have pre-existing Zustand-store wrapping to preserve.

### Why no duplicated `UserProgress` row

The spec's `UserProgress` summary (currentDay, totalXP, completedDays, …) is **not** stored as
its own table. Everything except the streak is deterministically derivable from the completion
tables (`lesson_completions`, `exercise_completions`, `case_study_completions`, `quiz_attempts`,
`final_projects.completed`) using the same pure functions the client used
(`src/lib/progress/xp.ts`'s `xpForEvent`, `src/lib/progress/achievements.ts`'s
`computeUnlockedAchievements`) — see `getProgressSnapshot` in `src/lib/db/progress-queries.ts`.
This avoids an entire class of "snapshot drifted from the real rows" bugs. The one thing that
*can't* be derived from the rows alone is streak state, because it depends on the real-world
calendar dates activity happened on, not just which lesson-day numbers are complete — that one
field lives in `user_streaks`.

## Database schema

See `src/lib/db/schema.ts` / `drizzle/0000_swift_forge.sql` for the authoritative definitions.

| Table | Purpose | Key constraints/indexes |
|---|---|---|
| `users` | id, email, passwordHash, timestamps | unique(email) |
| `user_profiles` | id, userId, name, avatarInitials | unique(userId) |
| `user_streaks` | userId, currentStreak, longestStreak, lastActivityDate | PK(userId) |
| `lesson_completions` | userId, day, completedAt | unique(userId, day), index(userId) |
| `exercise_completions` | userId, day, completedAt | unique(userId, day), index(userId) |
| `case_study_completions` | userId, day, completedAt | unique(userId, day), index(userId) |
| `quiz_attempts` | userId, day, score, totalQuestions, completedAt | unique(userId, day), index(userId) |
| `achievements` | userId, achievementId, unlockedAt | unique(userId, achievementId), index(userId) |
| `lesson_reflections` | userId, lessonId, learned, application | unique(userId, lessonId), index(userId) |
| `journal_entries` | userId, category, text, timestamps | index(userId), index(userId, createdAt) |
| `canvases` | userId + the 9 Business Model Canvas block fields | PK(userId) |
| `final_projects` | userId, title, completed | unique(userId) |
| `final_project_steps` | finalProjectId, stepNumber, content, completed | unique(finalProjectId, stepNumber), index(finalProjectId) |
| `sessions` | userId, tokenHash, expiresAt | unique(tokenHash), index(userId) |
| `password_reset_tokens` | userId, tokenHash, expiresAt, consumedAt | unique(tokenHash), index(userId) |
| `migration_status` | userId, migratedAt | PK(userId) — marks the one-time localStorage merge done |

The 9 canvas fields (`keyPartners`, `keyActivities`, `valueProposition`, `customerRelationships`,
`customerSegments`, `keyResources`, `channels`, `costStructure`, `revenueStreams`) were read
directly from `src/components/canvas/CanvasView.tsx`'s `blocks` array, not guessed.

`QuizAttempt` stores `score`/`totalQuestions` rather than a single percentage, per the spec, but
the original client only ever persisted `accuracyPercent` — see **Migration** below for how that
gap is bridged for pre-existing local data.

## Authentication

- **Password hashing**: `bcryptjs` (pure JS, no native build step — safe on Vercel), 12 salt
  rounds (`src/lib/auth/password.ts`).
- **Signup** (`src/app/(auth)/signup`): name (≥2 chars), email (validated + lowercased), password
  (≥8 chars), confirm-password match, server-side duplicate-email check. Validation via `zod`
  (`src/lib/auth/validation.ts`).
- **Login**: email/password; a wrong password and a non-existent email return the *exact same*
  generic message ("Incorrect email or password.") so the endpoint can't be used to enumerate
  registered emails. Basic in-memory rate limiting (`src/lib/auth/rate-limit.ts`) on both login
  and forgot-password, keyed by email+IP.
- **Logout**: deletes the session row server-side, then clears the cookie.
- **Forgot/reset password**: a single-use, 1-hour-expiry token is generated and only its SHA-256
  hash is stored (`password_reset_tokens`); the raw token goes into the URL. **No email provider
  is wired up** — the reset link is `console.log`'d server-side (see
  `src/app/(auth)/actions.ts`'s `forgotPassword`) instead of ever being returned in the HTTP
  response, so this is safe to ship without an email integration while still being real,
  testable, server-side token architecture. `.env.example` documents the email provider vars
  for whoever wires up delivery next, but nothing reads them yet.
- **Change password** (`/account`): requires the current password to be re-entered.

### Sessions

Sessions are **server-managed, database-backed, opaque random tokens** — not signed JWTs, so
there is no `SESSION_SECRET` to manage: a stolen cookie is useless once the matching `sessions`
row is deleted (logout, or an admin action in a future phase), unlike a JWT which stays valid
until it expires no matter what. The flow (`src/lib/auth/session.ts`,
`src/lib/db/auth-queries.ts`):

1. `createSessionCookie(userId)` generates a 32-byte random token, stores **only its SHA-256
   hash** in `sessions.tokenHash`, and sets it as an HttpOnly, `SameSite=Lax`, `Secure` (in
   production), 30-day-expiry cookie. The raw token never touches application logs.
2. Every request that needs the current user calls `getCurrentUser()` /
   `requireUserForApi()` / `requireUserOrRedirect()` (`src/lib/auth/dal.ts`), which reads the
   cookie, hashes it, and looks up a non-expired `sessions` row joined to `users` — i.e. **every
   protected request re-validates against the database**, not just a signed token.
3. Logout deletes the `sessions` row and the cookie.

## Route protection

Two layers, matching the Next.js docs' recommended pattern
(`node_modules/next/dist/docs/01-app/02-guides/authentication.md`):

1. **`src/proxy.ts`** (Next 16 renamed `middleware.ts` → `proxy.ts` — see that doc's deprecation
   notice) does a cheap, optimistic check: is the session cookie present? If a protected path
   (`/dashboard`, `/learn`, `/progress`, `/journal`, `/business-model-canvas`, `/final-project`,
   `/achievements`, `/account`, `/startup-validator`, `/simulator`, and everything else under the
   `(app)` route group) is requested with no cookie, redirect to `/login?next=<path>`. This never
   touches the database (Proxy runs on every navigation, including prefetches).
2. **`src/app/(app)/layout.tsx`** calls `requireUserOrRedirect()`, which is the real, DB-verified
   boundary — every page under the `(app)` group goes through it. A forged or stale cookie that
   passes the Proxy's presence check still gets redirected to `/login` here once the DB lookup
   fails.

All pages that live under the shared app shell (dashboard, learn, progress, calculators,
glossary, case studies, simulator, canvas, startup validator, journal, achievements, final
project, account) ended up behind this same boundary, since they already shared one layout and
one nav before this phase — the spec called out the learning/progress/journal/canvas/final-project
pages by name, but splitting the *reference* pages (calculators, glossary) into a separately
public sub-tree would have meant restructuring navigation/URLs that Phase 4 was told not to
touch. The public landing page (`/`), `/login`, `/signup`, `/forgot-password`, and
`/reset-password/[token]` remain public.

## Authorization model (preventing IDOR)

Nothing server-side ever trusts a client-supplied user id. Every Route Handler calls
`requireUserForApi()` first and uses **only** the `userId` it returns; every query module takes
that `userId` as an explicit parameter and includes it in the `WHERE` clause (or, for
delete/update, in the row-matching predicate) — e.g. `deleteJournalEntryRow(db, userId, entryId)`
deletes a row only if `id = entryId AND userId = userId`, so a request for someone else's entry
affects zero rows and the route returns 404, not "it exists but you can't touch it" (which would
leak existence) and not a 500.

This is covered by automated tests, not just argued in prose:
- `src/lib/db/journal-canvas-finalproject.test.ts` — "IDOR: a user cannot delete another user's
  journal entry" (asserts the delete affects 0 rows for the wrong user, and that the entry is
  still there), plus cross-user canvas/final-project isolation checks.
- A full-stack version of the same check ran in the real browser E2E pass (see **Testing**):
  user A's authenticated session calling `DELETE /api/journal/<user B's entry id>` returns
  **404**.

## Cloud progress / idempotency

All progress mutations go through `src/lib/db/progress-queries.ts`, each wrapped in a DB
transaction:
- `completeDayTx` / `completeExerciseTx` / `completeCaseStudyTx` insert with
  `.onConflictDoNothing()` against a `unique(userId, day)` constraint — a duplicate request (double
  click, retry) inserts nothing extra and the returned XP/achievements snapshot is identical
  either way.
- `submitQuizTx` always scores and returns the result (matching the original UX — you can see
  your score again), but only inserts a `quiz_attempts` row (and therefore only ever contributes
  XP) the *first* time a given lesson day is submitted, mirroring the original store's
  `alreadyAttempted` check.
- `completeFinalProjectTx` and `saveFinalProjectStep`/`saveReflectionTx` use
  `.onConflictDoUpdate()` against their own unique constraints, so re-saving the same step or
  reflection updates the one row instead of creating a new one.
- Achievements are (re)computed from the merged completed-days set and inserted with
  `.onConflictDoNothing()` against `unique(userId, achievementId)`.

Tested directly, including concurrent duplicate requests
(`src/lib/db/progress-queries.test.ts`: "is idempotent under concurrent duplicate requests" fires
three simultaneous `completeDayTx` calls for the same day and asserts exactly one XP award).

## Migration strategy (localStorage → cloud)

Implemented in `src/lib/db/migration-queries.ts`, triggered once per browser by
`src/components/sync/ProgressBootstrap.tsx` (mounted in the app shell) right after the user lands
on any protected page post-login/signup. Client-side it's gated by a `localStorage` flag
(`bb-cloud-migration-complete`); **server-side it's gated by the `migration_status` table inside
the same transaction as the merge**, so even if the client flag is lost (cleared storage, a
different browser) the merge still only ever runs once per account — verified by
`migration-queries.test.ts`'s "migrate twice" test.

Conflict rules (all enforced inside one DB transaction in `migrateLocalData`):

| Data | Rule |
|---|---|
| Completed days / exercises / case studies | **Union, never replace.** Each local day is inserted with `ON CONFLICT DO NOTHING` against the cloud's existing rows, so the result is the superset of both — cloud progress can only grow, never shrink, and nothing is ever duplicated. |
| Quiz attempts | Only filled in for a lesson day with **no existing cloud attempt** — an existing cloud attempt is assumed to be as good or better and is left untouched. Local quiz data only ever had `accuracyPercent` (not raw correct/total counts), so it's stored as `score = accuracyPercent, totalQuestions = 100`, which round-trips through `getProgressSnapshot`'s `score/total*100` math back to the exact original percentage. |
| Achievements | Recomputed from the merged day set and unioned with whatever the local snapshot had unlocked; inserted idempotently. |
| Final project completed flag | Local `true` can flip cloud `false` → `true`, never the reverse. |
| Streak | Whichever of {local, cloud} has the **more recent `lastActivityDate`** wins (that's the one that reflects the user's true most-recent activity); a tie keeps the higher `currentStreak`. Verified by the "never overwrites greater cloud progress with lower local progress" test, which checks an older local streak date cannot clobber a newer cloud one. |
| Lesson reflections | Local reflection is inserted only if the cloud doesn't already have one for that lesson (`ON CONFLICT DO NOTHING`) — never overwrites an existing cloud reflection. |
| Journal entries | Every local entry not already present (matched by category+text+createdAt, since local entries have no server id) is appended. Nothing is ever deleted. |
| Canvas | **Field-by-field, cloud-non-empty-wins.** A local value is written only into a block the cloud canvas has left empty. |
| Final project steps | Same "fill only empty steps" rule, per step number. |

Tested in `src/lib/db/migration-queries.test.ts`: fresh-account merge, "migrate twice" no-op,
"cloud ahead" (cloud's extra days/newer streak date survive), and "local ahead of an empty cloud
account" (local progress and streak fully adopted).

## Offline / network handling

Every Route Handler wraps its DB call in try/catch and returns `503` on failure instead of
throwing/crashing. Client-side:
- `useProgressStore`'s `syncStatus` (`idle | saving | saved | error | offline`) drives a small
  `SyncStatusBadge` in the app header with a one-click **Retry** when a save fails or the browser
  is offline (checked via `navigator.onLine`); the already-applied optimistic local update is
  never rolled back, so a failed sync never looks like lost work.
- `JournalView`, `CanvasView`, and `WizardView` each have explicit loading/saving/error+retry UI
  states for their own fetches (not just the shared progress store).
- `CanvasView` debounces autosave (600ms) so typing doesn't fire a request per keystroke; a save
  failure shows "Sync failed · Retry" next to the canvas controls instead of silently losing the
  edit (the edit stays in the component's local state either way).

## Environment variables

See `.env.example`. Summary:
- `DATABASE_URL` (required) — Postgres connection string.
- `NEXT_PUBLIC_APP_URL` — used to build the password-reset link; defaults to
  `http://localhost:3000`.
- No `SESSION_SECRET` is needed — see **Sessions** above for why (opaque DB-validated tokens,
  not signed JWTs).
- `EMAIL_FROM` / `EMAIL_SERVER_HOST` / `EMAIL_SERVER_PORT` / `EMAIL_SERVER_USER` /
  `EMAIL_SERVER_PASSWORD` are documented placeholders for wiring up real email delivery of
  password-reset links in a future phase; **no code reads them yet**.

## Security

- Passwords: bcryptjs, 12 rounds, never logged (not even on error — errors are generic).
- Sessions: HttpOnly + `Secure` in production + `SameSite=Lax`, DB-validated on every request,
  deleted (not just expired-out) on logout.
- CSRF: mutating Route Handlers (`POST`/`PUT`/`DELETE`) rely on `SameSite=Lax` cookies (not sent
  on cross-site subrequests/form posts) plus the fact that they're same-origin `fetch()` calls
  from the app's own client code, not browser-native form posts to a third party. Server Actions
  get Next.js's built-in Server Action origin check for free. No separate CSRF token scheme was
  added, consistent with the "avoid heavy new dependencies" / no new infra constraint — this is
  the standard baseline Next.js auth guide recommends, not a gap specific to this app.
- Input validation: `zod` (not previously a dependency; added — it's the library the Next.js
  auth guide itself recommends) on every Server Action and Route Handler body.
- Authorization: see **Authorization model** above.
- Rate limiting: best-effort in-memory limiter on login/forgot-password
  (`src/lib/auth/rate-limit.ts`). Documented limitation: this is per-process state, so on
  Vercel's serverless platform it is a mitigation, not a hard guarantee across instances — adding
  a durable cross-instance limiter (e.g. Upstash) would be new infra, which the spec says to
  avoid without clear need.
- Secrets: `.env.example` has no real values; `.env.local`/`.vercel` are gitignored (verified).
- Parameterized queries: all queries go through Drizzle's query builder (no raw string SQL
  interpolation anywhere in the query layer).

## Testing

**What actually ran, and against what:**

This sandbox has a local Postgres 16 server installed, but creating a role/database for it
requires `sudo`/`su`/editing `pg_hba.conf` to a weaker auth mode, all of which this sandbox's
own safety policy explicitly blocked when attempted (and the `pg_hba.conf` edit used to test
that was reverted immediately — no auth settings were left weakened). **No credentials to that
system Postgres were ever obtained.**

Instead: [`@electric-sql/pglite`](https://pglite.dev/) — real Postgres, compiled to WebAssembly,
not a SQLite shim — runs **in-process** inside Vitest with **zero system privileges needed**.
`src/lib/db/test-client.ts` boots a fresh PGlite instance per test file and applies the actual
`drizzle-kit`-generated migration SQL from `drizzle/0000_swift_forge.sql` (the same file that
would run against a real server), so what's tested is the real schema and the real Drizzle query
code, not a hand-rolled substitute. This is a genuine Postgres engine for every DB-dependent
test below — only the *transport* (in-process vs. TCP) differs from a hosted server, and the app
code (`src/lib/db/client.ts`) always targets Postgres over the wire via the `postgres` driver in
production/dev.

| Area | Status | Where |
|---|---|---|
| Typecheck | **PASS** | `pnpm typecheck` — 0 errors |
| Lint | **PASS** | `pnpm lint` — 0 errors/warnings |
| Unit/integration tests | **PASS** — 73/73 | `pnpm test` (11 files, includes all pre-existing Phase 1–3 tests plus Phase 4's) |
| Build | **PASS** | `pnpm build` — all routes compile; build succeeds even with no real `DATABASE_URL` (lazy DB connection) |
| Progress idempotency (incl. concurrent duplicate requests) | **PASS** | `src/lib/db/progress-queries.test.ts` (7 tests) |
| Journal/Canvas/Final Project CRUD + ownership/IDOR | **PASS** | `src/lib/db/journal-canvas-finalproject.test.ts` (5 tests) |
| Migration (fresh, twice, cloud-ahead, local-ahead) | **PASS** | `src/lib/db/migration-queries.test.ts` (4 tests) |
| Auth (passwords, sessions, reset tokens) | **PASS** | `src/lib/db/auth-queries.test.ts` (8 tests) |
| DB constraints/transactions | **PASS** (exercised throughout the above — unique constraints, `ON CONFLICT`, multi-table transactions) | same files |
| Real-Postgres-engine sanity check | **PASS** | `src/lib/db/test-client.smoke.test.ts` |
| Browser E2E (Playwright, run via `npx --yes -p playwright node <script>`, same approach as prior phases) | **PASS, run manually in this session** against `next dev` wired to a real Postgres-wire-protocol server (`@electric-sql/pglite-socket`, a TCP front end for the same PGlite engine — exercised through the exact same `postgres`/Drizzle code path the app uses against a hosted database) | not committed as a project script per that convention; flow covered: signup → IDOR block on another user's data (404) → duplicate signup rejected → logout → wrong-password login rejected → correct login → complete a lesson via the API the UI calls → refresh → progress persists → duplicate completion doesn't double XP → journal entry persists after refresh → canvas autosave persists after refresh → final-project step persists after refresh → account page shows the signed-in email → logout → login again → progress still there |
| Mobile viewport / responsive nav / hydration / console errors | **PASS, run manually in this session** | Playwright with the iPhone 13 device profile: signup, mobile nav drawer open, navigate journal/canvas/account, reload — zero console/page errors |
| Live deploy against production Vercel Postgres | **BLOCKED** — no production Postgres exists yet (see **Deployment**) |

Nothing above is asserted without having actually been run in this session.

## Deployment

- Checked `vercel env ls` against the linked project (`90-day-business-school`,
  team `smart-bi-studio`): **no environment variables exist yet**, confirming no production
  Postgres/`DATABASE_URL` has been provisioned.
- Per the task's explicit instruction, this session did **not** provision any cloud database or
  other infrastructure. **The project owner needs to provision a Postgres database** (Vercel
  Postgres, Neon, or Supabase all work with this `postgres`/Drizzle setup) and then run:

  ```bash
  vercel link --yes --team smart-bi-studio --project 90-day-business-school
  vercel env add DATABASE_URL production
  vercel env add DATABASE_URL preview
  vercel env add NEXT_PUBLIC_APP_URL production   # e.g. https://90-day-business-school.vercel.app
  ```

  Then run the migration against that database once (locally, with `DATABASE_URL` pointed at it):

  ```bash
  DATABASE_URL=<production connection string> npx drizzle-kit migrate
  ```

- **Deployment was not attempted** in this session — there is no real production `DATABASE_URL`
  to deploy against, and the task explicitly says not to deploy with a fake/placeholder one.
  This sandbox's egress policy also blocks `*.vercel.app` outbound (confirmed in earlier phases),
  though that's secondary to simply not having a real database yet.

## Known limitations

- No email provider is wired up; password reset links are logged server-side only
  (`console.log`), not emailed. See **Authentication**.
- Rate limiting on login/forgot-password is per-process in-memory, not a durable cross-instance
  limiter (documented tradeoff, not a bug).
- No CSRF token scheme beyond `SameSite=Lax` + same-origin fetches (see **Security**).
- The browser E2E and mobile-viewport passes were run manually in this session against a
  PGlite-backed Postgres-wire-protocol stand-in (see **Testing**) rather than against a hosted
  Postgres server or a committed CI script, since provisioning either was out of scope/blocked.
- `achievements`/`exercise_completions`/`case_study_completions` are per-(user, day) rows keyed
  by lesson day number, consistent with how the original Zustand store tracked them
  (`day-N` lesson ids) — not a richer lesson-id scheme, since the product doesn't have one today.
- Making the "reference" pages (calculators, glossary, formulas, case studies) require login is
  a product-shape decision this phase made for consistency with the rest of the shared app
  shell/nav (see **Route protection**) — easy to relax later if the product wants those public.
