import type { Metadata } from "next";
import { getDb } from "@/lib/db/client";
import { getFounderDashboardStats } from "@/lib/db/founder-queries";
import { getLearningMetrics } from "@/lib/db/analytics-queries";
import { getContentHubStats } from "@/lib/db/content-hub-queries";
import { TOTAL_DAYS } from "@/lib/content/lessons";

export const metadata: Metadata = { title: "Founder · Analytics" };
export const dynamic = "force-dynamic";

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="card p-4">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted mt-1">{label}</p>
    </div>
  );
}

export default async function FounderAnalyticsPage() {
  const db = getDb();
  const [userStats, learning, contentStats] = await Promise.all([
    getFounderDashboardStats(db, TOTAL_DAYS),
    getLearningMetrics(db),
    getContentHubStats(db),
  ]);

  const completionRate =
    userStats.totalUsers === 0 ? 0 : Math.round((userStats.usersCompleted / userStats.totalUsers) * 100);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Analytics</h1>
        <p className="text-muted">Live figures from the database. Any metric with no data yet reads 0.</p>
      </div>

      <section>
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">User metrics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <StatCard label="Total users" value={userStats.totalUsers} />
          <StatCard label="Active users" value={userStats.activeUsers} />
          <StatCard label="Trial users" value={userStats.activeTrials} />
          <StatCard label="Expired users" value={userStats.expiredTrials} />
          <StatCard label="Suspended users" value={userStats.suspendedUsers} />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Learning metrics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Lessons started (users)" value={learning.lessonsStarted} />
          <StatCard label="Lessons completed (total)" value={learning.lessonsCompletedTotal} />
          <StatCard label="Average progress" value={`${userStats.averageProgressPercent}%`} />
          <StatCard label="Completion rate" value={`${completionRate}%`} />
          <StatCard label="Active learners" value={learning.activeLearners} />
          <StatCard label="Exercise completions" value={learning.exerciseCompletions} />
          <StatCard label="Quiz attempts" value={learning.quizAttempts} />
          <StatCard label="Case study completions" value={learning.caseStudyCompletions} />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Content metrics</h2>
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="text-left text-xs text-muted border-b border-border bg-bg-elevated">
                  <th className="py-2.5 px-4 font-medium">Type</th>
                  <th className="py-2.5 px-4 font-medium">Published</th>
                  <th className="py-2.5 px-4 font-medium">Draft</th>
                  <th className="py-2.5 px-4 font-medium">Archived</th>
                  <th className="py-2.5 px-4 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {contentStats.map((s) => (
                  <tr key={s.key} className="border-b border-border/50 last:border-0">
                    <td className="py-2.5 px-4 font-medium">{s.label}</td>
                    <td className="py-2.5 px-4 text-success">{s.published}</td>
                    <td className="py-2.5 px-4">{s.draft}</td>
                    <td className="py-2.5 px-4 text-danger">{s.archived}</td>
                    <td className="py-2.5 px-4 text-muted">{s.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
