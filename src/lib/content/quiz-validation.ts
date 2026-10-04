import { z } from "zod";
import type { QuizQuestion } from "./types";

// Shared between src/app/founder/lesson-actions.ts and quiz-actions.ts - both accept quiz content
// as a raw JSON textarea (see docs/PHASE-5.3.md "Quiz CMS") and must validate it identically.
export const quizQuestionSchema = z.object({
  id: z.string().trim().min(1).optional(),
  question: z.string().trim().min(1),
  options: z.array(z.string().trim().min(1)).min(2),
  correctIndex: z.number().int().min(0),
  explanation: z.string().trim().min(1),
});

export function parseQuizJson(
  raw: FormDataEntryValue | null,
  idPrefix: string
): { ok: true; value: QuizQuestion[] } | { ok: false; error: string } {
  const text = typeof raw === "string" ? raw.trim() : "";
  if (!text) return { ok: true, value: [] };
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: "Quiz must be valid JSON - an array of {question, options, correctIndex, explanation}." };
  }
  const result = z.array(quizQuestionSchema).safeParse(parsed);
  if (!result.success) {
    return { ok: false, error: "Quiz JSON doesn't match the expected shape: " + result.error.issues[0]?.message };
  }
  return {
    ok: true,
    value: result.data.map((q, i) => ({ ...q, id: q.id ?? `${idPrefix}q${i + 1}` })),
  };
}
