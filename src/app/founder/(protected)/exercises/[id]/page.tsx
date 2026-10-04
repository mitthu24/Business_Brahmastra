import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db/client";
import { getLessonById } from "@/lib/db/lesson-queries";
import { ContentStatusBadge } from "@/components/founder/ContentStatusBadge";
import { ContentStatusActions } from "@/components/founder/ContentStatusActions";
import { setExerciseStatusAction } from "../../../exercise-actions";
import { EditExerciseForm } from "./EditExerciseForm";
import { ExercisePreview } from "./ExercisePreview";

export const metadata: Metadata = { title: "Founder · Edit exercise" };
export const dynamic = "force-dynamic";

export default async function FounderExerciseEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = await getLessonById(getDb(), id);
  if (!lesson) notFound();

  return (
    <div className="max-w-5xl">
      <div className="flex items-center gap-3 mb-1">
        <h1 className="text-2xl font-bold">Day {lesson.day}: {lesson.title}</h1>
        <ContentStatusBadge status={lesson.exerciseStatus} />
      </div>
      <p className="text-muted mb-4 text-sm">
        Independent of the lesson&apos;s own status - archiving this only hides the exercise section; the rest of the lesson stays visible.
      </p>
      <div className="mb-6">
        <ContentStatusActions id={lesson.id} status={lesson.exerciseStatus} setStatus={setExerciseStatusAction} />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-sm font-semibold mb-3">Edit</h2>
          <EditExerciseForm lesson={lesson} />
        </div>
        <div>
          <h2 className="text-sm font-semibold mb-3">Preview — what a learner will see once published</h2>
          <ExercisePreview prompt={lesson.exercisePrompt} answer={lesson.exerciseAnswer} />
        </div>
      </div>
    </div>
  );
}
