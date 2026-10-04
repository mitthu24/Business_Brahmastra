import type { Metadata } from "next";
import Link from "next/link";
import { getDb } from "@/lib/db/client";
import { listLessons } from "@/lib/db/lesson-queries";
import { ContentStatusBadge } from "@/components/founder/ContentStatusBadge";
import { ContentStatusActions } from "@/components/founder/ContentStatusActions";
import { setQuizStatusAction } from "../../quiz-actions";
import type { ContentStatus } from "@/lib/db/content-queries";

export const metadata: Metadata = { title: "Founder · Quizzes" };
export const dynamic = "force-dynamic";

/** A quiz is the quiz[] sub-field of a lesson - no standalone quiz entity exists in this app (see
 * docs/PHASE-5.3.md "Exercise/Quiz CMS" Part 1 inventory). */
export default async function FounderQuizzesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;
  const lessons = await listLessons(getDb(), { search: q });
  const rows = status ? lessons.filter((l) => l.quizStatus === status) : lessons;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Quizzes</h1>
      <p className="text-muted mb-6">{rows.length} quiz{rows.length === 1 ? "" : "zes"} (one per lesson day).</p>

      <form className="flex flex-wrap gap-3 mb-5" method="get">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by lesson title…"
          className="flex-1 min-w-[200px] rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary"
        />
        <select name="status" defaultValue={status ?? ""} className="rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm">
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        <button type="submit" className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-bg-elevated transition-colors">
          Filter
        </button>
      </form>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-xs text-muted border-b border-border bg-bg-elevated">
                <th className="py-2.5 px-4 font-medium">Day</th>
                <th className="py-2.5 px-4 font-medium">Lesson</th>
                <th className="py-2.5 px-4 font-medium">Questions</th>
                <th className="py-2.5 px-4 font-medium">Status</th>
                <th className="py-2.5 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => (
                <tr key={l.id} className="border-b border-border/50 last:border-0 align-top">
                  <td className="py-2.5 px-4 font-medium">{l.day}</td>
                  <td className="py-2.5 px-4">
                    <Link href={`/founder/quizzes/${l.id}`} className="hover:underline">{l.title}</Link>
                  </td>
                  <td className="py-2.5 px-4 text-muted">{l.quiz.length}</td>
                  <td className="py-2.5 px-4"><ContentStatusBadge status={l.quizStatus} /></td>
                  <td className="py-2.5 px-4">
                    <ContentStatusActions id={l.id} status={l.quizStatus as ContentStatus} setStatus={setQuizStatusAction} editHref={`/founder/quizzes/${l.id}`} />
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted">
                    No quizzes match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
