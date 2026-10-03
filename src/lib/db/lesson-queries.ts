import "server-only";
import { eq, and, or, ilike, type SQL } from "drizzle-orm";
import type { Database } from "./types";
import { lessons } from "./schema";
import type { ContentStatus } from "./content-queries";
import type { Lesson, QuizQuestion } from "@/lib/content/types";
import { getLessonByDay as getHardcodedLessonByDay } from "@/lib/content/lessons";

export interface LessonFilters {
  status?: ContentStatus;
  phaseId?: string;
  search?: string;
}

interface ParsedFormula {
  name: string;
  expression: string;
  workedExample: string;
}

interface ParsedMnemonic {
  label: string;
  breakdown: string[];
}

function parseFormula(raw: string | null): ParsedFormula | undefined {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as ParsedFormula;
  } catch {
    return undefined;
  }
}

function parseMnemonic(raw: string | null): ParsedMnemonic | undefined {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as ParsedMnemonic;
  } catch {
    return undefined;
  }
}

function parseQuiz(raw: string): QuizQuestion[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseStringArray(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export interface LessonRow {
  id: string;
  day: number;
  phaseId: string;
  slug: string;
  title: string;
  objective: string;
  concept: string;
  simpleExplanation: string;
  analogy: string;
  businessExample: string;
  indiaExample: string | null;
  startupExample: string | null;
  formula: ParsedFormula | undefined;
  mnemonic: ParsedMnemonic | undefined;
  commonMistake: string;
  exercisePrompt: string;
  exerciseAnswer: string;
  caseStudy: string;
  founderQuestion: string;
  quiz: QuizQuestion[];
  takeaways: string[];
  rememberThis: string;
  status: ContentStatus;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

function toLessonRow(r: typeof lessons.$inferSelect): LessonRow {
  return {
    ...r,
    formula: parseFormula(r.formula),
    mnemonic: parseMnemonic(r.mnemonic),
    quiz: parseQuiz(r.quiz),
    takeaways: parseStringArray(r.takeaways),
  };
}

/** Maps a CMS row back into the exact app-wide `Lesson` shape the lesson engine already renders,
 * so the learner-facing page needs no changes beyond where it gets a Lesson from. */
function toLesson(row: LessonRow): Lesson {
  return {
    id: row.id,
    day: row.day,
    phaseId: row.phaseId,
    title: row.title,
    slug: row.slug,
    objective: row.objective,
    concept: row.concept,
    simpleExplanation: row.simpleExplanation,
    analogy: row.analogy,
    businessExample: row.businessExample,
    indiaExample: row.indiaExample ?? undefined,
    startupExample: row.startupExample ?? undefined,
    formula: row.formula,
    mnemonic: row.mnemonic,
    commonMistake: row.commonMistake,
    exercise: { prompt: row.exercisePrompt, answer: row.exerciseAnswer },
    caseStudy: row.caseStudy,
    founderQuestion: row.founderQuestion,
    quiz: row.quiz,
    takeaways: row.takeaways,
    rememberThis: row.rememberThis,
  };
}

export async function listLessons(db: Database, filters: LessonFilters = {}): Promise<LessonRow[]> {
  const conditions: SQL[] = [];
  if (filters.status) conditions.push(eq(lessons.status, filters.status));
  if (filters.phaseId) conditions.push(eq(lessons.phaseId, filters.phaseId));
  if (filters.search) {
    const needle = `%${filters.search}%`;
    conditions.push(or(ilike(lessons.title, needle), ilike(lessons.objective, needle))!);
  }
  const rows = await db
    .select()
    .from(lessons)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(lessons.day);
  return rows.map(toLessonRow);
}

export async function getLessonById(db: Database, id: string): Promise<LessonRow | null> {
  const [row] = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
  return row ? toLessonRow(row) : null;
}

export async function getLessonByDayNumber(db: Database, day: number): Promise<LessonRow | null> {
  const [row] = await db.select().from(lessons).where(eq(lessons.day, day)).limit(1);
  return row ? toLessonRow(row) : null;
}

/**
 * The learner read path (docs/PHASE-5.3.md "Curriculum CMS: learner cutover"). Never exposes
 * draft/archived content: if a CMS row exists for this day but isn't published, the day is
 * treated as inaccessible (null) - exactly like an unpublish/archive is supposed to behave - even
 * though the hardcoded fallback below could technically still render it. Falls back to the
 * hardcoded lesson ONLY when no CMS row exists for this day at all (not yet migrated), so a
 * partial or not-yet-run seed can never 404 a day for learners. Once every day has been migrated
 * and verified, every call resolves from the DB; the hardcoded module stops being consulted in
 * practice without being deleted, exactly as instructed.
 */
export async function getPublishedLessonByDayForLearner(db: Database, day: number): Promise<Lesson | null> {
  const row = await getLessonByDayNumber(db, day);
  if (row) {
    return row.status === "published" ? toLesson(row) : null;
  }
  return getHardcodedLessonByDay(day) ?? null;
}

export interface LessonInput {
  day: number;
  phaseId: string;
  slug: string;
  title: string;
  objective: string;
  concept: string;
  simpleExplanation: string;
  analogy: string;
  businessExample: string;
  indiaExample?: string;
  startupExample?: string;
  formula?: ParsedFormula;
  mnemonic?: ParsedMnemonic;
  commonMistake: string;
  exercisePrompt: string;
  exerciseAnswer: string;
  caseStudy: string;
  founderQuestion: string;
  quiz: QuizQuestion[];
  takeaways: string[];
  rememberThis: string;
}

function lessonValues(input: LessonInput) {
  return {
    day: input.day,
    phaseId: input.phaseId,
    slug: input.slug,
    title: input.title,
    objective: input.objective,
    concept: input.concept,
    simpleExplanation: input.simpleExplanation,
    analogy: input.analogy,
    businessExample: input.businessExample,
    indiaExample: input.indiaExample ?? null,
    startupExample: input.startupExample ?? null,
    formula: input.formula ? JSON.stringify(input.formula) : null,
    mnemonic: input.mnemonic ? JSON.stringify(input.mnemonic) : null,
    commonMistake: input.commonMistake,
    exercisePrompt: input.exercisePrompt,
    exerciseAnswer: input.exerciseAnswer,
    caseStudy: input.caseStudy,
    founderQuestion: input.founderQuestion,
    quiz: JSON.stringify(input.quiz),
    takeaways: JSON.stringify(input.takeaways),
    rememberThis: input.rememberThis,
  };
}

export async function createLesson(
  db: Database,
  input: LessonInput,
  status: ContentStatus,
  founderId: string
): Promise<LessonRow> {
  const id = `day-${input.day}`;
  const [row] = await db
    .insert(lessons)
    .values({
      id,
      ...lessonValues(input),
      status,
      publishedAt: status === "published" ? new Date() : null,
      createdBy: founderId,
      updatedBy: founderId,
    })
    .returning();
  return toLessonRow(row);
}

export async function updateLesson(db: Database, id: string, input: LessonInput, founderId: string): Promise<void> {
  await db
    .update(lessons)
    .set({ ...lessonValues(input), updatedBy: founderId, updatedAt: new Date() })
    .where(eq(lessons.id, id));
}

export async function setLessonStatus(db: Database, id: string, status: ContentStatus, founderId: string): Promise<void> {
  await db
    .update(lessons)
    .set({
      status,
      updatedBy: founderId,
      updatedAt: new Date(),
      ...(status === "published" ? { publishedAt: new Date() } : {}),
    })
    .where(eq(lessons.id, id));
}
