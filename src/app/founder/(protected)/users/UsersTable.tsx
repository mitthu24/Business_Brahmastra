"use client";

import { useState, useTransition } from "react";
import type { FounderUserRow } from "@/lib/db/founder-queries";
import { activateUserAction, suspendUserAction, reactivateUserAction } from "../../actions";

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: "bg-success/15 text-success",
  TRIAL: "bg-primary/15 text-primary",
  EXPIRED: "bg-muted/15 text-muted",
  SUSPENDED: "bg-danger/15 text-danger",
};

function StatusPill({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[status] ?? ""}`}>
      {status}
    </span>
  );
}

function RowActions({ user }: { user: FounderUserRow }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(action: (id: string) => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action(user.id);
      if (!result.ok) setError(result.error ?? "Action failed.");
    });
  }

  if (user.role === "founder") {
    return <span className="text-xs text-muted">—</span>;
  }

  return (
    <div className="flex flex-col gap-1 items-start">
      <div className="flex flex-wrap gap-1.5">
        {user.status !== "ACTIVE" && (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(activateUserAction)}
            className="rounded-md border border-border px-2 py-1 text-xs font-medium hover:bg-bg-elevated transition-colors disabled:opacity-50"
          >
            Activate
          </button>
        )}
        {user.status !== "SUSPENDED" && (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(suspendUserAction)}
            className="rounded-md border border-danger/40 text-danger px-2 py-1 text-xs font-medium hover:bg-danger/10 transition-colors disabled:opacity-50"
          >
            Suspend
          </button>
        )}
        {user.status === "SUSPENDED" && (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(reactivateUserAction)}
            className="rounded-md border border-border px-2 py-1 text-xs font-medium hover:bg-bg-elevated transition-colors disabled:opacity-50"
          >
            Reactivate
          </button>
        )}
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

export function UsersTable({ users }: { users: FounderUserRow[] }) {
  return (
    <div className="card p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="text-left text-xs text-muted border-b border-border bg-bg-elevated">
              <th className="py-2.5 px-4 font-medium">Name</th>
              <th className="py-2.5 px-4 font-medium">Email</th>
              <th className="py-2.5 px-4 font-medium">Status</th>
              <th className="py-2.5 px-4 font-medium">Days learned</th>
              <th className="py-2.5 px-4 font-medium">Trial ends</th>
              <th className="py-2.5 px-4 font-medium">Signed up</th>
              <th className="py-2.5 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border/50 last:border-0 align-top">
                <td className="py-2.5 px-4">{u.name ?? "—"}</td>
                <td className="py-2.5 px-4 text-muted">{u.email}</td>
                <td className="py-2.5 px-4">
                  <StatusPill status={u.role === "founder" ? "FOUNDER" : u.status} />
                </td>
                <td className="py-2.5 px-4">{u.completedDays}</td>
                <td className="py-2.5 px-4 text-muted whitespace-nowrap">{new Date(u.trialEndsAt).toLocaleDateString()}</td>
                <td className="py-2.5 px-4 text-muted whitespace-nowrap">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="py-2.5 px-4">
                  <RowActions user={u} />
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-muted">
                  No users yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
