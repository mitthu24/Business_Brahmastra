"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { requireFounderForApi } from "@/lib/auth/dal";
import { recordAuditLog } from "@/lib/db/audit-log";
import {
  createLesson,
  updateLesson,
  setLessonStatus,
  getLessonById,
  getLessonByDayNumber,
  type LessonInput,
} from "@/lib/db/lesson-queries";
import { isUniqueViolation } from "@/lib/db/errors";
import { phases } from "@/lib/content/phases";
import type { ContentStatus } from "@/lib/db/content-queries";
import { parseQuizJson } from "@/lib/content/quiz-validation";
import type { QuizQuestion } from "@/lib/content/types";

export type FormState = { error?: string; fieldErrors?: Record<string, string[]>; success?: string } | undefined;
type ActionResult = { ok: true } | { ok: false; error: string };

/** Every lesson mutation in this file calls this first - role read fresh from the DB on every
 * call, never trusted from the client (docs/PHASE-5.3.md "Curriculum + lesson CMS" > "Security"). */
async function requireFounder(): Promise<{ founderId: string } | { ok: false; error: string }> {
  const founder = await requireFounderForApi();
  if (!founder) return { ok: false, error: "Not authorized." };
  return { founderId: founder.user.id };
}

function splitLines(raw: FormDataEntryValue | null): string[] {
  if (typeof raw !== "string") return [];
  return raw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

const lessonFieldsSchema = z.object({
  day: z.number().int().min(1).max(90),
  phaseId: z.string().trim().min(1),
  slug: z
    .string()
    .trim()
    .min(2)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only."),
  title: z.string().trim().min(2),
  objective: z.string().trim().min(5),
  concept: z.string().trim().min(5),
  simpleExplanation: z.string().trim().min(5),
  analogy: z.string().trim().min(5),
  businessExample: z.string().trim().min(5),
  indiaExample: z.string().trim().optional(),
  startupExample: z.string().trim().optional(),
  formulaName: z.string().trim().optional(),
  formulaExpression: z.string().trim().optional(),
  formulaWorkedExample: z.string().trim().optional(),
  mnemonicLabel: z.string().trim().optional(),
  commonMistake: z.string().trim().min(5),
  exercisePrompt: z.string().trim().min(5),
  exerciseAnswer: z.string().trim().min(5),
  caseStudy: z.string().trim().min(5),
  founderQuestion: z.string().trim().min(5),
  rememberThis: z.string().trim().min(5),
});

function readLessonFields(formData: FormData) {
  return {
    day: Number(formData.get("day")),
    phaseId: formData.get("phaseId"),
    slug: formData.get("slug"),
    title: formData.get("title"),
    objective: formData.get("objective"),
    concept: formData.get("concept"),
    simpleExplanation: formData.get("simpleExplanation"),
    analogy: formData.get("analogy"),
    businessExample: formData.get("businessExample"),
    indiaExample: formData.get("indiaExample") || undefined,
    startupExample: formData.get("startupExample") || undefined,
    formulaName: formData.get("formulaName") || undefined,
    formulaExpression: formData.get("formulaExpression") || undefined,
    formulaWorkedExample: formData.get("formulaWorkedExample") || undefined,
    mnemonicLabel: formData.get("mnemonicLabel") || undefined,
    commonMistake: formData.get("commonMistake"),
    exercisePrompt: formData.get("exercisePrompt"),
    exerciseAnswer: formData.get("exerciseAnswer"),
    caseStudy: formData.get("caseStudy"),
    founderQuestion: formData.get("founderQuestion"),
    rememberThis: formData.get("rememberThis"),
  };
}

function buildLessonInput(parsed: z.infer<typeof lessonFieldsSchema>, formData: FormData, quiz: QuizQuestion[]): LessonInput {
  return {
    day: parsed.day,
    phaseId: parsed.phaseId,
    slug: parsed.slug,
    title: parsed.title,
    objective: parsed.objective,
    concept: parsed.concept,
    simpleExplanation: parsed.simpleExplanation,
    analogy: parsed.analogy,
    businessExample: parsed.businessExample,
    indiaExample: parsed.indiaExample,
    startupExample: parsed.startupExample,
    formula: parsed.formulaName
      ? { name: parsed.formulaName, expression: parsed.formulaExpression ?? "", workedExample: parsed.formulaWorkedExample ?? "" }
      : undefined,
    mnemonic: parsed.mnemonicLabel ? { label: parsed.mnemonicLabel, breakdown: splitLines(formData.get("mnemonicBreakdown")) } : undefined,
    commonMistake: parsed.commonMistake,
    exercisePrompt: parsed.exercisePrompt,
    exerciseAnswer: parsed.exerciseAnswer,
    caseStudy: parsed.caseStudy,
    founderQuestion: parsed.founderQuestion,
    quiz,
    takeaways: splitLines(formData.get("takeaways")),
    rememberThis: parsed.rememberThis,
  };
}

export async function createLessonAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const auth = await requireFounder();
  if ("error" in auth) return { error: auth.error };

  const parsed = lessonFieldsSchema.safeParse(readLessonFields(formData));
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  if (!phases.some((p) => p.id === parsed.data.phaseId)) {
    return { fieldErrors: { phaseId: ["Unknown phase."] } };
  }

  const quizResult = parseQuizJson(formData.get("quiz"), `d${parsed.data.day}`);
  if (!quizResult.ok) return { fieldErrors: { quiz: [quizResult.error] } };

  const db = getDb();
  if (await getLessonByDayNumber(db, parsed.data.day)) {
    return { fieldErrors: { day: ["A lesson for this day already exists."] } };
  }

  const status: ContentStatus = formData.get("intent") === "publish" ? "published" : "draft";
  const input = buildLessonInput(parsed.data, formData, quizResult.value);

  let entry;
  try {
    entry = await createLesson(db, input, status, auth.founderId);
  } catch (err) {
    if (isUniqueViolation(err)) return { fieldErrors: { day: ["A lesson for this day or slug already exists."] } };
    throw err;
  }

  await recordAuditLog(db, {
    founderId: auth.founderId,
    action: "CONTENT_CREATED",
    entityType: "lesson",
    entityId: entry.id,
    metadata: { day: entry.day, title: entry.title, status },
  });
  revalidatePath("/founder/lessons");
  revalidatePath("/founder/curriculum");
  redirect(`/founder/lessons/${entry.id}`);
}

