import type { Metadata } from "next";
import Link from "next/link";
import { getDb } from "@/lib/db/client";
import { listCalculatorEntries } from "@/lib/db/calculator-queries";
import { ContentStatusBadge } from "@/components/founder/ContentStatusBadge";
import { ContentStatusActions } from "@/components/founder/ContentStatusActions";
import { setCalculatorStatusAction } from "../../calculator-actions";
import type { ContentStatus } from "@/lib/db/content-queries";

export const metadata: Metadata = { title: "Founder · Calculators" };
export const dynamic = "force-dynamic";

/** No "new calculator" link here (docs/PHASE-5.3.md "Calculator CMS"): a new calculator needs
 * real trusted compute code (src/lib/calculators.ts) and a page, not a CMS row, so there is no
 * create flow - only metadata management for the 12 that already exist. */
export default async function FounderCalculatorsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;
  const rows = await listCalculatorEntries(getDb(), { status: status as ContentStatus | undefined, search: q });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Calculators</h1>
      <p className="text-muted mb-6">
        {rows.length} calculator{rows.length === 1 ? "" : "s"}. The calculation logic stays trusted application
        code - this manages only the directory listing.
      </p>

      <form className="flex flex-wrap gap-3 mb-5" method="get">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search title or description…"
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
                <th className="py-2.5 px-4 font-medium">Order</th>
                <th className="py-2.5 px-4 font-medium">Title</th>
                <th className="py-2.5 px-4 font-medium">Category</th>
                <th className="py-2.5 px-4 font-medium">Status</th>
                <th className="py-2.5 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-b border-border/50 last:border-0 align-top">
                  <td className="py-2.5 px-4 text-muted">{c.ordering}</td>
                  <td className="py-2.5 px-4">
                    <Link href={`/founder/calculators/${c.id}`} className="font-medium hover:underline">{c.title}</Link>
                    <p className="text-xs text-muted mt-0.5 line-clamp-1">{c.description}</p>
                  </td>
                  <td className="py-2.5 px-4 text-muted">{c.category}</td>
                  <td className="py-2.5 px-4"><ContentStatusBadge status={c.status} /></td>
                  <td className="py-2.5 px-4">
                    <ContentStatusActions id={c.id} status={c.status} setStatus={setCalculatorStatusAction} />
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted">
                    No calculators match these filters.
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
