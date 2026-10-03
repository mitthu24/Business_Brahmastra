import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserForApi, requireActiveAccessForApi } from "@/lib/auth/dal";
import { getDb } from "@/lib/db/client";
import {
  getProgressSnapshot,
  completeDayTx,
  completeExerciseTx,
  completeCaseStudyTx,
  submitQuizTx,
  completeFinalProjectTx,
  saveReflectionTx,
} from "@/lib/db/progress-queries";

export const dynamic = "force-dynamic";

const quizAnswerSchema = z.object({
  questionId: z.string(),
  selectedIndex: z.number(),
  correctIndex: z.number(),
});

const bodySchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("completeDay"), day: z.number().int().positive() }),
  z.object({ action: z.literal("completeExercise"), day: z.number().int().positive() }),
  z.object({ action: z.literal("completeCaseStudy"), day: z.number().int().positive() }),
  z.object({ action: z.literal("submitQuiz"), day: z.number().int().positive(), answers: z.array(quizAnswerSchema) }),
  z.object({ action: z.literal("completeFinalProject") }),
  z.object({
    action: z.literal("saveReflection"),
    lessonId: z.string(),
    learned: z.string().max(5000),
    application: z.string().max(5000),
  }),
]);

export async function GET() {
  const session = await requireUserForApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const snapshot = await getProgressSnapshot(getDb(), session.userId);
    return NextResponse.json(snapshot);
  } catch {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  // Completing a lesson/exercise/quiz/reflection/final-project step is a protected learning
  // action, so it is gated on live access status (not just authentication) - see docs/PHASE-5.md.
  const access = await requireActiveAccessForApi();
  if (!access.ok) {
    if (access.code === "UNAUTHENTICATED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Your access has ended.", accessStatus: access.status }, { status: 403 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const db = getDb();
  const userId = access.userId;

  try {
    const body = parsed.data;
    switch (body.action) {
      case "completeDay": {
        const snapshot = await completeDayTx(db, userId, body.day);
        return NextResponse.json(snapshot);
      }
      case "completeExercise": {
        const snapshot = await completeExerciseTx(db, userId, body.day);
        return NextResponse.json(snapshot);
      }
      case "completeCaseStudy": {
        const snapshot = await completeCaseStudyTx(db, userId, body.day);
        return NextResponse.json(snapshot);
      }
      case "submitQuiz": {
        const { snapshot } = await submitQuizTx(db, userId, body.day, body.answers);
        return NextResponse.json(snapshot);
      }
      case "completeFinalProject": {
        const snapshot = await completeFinalProjectTx(db, userId);
        return NextResponse.json(snapshot);
      }
      case "saveReflection": {
        const snapshot = await saveReflectionTx(db, userId, body.lessonId, body.learned, body.application);
        return NextResponse.json(snapshot);
      }
    }
  } catch (err) {
    console.error("progress sync failed", err);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}
