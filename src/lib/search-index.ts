import { allLessons } from "./content/lessons";
import { glossary } from "./content/glossary";
import { formulas } from "./content/formulas";
import { caseStudies } from "./content/case-studies";

export interface SearchResult {
  id: string;
  title: string;
  category: "Lesson" | "Glossary" | "Formula" | "Case Study" | "Calculator";
  description: string;
  href: string;
}

const calculatorResults: SearchResult[] = [
  { id: "calc-profit", title: "Profit Calculator", category: "Calculator", description: "Calculate profit and margin from revenue and cost.", href: "/calculators/profit" },
  { id: "calc-margin", title: "Margin Calculator", category: "Calculator", description: "Calculate gross/net margin percentage.", href: "/calculators/margin" },
  { id: "calc-break-even", title: "Break-even Calculator", category: "Calculator", description: "Find the break-even point in units.", href: "/calculators/break-even" },
  { id: "calc-roi", title: "ROI Calculator", category: "Calculator", description: "Calculate return on investment.", href: "/calculators/roi" },
  { id: "calc-cac", title: "CAC Calculator", category: "Calculator", description: "Calculate customer acquisition cost.", href: "/calculators/cac" },
  { id: "calc-ltv", title: "LTV Calculator", category: "Calculator", description: "Calculate customer lifetime value.", href: "/calculators/ltv" },
  { id: "calc-conversion", title: "Conversion Calculator", category: "Calculator", description: "Calculate conversion rate.", href: "/calculators/conversion" },
  { id: "calc-churn", title: "Churn Calculator", category: "Calculator", description: "Calculate customer churn rate.", href: "/calculators/churn" },
  { id: "calc-retention", title: "Retention Calculator", category: "Calculator", description: "Calculate customer retention rate.", href: "/calculators/retention" },
  { id: "calc-runway", title: "Startup Runway Calculator", category: "Calculator", description: "Calculate how many months of cash runway remain.", href: "/calculators/runway" },
  { id: "calc-valuation", title: "Valuation Calculator", category: "Calculator", description: "Calculate post-money valuation and investor ownership.", href: "/calculators/valuation" },
  { id: "calc-dilution", title: "Dilution Calculator", category: "Calculator", description: "Calculate founder dilution after a funding round.", href: "/calculators/dilution" },
];

function buildSearchIndex(): SearchResult[] {
  const lessonResults: SearchResult[] = allLessons.map((l) => ({
    id: `lesson-${l.day}`,
    title: `Day ${l.day}: ${l.title}`,
    category: "Lesson",
    description: l.objective,
    href: `/learn/day/${l.day}`,
  }));

  const glossaryResults: SearchResult[] = glossary.map((g) => ({
    id: `glossary-${g.slug}`,
    title: g.term,
    category: "Glossary",
    description: g.definition,
    href: `/glossary/${g.slug}`,
  }));

  const formulaResults: SearchResult[] = formulas.map((f) => ({
    id: `formula-${f.id}`,
    title: f.name,
    category: "Formula",
    description: f.explanation,
    href: `/formulas#${f.id}`,
  }));

  const caseStudyResults: SearchResult[] = caseStudies.map((c) => ({
    id: `case-${c.id}`,
    title: c.company,
    category: "Case Study",
    description: c.problem,
    href: `/case-studies#${c.id}`,
  }));

  return [...lessonResults, ...glossaryResults, ...formulaResults, ...caseStudyResults, ...calculatorResults];
}

/**
 * Built once, at module load, instead of once per GlobalSearch mount (Phase 5.5.2 performance
 * pass). Every input here (lessons/glossary/formulas/case studies) is a static import that never
 * changes at runtime, so a `useMemo(() => buildSearchIndex(), [])` inside the component still
 * reran this on every single mount - including every time AppShell remounts crossing between the
 * (app) and (public) route groups (see ProgressBootstrap.tsx for the same pattern). The work
 * itself was never expensive (~300 plain objects, no DB/network), so this is a small, genuinely
 * free simplification, not a fix for a measured bottleneck.
 */
export const searchIndexData: SearchResult[] = buildSearchIndex();

export function searchIndex(query: string, index: SearchResult[]): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return index
    .filter((item) => item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q))
    .slice(0, 30);
}