export async function updateLessonAction(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const auth = await requireFounder();
  if ("error" in auth) return { error: auth.error };

  const db = getDb();
  const existing = await getLessonById(db, id);
  if (!existing) return { error: "Lesson not found." };

  const parsed = lessonFieldsSchema.omit({ day: true, slug: true }).safeParse(readLessonFields(formData));
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  if (!phases.some((p) => p.id === parsed.data.phaseId)) {
    return { fieldErrors: { phaseId: ["Unknown phase."] } };
  }

  const quizResult = parseQuizJson(formData.get("quiz"), `d${existing.day}`);
  if (!quizResult.ok) return { fieldErrors: { quiz: [quizResult.error] } };

  const input = buildLessonInput({ ...parsed.data, day: existing.day, slug: existing.slug }, formData, quizResult.value);
  await updateLesson(db, id, input, auth.founderId);
  await recordAuditLog(db, { founderId: auth.founderId, action: "CONTENT_UPDATED", entityType: "lesson", entityId: id });
  revalidatePath("/founder/lessons");
  revalidatePath(`/founder/lessons/${id}`);
  revalidatePath("/founder/curriculum");
  revalidatePath(`/learn/day/${existing.day}`);
  return { success: "Saved." };
}

/** Copies every learner-visible field from an existing lesson onto a NEW target day (1-90, not
 * already in use) as a fresh draft. The source lesson's own day/identity is never touched -
 * duplicating never reassigns or frees up a day number, so lesson_completions and the other
 * progress tables keyed by day are unaffected (docs/PHASE-5.3.md "Lesson CMS" > "Duplicate
 * Lesson": "must not duplicate its canonical day number"). The duplicate's slug is derived from
 * the new day so it can never collide with the source's slug. */
