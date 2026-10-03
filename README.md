# 90-Day Business School

Learn Business. Understand Startups. Think Like a Founder.

A complete, interactive 90-day curriculum covering business fundamentals, startups, customer discovery, product, marketing, sales, operations, finance, legal/tax basics, people management, funding, growth, and strategy — ending in a 17-step Founder Project that produces a real, exportable business plan.

## Features

- **90 days of lesson content** across 15 phases, each with a concept, analogy, real/India/startup examples, formula, mnemonic, common mistake, exercise, mini case study, founder question, quiz, and key takeaways.
- **Visual learning**: an interactive roadmap, and business diagrams (marketing/sales/AARRR funnels, TAM/SAM/SOM, SWOT, Porter's Five Forces, a clickable P&L waterfall, a live break-even chart, a unit economics diagram, and a funding/dilution diagram) embedded directly into the lessons that teach each concept.
- **157+ term glossary**, **39 formulas**, and a **12-company case study library**, each case clearly labelled as a documented fact or an illustrative analysis.
- **12 live business calculators** (profit, margin, break-even, ROI, CAC, LTV, conversion, churn, retention, runway, valuation, dilution) — four of them (break-even, LTV, valuation, dilution) include a connected chart driven by the same input state.
- **A business simulator** across 6 business types with branching scenarios, clearly labelled "illustrative scenario" / "simulation outcome" so it's never mistaken for a real-world prediction.
- **An interactive Business Model Canvas** (9 blocks, autosaved, with a compact summary view) and a **Startup Readiness Checklist** (explicitly not a success predictor).
- **A 17-step Final Project wizard** producing a printable/exportable business plan, plus a **Founder Journal** with categorized entries and filtering.
- **Progress system**: XP, streaks, day completion, quiz scoring, and achievements, all persisted client-side.
- Global search (`/` shortcut) grouped by category with keyboard navigation, sitemap/robots, and accessible navigation with a mobile drawer.

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

- **Next.js 16 App Router + TypeScript + Tailwind CSS v4**, no database — all learner progress (completed days, XP, streak, quiz scores, journal entries, canvas, final project answers) is persisted client-side in `localStorage`.
- **Content** lives entirely in `src/lib/content/` (lessons, phases, glossary, formulas, case studies) as structured TypeScript data, decoupled from the UI, so it can later move to an admin-managed source.
- **Progress engine** (`src/lib/progress/`) is a set of pure, unit-tested functions (XP, streak, achievements) wired into a small Zustand store.
- **Calculators & simulator** (`src/lib/calculators.ts`, `src/lib/simulator.ts`) are pure functions, unit tested, and reused by both the UI and the test suite. Charts and diagrams call these same functions directly rather than duplicating any business logic.
- **UI components** (`src/components/ui/`) are shared, presentational primitives (FormulaCard, MnemonicCard, BusinessExampleCard, Callout, MetricCard, ProgressBar, PhaseCard, ExerciseCard, CaseStudyCard, DiagramCard, LessonSection, FadeIn) used consistently across lesson pages, the roadmap, and the dashboard instead of one-off per-page styling.
- **Diagrams** (`src/components/visuals/`) are plain SVG/CSS React components — no charting library dependency was added. Most are server components; only the two that need click-to-expand interactivity (SWOT matrix, P&L waterfall) are client components.
- Global reduced-motion support is handled once, globally, in `globals.css`.

## Content architecture (counts, verified)

- 90 lessons (`src/lib/content/lessons/phase-01..15-*.ts`)
- 157 glossary terms (`src/lib/content/glossary.ts`)
- 39 formulas across 6 categories (`src/lib/content/formulas.ts`)
- 12 case studies (`src/lib/content/case-studies.ts`)
- 12 calculators (`src/app/(app)/calculators/*`)
- 17 Final Project wizard steps (`src/lib/final-project.ts`)

See `.env.example` — no environment variables are required to run this app.

## Deploying

This is a standard Next.js app and deploys to [Vercel](https://vercel.com/new) with no special configuration:

1. Push this repository to GitHub (already done for this branch).
2. In Vercel, "Add New Project" → import the repository.
3. Framework preset: Next.js (auto-detected). Build command and output are auto-detected (`next build`).
4. No environment variables are required.
5. Deploy.

**Production URL:** A temporary, anonymous Vercel deployment was created from this session to verify the production build actually deploys (`vercel deploy --temporary`, no account required). It confirmed `"status": "ok"`, `"readyState": "READY"` from Vercel's own API, at `https://temporary-speedy-amber-mvepjgr.vercel.app`. This deployment is **temporary and expires roughly one hour after creation** — it is not a persistent production URL. To get a permanent one, either claim that deployment within the hour, or follow the steps above to connect the repository to a real Vercel account.

## Known limitations

- No database or auth — all state is per-browser `localStorage`. Clearing site data resets progress.
- PDF export uses the browser's native print-to-PDF (a dedicated print stylesheet), not a PDF-generation library.
- No permanent production deployment exists yet — see "Production URL" above. The temporary deployment could not be smoke-tested from the session that created it, because that session's outbound network policy blocks `*.vercel.app`; the build itself was verified via Vercel's deployment API response and via 278/278 pages building and 18/18 routes returning HTTP 200 locally.
- The responsive/accessibility audit in this phase covered 8 breakpoints (320–1440px) across 18 routes via real headless-Chromium automation (not just reading Tailwind classes), and found and fixed real bugs along the way (see commit history): a long unbroken string overflowing on narrow screens, an unbalanced Porter's Five Forces layout, a missing Escape handler and missing `aria-modal` on the mobile nav drawer, six unlabeled form fields, an out-of-range Dilution input producing a negative ownership percentage, and a Zustand selector bug that kept "Mark Day Complete" visible after completion. All were fixed and re-verified; no further issues were found in this pass, though no audit of this kind can claim full coverage.

## Future roadmap

- A dedicated PDF export library for a more polished, paginated business plan document.
- Server-backed accounts so progress can sync across devices.
- An admin-managed content source (the data model in `src/lib/content/` was deliberately kept decoupled from the UI to make this possible later).
