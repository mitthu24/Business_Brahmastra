"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  activateUserAction,
  suspendUserAction,
  reactivateUserAction,
  extendTrialAction,
  resetPasswordAction,
  updateUserProfileAction,
} from "../../../actions";
import type { AccessStatus } from "@/lib/access/status";

function ActionMessage({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <p role="alert" className="text-xs text-danger mt-1">
      {error}
    </p>
  );
}

export function UserDetailActions({
  userId,
  role,
  status,
}: {
  userId: string;
  role: "user" | "founder";
  status: AccessStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [extendDays, setExtendDays] = useState(3);
  const [newPassword, setNewPassword] = useState("");
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  function run(label: string, action: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) setError(result.error ?? "Action failed.");
      else {
        setNotice(label);
        router.refresh();
      }
    });
  }

  if (role === "founder") {
    return <p className="text-sm text-muted">Founder accounts are managed by another founder via the user list.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {status !== "ACTIVE" && (
          <button
            type="button"
            disabled={pending}
            onClick={() => run("Access activated.", () => activateUserAction(userId))}
            className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-bg-elevated transition-colors disabled:opacity-50"
          >
            Activate access
          </button>
        )}
        {status !== "SUSPENDED" && (
          <button
            type="button"
            disabled={pending}
            onClick={() => run("User suspended.", () => suspendUserAction(userId))}
            className="rounded-lg border border-danger/40 text-danger px-3 py-1.5 text-sm hover:bg-danger/10 transition-colors disabled:opacity-50"
          >
            Suspend
          </button>
        )}
        {status === "SUSPENDED" && (
          <button
            type="button"
            disabled={pending}
            onClick={() => run("User reactivated.", () => reactivateUserAction(userId))}
            className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-bg-elevated transition-colors disabled:opacity-50"
          >
            Reactivate
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <div>
          <label htmlFor="extend-days" className="text-xs text-muted block mb-1">Extend trial by (days)</label>
          <input
            id="extend-days"
            type="number"
            min={1}
            max={365}
            value={extendDays}
            onChange={(e) => setExtendDays(Number(e.target.value))}
            className="w-24 rounded-lg border border-border bg-bg-elevated px-2 py-1.5 text-sm outline-none focus-visible:border-primary"
          />
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={() => run("Trial extended.", () => extendTrialAction(userId, extendDays))}
          className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-bg-elevated transition-colors disabled:opacity-50"
        >
          Extend trial
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <div>
          <label htmlFor="new-password" className="text-xs text-muted block mb-1">Reset password to</label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password (8+ chars)"
            className="w-56 rounded-lg border border-border bg-bg-elevated px-2 py-1.5 text-sm outline-none focus-visible:border-primary"
          />
        </div>
        <button
          type="button"
          disabled={pending || newPassword.length < 8}
          onClick={() =>
            run("Password reset. All of this user's sessions were signed out.", () => resetPasswordAction(userId, newPassword))
          }
          className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-bg-elevated transition-colors disabled:opacity-50"
        >
          Reset password
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <div>
          <label htmlFor="edit-name" className="text-xs text-muted block mb-1">New name (optional)</label>
          <input
            id="edit-name"
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-44 rounded-lg border border-border bg-bg-elevated px-2 py-1.5 text-sm outline-none focus-visible:border-primary"
          />
        </div>
        <div>
          <label htmlFor="edit-email" className="text-xs text-muted block mb-1">New email (optional)</label>
          <input
            id="edit-email"
            type="email"
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
            className="w-56 rounded-lg border border-border bg-bg-elevated px-2 py-1.5 text-sm outline-none focus-visible:border-primary"
          />
        </div>
        <button
          type="button"
          disabled={pending || (!editName && !editEmail)}
          onClick={() =>
            run("Profile updated.", () =>
              updateUserProfileAction(userId, { name: editName || undefined, email: editEmail || undefined })
            )
          }
          className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-bg-elevated transition-colors disabled:opacity-50"
        >
          Save changes
        </button>
      </div>

      <ActionMessage error={error} />
      {notice && <p className="text-xs text-success">{notice}</p>}
    </div>
  );
}
