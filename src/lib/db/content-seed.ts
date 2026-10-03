// No "server-only" guard here (unlike content-queries.ts): this module is also imported by
// scripts/seed-content.ts, a plain tsx/node operator script run outside Next's bundler, where the
// server-only package's import-time check throws. It is never imported by a client component.
import type { Database } from "./types";
import { glossaryEntries, formulaEntries, caseStudyEntries, lessons as lessonsTable } from "./schema";
import { glossary } from "@/lib/content/glossary";
import { formulas } from "@/lib/content/formulas";
import { caseStudies } from "@/lib/content/case-studies";
import { allLessons } from "@/lib/content/lessons";

export interface ContentSeedResult {
  glossaryInserted: number;
  formulasInserted: number;
  caseStudiesInserted: number;
  lessonsInserted: number;
}

/**
 * One-time (but safe to re-run) copy of the existing hardcoded reference content into the new CMS
 * tables, marked `published` since it is already live to every learner today - see
 * docs/PHASE-5.3.md "Reference content CMS migration". Idempotent via `onConflictDoNothing` keyed
 * on the primary key (the same stable slug/id the hardcoded content already uses): running this
 * against a database that already has these rows inserts nothing and changes nothing. Never
 * touches the hardcoded TS files themselves, never deletes anything, and runs independently per
 * table so a partial prior run still completes cleanly.
 */
export async function seedContentFromHardcoded(db: Database): Promise<ContentSeedResult> {
  const glossaryResult = await db
    .insert(glossaryEntries)
    .values(
      glossary.map((g) => ({
        id: g.slug,
        term: g.term,
        slug: g.slug,
        definition: g.definition,
        example: g.example,
        formula: g.formula ?? null,
        mnemonic: g.mnemonic ?? null,
        relatedTerms: JSON.stringify(g.relatedTerms),
        status: "published" as const,
      }))
    )
    .onConflictDoNothing({ target: glossaryEntries.id })
    .returning({ id: glossaryEntries.id });

  const formulasResult = await db
    .insert(formulaEntries)
    .values(
      formulas.map((f) => ({
        id: f.id,
        name: f.name,
        category: f.category,
        expression: f.expression,
        explanation: f.explanation,
        example: f.example,
        status: "published" as const,
      }))
    )
    .onConflictDoNothing({ target: formulaEntries.id })
    .returning({ id: formulaEntries.id });

  const caseStudiesResult = await db
    .insert(caseStudyEntries)
    .values(
      caseStudies.map((c) => ({
        id: c.id,
        company: c.company,
        category: c.category,
        industry: c.industry,
        factType: c.factType,
        problem: c.problem,
        solution: c.solution,
        customer: c.customer,
        businessModel: c.businessModel,
        revenueModel: c.revenueModel,
        growth: c.growth,
        competition: c.competition,
        challenges: c.challenges,
        lessons: JSON.stringify(c.lessons),
        status: "published" as const,
      }))
    )
    .onConflictDoNothing({ target: caseStudyEntries.id })
    .returning({ id: caseStudyEntries.id });

  const lessonsResult = await db
    .insert(lessonsTable)
    .values(
      allLessons.map((l) => ({
        id: l.id,
        day: l.day,
        phaseId: l.phaseId,
        slug: l.slug,
        title: l.title,
        objective: l.objective,
        concept: l.concept,
        simpleExplanation: l.simpleExplanation,
        analogy: l.analogy,
        businessExample: l.businessExample,
        indiaExample: l.indiaExample ?? null,
        startupExample: l.startupExample ?? null,
        formula: l.formula ? JSON.stringify(l.formula) : null,
        mnemonic: l.mnemonic ? JSON.stringify(l.mnemonic) : null,
        commonMistake: l.commonMistake,
        exercisePrompt: l.exercise.prompt,
        exerciseAnswer: l.exercise.answer,
        caseStudy: l.caseStudy,
        founderQuestion: l.founderQuestion,
        quiz: JSON.stringify(l.quiz),
        takeaways: JSON.stringify(l.takeaways),
        rememberThis: l.rememberThis,
        status: "published" as const,
        publishedAt: new Date(),
      }))
    )
    .onConflictDoNothing({ target: lessonsTable.id })
    .returning({ id: lessonsTable.id });

  return {
    glossaryInserted: glossaryResult.length,
    formulasInserted: formulasResult.length,
    caseStudiesInserted: caseStudiesResult.length,
    lessonsInserted: lessonsResult.length,
  };
}