export async function duplicateLessonAction(sourceId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const auth = await requireFounder();
  if ("error" in auth) return { error: auth.error };

  const db = getDb();
  const source = await getLessonById(db, sourceId);
  if (!source) return { error: "Source lesson not found." };

  const targetDayRaw = formData.get("targetDay");
  const targetDay = Number(targetDayRaw);
  if (!Number.isInteger(targetDay) || targetDay < 1 || targetDay > 90) {
    return { fieldErrors: { targetDay: ["Choose a valid day number between 1 and 90."] } };
  }
  if (targetDay === source.day) {
    return { fieldErrors: { targetDay: ["Choose a different day than the source lesson."] } };
  }
  if (await getLessonByDayNumber(db, targetDay)) {
    return { fieldErrors: { targetDay: ["Day " + targetDay + " already has a lesson. Choose a day with no lesson yet."] } };
  }

  const input: LessonInput = {
    day: targetDay,
    phaseId: source.phaseId,
    slug: `${source.slug}-day-${targetDay}`,
    title: source.title,
    objective: source.objective,
    concept: source.concept,
    simpleExplanation: source.simpleExplanation,
    analogy: source.analogy,
    businessExample: source.businessExample,
    indiaExample: source.indiaExample ?? undefined,
    startupExample: source.startupExample ?? undefined,
    formula: source.formula ?? undefined,
    mnemonic: source.mnemonic ?? undefined,
    commonMistake: source.commonMistake,
    exercisePrompt: source.exercisePrompt,
    exerciseAnswer: source.exerciseAnswer,
    caseStudy: source.caseStudy,
    founderQuestion: source.founderQuestion,
    quiz: source.quiz.map((q, i) => ({ ...q, id: `d${targetDay}q${i + 1}` })),
    takeaways: source.takeaways,
    rememberThis: source.rememberThis,
  };

  let entry;
  try {
    entry = await createLesson(db, input, "draft", auth.founderId);
  } catch (err) {
    if (isUniqueViolation(err)) return { fieldErrors: { targetDay: ["That day or slug is already in use."] } };
    throw err;
  }

  await recordAuditLog(db, {
    founderId: auth.founderId,
    action: "CONTENT_CREATED",
    entityType: "lesson",
    entityId: entry.id,
    metadata: { day: entry.day, duplicatedFrom: source.id, duplicatedFromDay: source.day },
  });
  revalidatePath("/founder/lessons");
  revalidatePath("/founder/curriculum");
  redirect(`/founder/lessons/${entry.id}`);
}

export async function setLessonStatusAction(id: string, status: ContentStatus): Promise<ActionResult> {
  const auth = await requireFounder();
  if ("error" in auth) return auth;
  const db = getDb();
  const existing = await getLessonById(db, id);
  if (!existing) return { ok: false, error: "Lesson not found." };

  await setLessonStatus(db, id, status, auth.founderId);
  await recordAuditLog(db, {
    founderId: auth.founderId,
    action: status === "published" ? "CONTENT_PUBLISHED" : status === "archived" ? "CONTENT_ARCHIVED" : "CONTENT_UNPUBLISHED",
    entityType: "lesson",
    entityId: id,
    metadata: { day: existing.day },
  });
  revalidatePath("/founder/lessons");
  revalidatePath(`/founder/lessons/${id}`);
  revalidatePath("/founder/curriculum");
  revalidatePath(`/learn/day/${existing.day}`);
  return { ok: true };
}
