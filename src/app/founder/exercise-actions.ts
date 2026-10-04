"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { requireFounderForApi } from "@/lib/auth/dal";
import { recordAuditLog } from "@/lib/db/audit-log";
import { getLessonById, updateLessonExercise, setExerciseStatus } from "@/lib/db/lesson-queries";
import type { ContentStatus } from "@/lib/db/content-queries";

export type FormState = { error?: string; fieldErrors?: Record<string, string[]>; success?: string } | undefined;
type ActionResult = { ok: true } | { ok: false; error: string };

/** Every exercise mutation calls this first - see docs/PHASE-5.3.md "Exercise/Quiz CMS" >
 * "Security". An exercise is a sub-field of a lesson (no standalone exercise table/id exists in
 * this app - see the Part 1 inventory), so these actions edit lessons.exercise_prompt/
 * exercise_answer and lessons.exercise_status directly rather than a duplicate table. */
async function requireFounder(): Promise<{ founderId: string } | { ok: false; error: string }> {
  const founder = await requireFounderForApi();
  if (!founder) return { ok: false, error: "Not authorized." };
  return { founderId: founder.user.id };
}

const exerciseSchema = z.object({
  exercisePrompt: z.string().trim().min(5, "Prompt must be at least 5 characters."),
  exerciseAnswer: z.string().trim().min(5, "Answer must be at least 5 characters."),
});

export async function updateExerciseAction(lessonId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const auth = await requireFounder();
  if ("error" in auth) return { error: auth.error };

  const db = getDb();
  const existing = await getLessonById(db, lessonId);
  if (!existing) return { error: "Lesson not found." };

  const parsed = exerciseSchema.safeParse({
    exercisePrompt: formData.get("exercisePrompt"),
    exerciseAnswer: formData.get("exerciseAnswer"),
  });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  await updateLessonExercise(db, lessonId, parsed.data, auth.founderId);
  await recordAuditLog(db, { founderId: auth.founderId, action: "CONTENT_UPDATED", entityType: "exercise", entityId: lessonId, metadata: { day: existing.day } });
  revalidatePath("/founder/exercises");
  revalidatePath(`/founder/exercises/${lessonId}`);
  revalidatePath(`/learn/day/${existing.day}`);
  return { success: "Saved." };
}

export async function setExerciseStatusAction(lessonId: string, status: ContentStatus): Promise<ActionResult> {
  const auth = await requireFounder();
  if ("error" in auth) return auth;
  const db = getDb();
  const existing = await getLessonById(db, lessonId);
  if (!existing) return { ok: false, error: "Lesson not found." };

  await setExerciseStatus(db, lessonId, status, auth.founderId);
  await recordAuditLog(db, {
    founderId: auth.founderId,
    action: status === "published" ? "CONTENT_PUBLISHED" : status === "archived" ? "CONTENT_ARCHIVED" : "CONTENT_UNPUBLISHED",
    entityType: "exercise",
    entityId: lessonId,
    metadata: { day: existing.day },
  });
  revalidatePath("/founder/exercises");
  revalidatePath(`/founder/exercises/${lessonId}`);
  revalidatePath(`/learn/day/${existing.day}`);
  return { ok: true };
}
