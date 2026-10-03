import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getDb } from "@/lib/db/client";
import { getLessonById } from "@/lib/db/lesson-queries";
import { ContentStatusBadge } from "@/components/founder/ContentStatusBadge";
import { ContentStatusActions } from "@/components/founder/ContentStatusActions";
import { setLessonStatusAction } from "../../../lesson-actions";
import { EditLessonForm } from "./EditLessonForm";

export const metadata: Metadata = { title: "Founder · Edit lesson" };
export const dynamic = "force-dynamic";

export default async function FounderLessonEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = await getLessonById(getDb(), id);
  if (!lesson) notFound();

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-1">
        <h1 className="text-2xl font-bold">Day {lesson.day}: {lesson.title}</h1>
        <ContentStatusBadge status={lesson.status} />
      </div>
      <div className="mb-6 flex items-center gap-3">
        <ContentStatusActions id={lesson.id} status={lesson.status} setStatus={setLessonStatusAction} />
        <Link href={`/founder/lessons/${lesson.id}/preview`} className="text-xs rounded-md border border-border px-2 py-1 hover:bg-bg-elevated transition-colors">
          Preview as learner
        </Link>
      </div>

      <EditLessonForm lesson={lesson} />
    </div>
  );
}
