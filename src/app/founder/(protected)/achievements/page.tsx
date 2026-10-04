import type { Metadata } from "next";
import Link from "next/link";
import { getDb } from "@/lib/db/client";
import { listAchievementEntries } from "@/lib/db/achievement-queries";
import { achievements as trustedAchievements } from "@/lib/progress/achievements";
import { ContentStatusBadge } from "@/components/founder/ContentStatusBadge";
import { ContentStatusActions } from "@/components/founder/ContentStatusActions";
import { setAchievementStatusAction } from "../../achievement-actions";
import type { ContentStatus } from "@/lib/db/content-queries";

export const metadata: Metadata = { title: "Founder · Achievements" };
export const dynamic = "force-dynamic";

export default async function FounderAchievementsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;
  const rows = await listAchievementEntries(getDb(), { status: status as ContentStatus | undefined, search: q });
  const missingCount = trustedAchievements.length - rows.length;

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-1">
        <h1 className="text-2xl font-bold">Achievements</h1>
        {missingCount > 0 && (
          <Link href="/founder/achievements/new" className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap">
            Import missing ({missingCount})
          </Link>
        )}
      </div>
      <p className="text-muted mb-6">
        {rows.length} of {trustedAchievements.length} achievements in the CMS. Unlock requirements are fixed in code and
        can&apos;t be changed here - only display metadata and visibility.
      </p>

      <form className="flex flex-wrap gap-3 mb-5" method="get">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search name or description…"
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
                <th className="py-2.5 px-4 font-medium">Name</th>
                <th className="py-2.5 px-4 font-medium">Category</th>
                <th className="py-2.5 px-4 font-medium">Status</th>
                <th className="py-2.5 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} className="border-b border-border/50 last:border-0 align-top">
                  <td className="py-2.5 px-4">
                    <Link href={`/founder/achievements/${a.id}`} className="font-medium hover:underline">{a.name}</Link>
                    <p className="text-xs text-muted mt-0.5 line-clamp-1">{a.description}</p>
                  </td>
                  <td className="py-2.5 px-4 text-muted">{a.category}</td>
                  <td className="py-2.5 px-4"><ContentStatusBadge status={a.status} /></td>
                  <td className="py-2.5 px-4">
                    <ContentStatusActions id={a.id} status={a.status} setStatus={setAchievementStatusAction} />
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-muted">
                    No achievements match these filters.
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
