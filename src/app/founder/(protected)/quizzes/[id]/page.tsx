import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db/client";
import { getLessonById } from "@/lib/db/lesson-queries";
import { ContentStatusBadge } from "@/components/founder/ContentStatusBadge";
import { ContentStatusActions } from "@/components/founder/ContentStatusActions";
import { setQuizStatusAction } from "../../../quiz-actions";
import { EditQuizForm } from "./EditQuizForm";

export const metadata: Metadata = { title: "Founder · Edit quiz" };
export const dynamic = "force-dynamic";

export default async function FounderQuizEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = await getLessonById(getDb(), id);
  if (!lesson) notFound();

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-1">
        <h1 className="text-2xl font-bold">Day {lesson.day}: {lesson.title}</h1>
        <ContentStatusBadge status={lesson.quizStatus} />
      </div>
      <p className="text-muted mb-4 text-sm">
        Independent of the lesson&apos;s own status - archiving this only hides the quiz section; the rest of the lesson stays visible.
      </p>
      <div className="mb-6">
        <ContentStatusActions id={lesson.id} status={lesson.quizStatus} setStatus={setQuizStatusAction} />
      </div>

      <EditQuizForm lesson={lesson} />
    </div>
  );
}
