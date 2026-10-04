"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db/client";
import { requireFounderForApi } from "@/lib/auth/dal";
import { recordAuditLog } from "@/lib/db/audit-log";
import { getLessonById, updateLessonQuiz, setQuizStatus } from "@/lib/db/lesson-queries";
import { parseQuizJson } from "@/lib/content/quiz-validation";
import type { ContentStatus } from "@/lib/db/content-queries";

export type FormState = { error?: string; fieldErrors?: Record<string, string[]>; success?: string } | undefined;
type ActionResult = { ok: true } | { ok: false; error: string };

/** A quiz is a sub-field of a lesson (no standalone quiz table/id exists in this app - see the
 * Part 1 inventory), so these actions edit lessons.quiz and lessons.quiz_status directly rather
 * than a duplicate table. */
async function requireFounder(): Promise<{ founderId: string } | { ok: false; error: string }> {
  const founder = await requireFounderForApi();
  if (!founder) return { ok: false, error: "Not authorized." };
  return { founderId: founder.user.id };
}

export async function updateQuizAction(lessonId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const auth = await requireFounder();
  if ("error" in auth) return { error: auth.error };

  const db = getDb();
  const existing = await getLessonById(db, lessonId);
  if (!existing) return { error: "Lesson not found." };

  const quizResult = parseQuizJson(formData.get("quiz"), existing.id);
  if (!quizResult.ok) return { fieldErrors: { quiz: [quizResult.error] } };
  if (quizResult.value.length === 0) return { fieldErrors: { quiz: ["A quiz needs at least one question."] } };

  await updateLessonQuiz(db, lessonId, quizResult.value, auth.founderId);
  await recordAuditLog(db, { founderId: auth.founderId, action: "CONTENT_UPDATED", entityType: "quiz", entityId: lessonId, metadata: { day: existing.day } });
  revalidatePath("/founder/quizzes");
  revalidatePath(`/founder/quizzes/${lessonId}`);
  revalidatePath(`/learn/day/${existing.day}`);
  return { success: "Saved." };
}

export async function setQuizStatusAction(lessonId: string, status: ContentStatus): Promise<ActionResult> {
  const auth = await requireFounder();
  if ("error" in auth) return auth;
  const db = getDb();
  const existing = await getLessonById(db, lessonId);
  if (!existing) return { ok: false, error: "Lesson not found." };

  await setQuizStatus(db, lessonId, status, auth.founderId);
  await recordAuditLog(db, {
    founderId: auth.founderId,
    action: status === "published" ? "CONTENT_PUBLISHED" : status === "archived" ? "CONTENT_ARCHIVED" : "CONTENT_UNPUBLISHED",
    entityType: "quiz",
    entityId: lessonId,
    metadata: { day: existing.day },
  });
  revalidatePath("/founder/quizzes");
  revalidatePath(`/founder/quizzes/${lessonId}`);
  revalidatePath(`/learn/day/${existing.day}`);
  return { ok: true };
}
