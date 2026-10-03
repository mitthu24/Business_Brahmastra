# 90-Day Business School

Learn Business. Understand Startups. Think Like a Founder.

A complete, interactive 90-day curriculum covering business fundamentals, startups, customer discovery, product, marketing, sales, operations, finance, legal/tax basics, people management, funding, growth, and strategy — ending in a 17-step Founder Project that produces a real, exportable business plan.

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
pnpm dev         # start the dev server
pnpm build       # production build
pnpm start       # run the production build
pnpm lint        # eslint
pnpm typecheck   # tsc --noEmit
pnpm test        # vitest (unit tests for formulas, scoring, progress, simulator)
```

## Architecture

- **Next.js App Router + TypeScript + Tailwind CSS v4**, no database — all learner progress (completed days, XP, streak, quiz scores, journal entries, canvas, final project answers) is persisted client-side in `localStorage`.
- **Content** lives entirely in `src/lib/content/` (lessons, phases, glossary, formulas, case studies) as structured TypeScript data, decoupled from the UI, so it can later move to an admin-managed source.
- **Progress engine** (`src/lib/progress/`) is a set of pure, unit-tested functions (XP, streak, achievements) wired into a small Zustand store.
- **Calculators & simulator** (`src/lib/calculators.ts`, `src/lib/simulator.ts`) are pure functions, unit tested, and reused by both the UI and the test suite.

See `.env.example` — no environment variables are required to run this app.

## Deploying

This is a standard Next.js app and deploys to [Vercel](https://vercel.com/new) with no special configuration.
