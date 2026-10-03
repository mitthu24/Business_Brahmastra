import type { Metadata } from "next";
import { CreateLessonForm } from "./CreateLessonForm";

export const metadata: Metadata = { title: "Founder · New lesson" };

export default async function NewLessonPage({ searchParams }: { searchParams: Promise<{ day?: string }> }) {
  const { day } = await searchParams;
  const defaultDay = day ? Number(day) : undefined;
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">New lesson</h1>
      <p className="text-muted mb-6">Saved as a draft until you publish it. Learners never see drafts.</p>
      <CreateLessonForm defaultDay={Number.isInteger(defaultDay) ? defaultDay : undefined} />
    </div>
  );
}
