import type { Metadata } from "next";
import Link from "next/link";
import { getDb } from "@/lib/db/client";
import { listLessons } from "@/lib/db/lesson-queries";
import { phases } from "@/lib/content/phases";
import { ContentStatusBadge } from "@/components/founder/ContentStatusBadge";
import { ContentStatusActions } from "@/components/founder/ContentStatusActions";
import { setLessonStatusAction } from "../../lesson-actions";
import type { ContentStatus } from "@/lib/db/content-queries";

export const metadata: Metadata = { title: "Founder · Lessons" };
export const dynamic = "force-dynamic";

export default async function FounderLessonsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; phaseId?: string; q?: string }>;
}) {
  const { status, phaseId, q } = await searchParams;
  const rows = await listLessons(getDb(), {
    status: status as ContentStatus | undefined,
    phaseId,
    search: q,
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-1">
        <h1 className="text-2xl font-bold">Lessons</h1>
        <Link
          href="/founder/lessons/new"
          className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          New lesson
        </Link>
      </div>
      <p className="text-muted mb-6">{rows.length} lesson{rows.length === 1 ? "" : "s"} migrated into the CMS (of 90 total).</p>

      <form className="flex flex-wrap gap-3 mb-5" method="get">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search title or objective…"
          className="flex-1 min-w-[200px] rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary"
        />
        <select name="phaseId" defaultValue={phaseId ?? ""} className="rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm">
          <option value="">All phases</option>
          {phases.map((p) => (
            <option key={p.id} value={p.id}>Phase {p.number}: {p.title}</option>
          ))}
        </select>
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
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-xs text-muted border-b border-border bg-bg-elevated">
                <th className="py-2.5 px-4 font-medium">Day</th>
                <th className="py-2.5 px-4 font-medium">Title</th>
                <th className="py-2.5 px-4 font-medium">Status</th>
                <th className="py-2.5 px-4 font-medium">Updated</th>
                <th className="py-2.5 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border/50 last:border-0 align-top">
                  <td className="py-2.5 px-4 font-medium">{row.day}</td>
                  <td className="py-2.5 px-4">
                    <Link href={`/founder/lessons/${row.id}`} className="hover:underline">{row.title}</Link>
                  </td>
                  <td className="py-2.5 px-4"><ContentStatusBadge status={row.status} /></td>
                  <td className="py-2.5 px-4 text-muted whitespace-nowrap">{row.updatedAt.toLocaleDateString()}</td>
                  <td className="py-2.5 px-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/founder/lessons/${row.id}/preview`} className="text-xs rounded-md border border-border px-2 py-1 hover:bg-bg-elevated transition-colors">
                        Preview
                      </Link>
                      <ContentStatusActions id={row.id} status={row.status} setStatus={setLessonStatusAction} />
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted">
                    No lessons match these filters.
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
