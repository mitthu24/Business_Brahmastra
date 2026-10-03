import type { Metadata } from "next";
import Link from "next/link";
import { getDb } from "@/lib/db/client";
import { getFounderDashboardStats } from "@/lib/db/founder-queries";
import { TOTAL_DAYS } from "@/lib/content/lessons";

export const metadata: Metadata = { title: "Founder Dashboard" };
export const dynamic = "force-dynamic";

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-muted mb-1">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

export default async function FounderDashboardPage() {
  const stats = await getFounderDashboardStats(getDb(), TOTAL_DAYS);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Founder Dashboard</h1>
      <p className="text-muted mb-6">Learner activity, access and content overview.</p>

      <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Users &amp; access</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <StatCard label="Total learners" value={stats.totalUsers} />
        <StatCard label="Active trials" value={stats.activeTrials} />
        <StatCard label="Active access" value={stats.activeUsers} />
        <StatCard label="Expired trials" value={stats.expiredTrials} />
        <StatCard label="Suspended" value={stats.suspendedUsers} />
      </div>

      <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Content</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total lessons" value={TOTAL_DAYS} />
        <StatCard label="Published lessons" value={TOTAL_DAYS} />
        <StatCard label="Draft lessons" value={0} />
      </div>
      <p className="text-xs text-muted mb-6 -mt-3">
        Content is currently static application code, not yet database-managed - see{" "}
        <Link href="/founder/content" className="text-primary hover:underline">
          Content
        </Link>{" "}
        for the CMS roadmap.
      </p>

      <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Learning activity</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Lessons completed" value={stats.totalLessonsCompleted} />
        <StatCard label="Average progress" value={`${stats.averageProgressPercent}%`} />
        <StatCard label="Users started" value={stats.usersStarted} />
        <StatCard label="Users completed" value={stats.usersCompleted} />
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Recent signups</h2>
          <Link href="/founder/users" className="text-xs text-primary hover:underline">
            View all users →
          </Link>
        </div>
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="text-left text-xs text-muted border-b border-border">
                <th className="py-2 pr-4 font-medium">Name</th>
                <th className="py-2 pr-4 font-medium">Email</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium">Progress</th>
                <th className="py-2 pr-4 font-medium">Signed up</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentSignups.map((u) => (
                <tr key={u.id} className="border-b border-border/50 last:border-0">
                  <td className="py-2 pr-4">
                    <Link href={`/founder/users/${u.id}`} className="hover:underline">
                      {u.name ?? "—"}
                    </Link>
                  </td>
                  <td className="py-2 pr-4 text-muted">{u.email}</td>
                  <td className="py-2 pr-4">{u.role === "founder" ? "FOUNDER" : u.status}</td>
                  <td className="py-2 pr-4 text-muted">{u.completedDays}/{TOTAL_DAYS}</td>
                  <td className="py-2 pr-4 text-muted whitespace-nowrap">{u.createdAt.toLocaleDateString()}</td>
                </tr>
              ))}
              {stats.recentSignups.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-muted">
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
