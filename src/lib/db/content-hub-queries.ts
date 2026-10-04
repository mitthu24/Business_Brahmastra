import "server-only";
import type { Database } from "./types";
import { listGlossaryEntries, listFormulaEntries, listCaseStudyEntries } from "./content-queries";
import { listLessons } from "./lesson-queries";
import { listAchievementEntries } from "./achievement-queries";
import { listCalculatorEntries } from "./calculator-queries";
import { listAuditLogs, type AuditLogRow } from "./audit-log";

export interface ContentTypeStats {
  key: string;
  label: string;
  manageHref: string;
  total: number;
  published: number;
  draft: number;
  archived: number;
  lastUpdated: Date | null;
}

function summarize(
  key: string,
  label: string,
  manageHref: string,
  rows: { status: string; updatedAt: Date }[]
): ContentTypeStats {
  let lastUpdated: Date | null = null;
  for (const r of rows) {
    if (!lastUpdated || r.updatedAt > lastUpdated) lastUpdated = r.updatedAt;
  }
  return {
    key,
    label,
    manageHref,
    total: rows.length,
    published: rows.filter((r) => r.status === "published").length,
    draft: rows.filter((r) => r.status === "draft").length,
    archived: rows.filter((r) => r.status === "archived").length,
    lastUpdated,
  };
}

/** Every number here comes from a real query against the live tables - no fabricated or
 * hardcoded statistics (docs/PHASE-5.3.md "Founder Content Hub": "Use real database data"). Runs
 * one query per content type in parallel; at current content volumes (a few hundred rows across
 * all 8 types) this is a small, fast page load, not a scaling concern. */
export async function getContentHubStats(db: Database): Promise<ContentTypeStats[]> {
  const [lessons, glossary, formulas, caseStudies, achievements, calculators] = await Promise.all([
    listLessons(db),
    listGlossaryEntries(db),
    listFormulaEntries(db),
    listCaseStudyEntries(db),
    listAchievementEntries(db),
    listCalculatorEntries(db),
  ]);

  return [
    summarize("lessons", "Lessons", "/founder/lessons", lessons),
    summarize("glossary", "Glossary", "/founder/glossary", glossary),
    summarize("formulas", "Formulas", "/founder/formulas", formulas),
    summarize("case-studies", "Case Studies", "/founder/case-studies", caseStudies),
    summarize(
      "exercises",
      "Exercises",
      "/founder/exercises",
      lessons.map((l) => ({ status: l.exerciseStatus, updatedAt: l.updatedAt }))
    ),
    summarize(
      "quizzes",
      "Quizzes",
      "/founder/quizzes",
      lessons.map((l) => ({ status: l.quizStatus, updatedAt: l.updatedAt }))
    ),
    summarize("achievements", "Achievements", "/founder/achievements", achievements),
    summarize("calculators", "Calculators", "/founder/calculators", calculators),
  ];
}

export async function getRecentContentActivity(db: Database, limit = 15): Promise<AuditLogRow[]> {
  const rows = await listAuditLogs(db, {}, 200);
  const contentEntityTypes = new Set([
    "lesson",
    "glossary_entry",
    "formula_entry",
    "case_study_entry",
    "exercise",
    "quiz",
    "achievement",
    "calculator",
  ]);
  return rows.filter((r) => contentEntityTypes.has(r.entityType)).slice(0, limit);
}
