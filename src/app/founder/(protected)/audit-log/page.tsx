import type { Metadata } from "next";
import { getDb } from "@/lib/db/client";
import { listAuditLogs } from "@/lib/db/audit-log";
import { getUserProfile, findUserById } from "@/lib/db/auth-queries";

export const metadata: Metadata = { title: "Founder · Audit Log" };
export const dynamic = "force-dynamic";

const ACTION_LABEL: Record<string, string> = {
  USER_CREATED: "User created",
  USER_UPDATED: "User updated",
  USER_SUSPENDED: "User suspended",
  USER_REACTIVATED: "User reactivated",
  PASSWORD_RESET: "Password reset",
  ACCESS_GRANTED: "Access granted",
  ACCESS_REVOKED: "Access revoked",
  TRIAL_EXTENDED: "Trial extended",
};

export default async function FounderAuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; entityType?: string }>;
}) {
  const { action, entityType } = await searchParams;
  const db = getDb();
  const logs = await listAuditLogs(db, { action, entityType }, 200);

  const founderIds = [...new Set(logs.map((l) => l.founderId).filter((id): id is string => Boolean(id)))];
  const founderNames = new Map<string, string>();
  await Promise.all(
    founderIds.map(async (id) => {
      const [profile, user] = await Promise.all([getUserProfile(db, id), findUserById(db, id)]);
      founderNames.set(id, profile?.name ?? user?.email ?? id);
    })
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Audit Log</h1>
      <p className="text-muted mb-6">Every founder mutation, most recent first. Never includes passwords, hashes, or tokens.</p>

      <form className="flex flex-wrap gap-3 mb-5" method="get">
        <select
          name="action"
          defaultValue={action ?? ""}
          className="rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm"
        >
          <option value="">All actions</option>
          {Object.entries(ACTION_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          name="entityType"
          defaultValue={entityType ?? ""}
          className="rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm"
        >
          <option value="">All entity types</option>
          <option value="user">User</option>
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
                <th className="py-2.5 px-4 font-medium">When</th>
                <th className="py-2.5 px-4 font-medium">Founder</th>
                <th className="py-2.5 px-4 font-medium">Action</th>
                <th className="py-2.5 px-4 font-medium">Entity</th>
                <th className="py-2.5 px-4 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-border/50 last:border-0 align-top">
                  <td className="py-2.5 px-4 text-muted whitespace-nowrap">{log.createdAt.toLocaleString()}</td>
                  <td className="py-2.5 px-4">{log.founderId ? (founderNames.get(log.founderId) ?? log.founderId) : "—"}</td>
                  <td className="py-2.5 px-4">{ACTION_LABEL[log.action] ?? log.action}</td>
                  <td className="py-2.5 px-4 text-muted">
                    {log.entityType}
                    {log.entityId ? `:${log.entityId.slice(0, 8)}` : ""}
                  </td>
                  <td className="py-2.5 px-4 text-muted font-mono text-xs">
                    {log.metadata ? JSON.stringify(log.metadata) : "—"}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted">
                    No audit log entries yet.
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
