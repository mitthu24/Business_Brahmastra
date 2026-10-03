import type { Metadata } from "next";
import Link from "next/link";
import { getDb } from "@/lib/db/client";
import { getFounderDashboardStats } from "@/lib/db/founder-queries";

export const metadata: Metadata = { title: "Founder Dashboard" };
export const dynamic = "force-dynamic";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-muted mb-1">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

export default async function FounderDashboardPage() {
  const stats = await getFounderDashboardStats(getDb());

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Founder Dashboard</h1>
      <p className="text-muted mb-6">Learner activity and access overview.</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <StatCard label="Total learners" value={stats.totalUsers} />
        <StatCard label="Active trials" value={stats.activeTrials} />
        <StatCard label="Expired trials" value={stats.expiredTrials} />
        <StatCard label="Active access" value={stats.activeUsers} />
        <StatCard label="Suspended" value={stats.suspendedUsers} />
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Recent signups</h2>
          <Link href="/founder/users" className="text-xs text-primary hover:underline">
            View all users →
          </Link>
        </div>
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm min-w-[480px]">
            <thead>
              <tr className="text-left text-xs text-muted border-b border-border">
                <th className="py-2 pr-4 font-medium">Name</th>
                <th className="py-2 pr-4 font-medium">Email</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium">Signed up</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentSignups.map((u) => (
                <tr key={u.id} className="border-b border-border/50 last:border-0">
                  <td className="py-2 pr-4">{u.name ?? "—"}</td>
                  <td className="py-2 pr-4 text-muted">{u.email}</td>
                  <td className="py-2 pr-4">{u.status}</td>
                  <td className="py-2 pr-4 text-muted whitespace-nowrap">{u.createdAt.toLocaleDateString()}</td>
                </tr>
              ))}
              {stats.recentSignups.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-muted">
                    No signups yet.
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
