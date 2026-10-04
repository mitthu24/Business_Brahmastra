import type { Metadata } from "next";
import Link from "next/link";
import { getDb } from "@/lib/db/client";
import { getContentHubStats, getRecentContentActivity } from "@/lib/db/content-hub-queries";

export const metadata: Metadata = { title: "Founder · Content" };
export const dynamic = "force-dynamic";

function formatAction(action: string): string {
  return action.replace(/_/g, " ").toLowerCase().replace(/^./, (c) => c.toUpperCase());
}

export default async function FounderContentPage() {
  const db = getDb();
  const [stats, recent] = await Promise.all([getContentHubStats(db), getRecentContentActivity(db)]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Content</h1>
      <p className="text-muted mb-6">Every founder-manageable content type in one place, with live counts from the database.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.key} className="card p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{s.label}</h2>
              <span className="text-xs text-muted">{s.total} total</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-lg font-bold text-success">{s.published}</p>
                <p className="text-[11px] text-muted">Published</p>
              </div>
              <div>
                <p className="text-lg font-bold">{s.draft}</p>
                <p className="text-[11px] text-muted">Draft</p>
              </div>
              <div>
                <p className="text-lg font-bold text-danger">{s.archived}</p>
                <p className="text-[11px] text-muted">Archived</p>
              </div>
            </div>
            <p className="text-xs text-muted">
              {s.lastUpdated ? `Updated ${s.lastUpdated.toLocaleDateString()}` : "No content yet"}
            </p>
            <Link
              href={s.manageHref}
              className="mt-auto text-center rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-bg-elevated transition-colors"
            >
              Manage
            </Link>
          </div>
        ))}
      </div>

      <section className="card p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="font-semibold text-sm">Recent content changes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="text-left text-xs text-muted border-b border-border bg-bg-elevated">
                <th className="py-2.5 px-4 font-medium">Action</th>
                <th className="py-2.5 px-4 font-medium">Type</th>
                <th className="py-2.5 px-4 font-medium">Entity</th>
                <th className="py-2.5 px-4 font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((r) => (
                <tr key={r.id} className="border-b border-border/50 last:border-0">
                  <td className="py-2.5 px-4">{formatAction(r.action)}</td>
                  <td className="py-2.5 px-4 text-muted">{r.entityType.replace(/_/g, " ")}</td>
                  <td className="py-2.5 px-4 text-muted font-mono text-xs">{r.entityId ?? "—"}</td>
                  <td className="py-2.5 px-4 text-muted whitespace-nowrap">{r.createdAt.toLocaleString()}</td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-muted">
                    No content changes recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
