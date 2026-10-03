"use client";

import { useActionState } from "react";
import { changePassword, type FormState } from "@/app/(auth)/actions";

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(changePassword, undefined);

  return (
    <form action={action} className="space-y-3">
      <div>
        <label htmlFor="currentPassword" className="text-xs font-medium mb-1 block">
          Current password
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary"
        />
        {state?.fieldErrors?.currentPassword && (
          <p className="text-xs text-danger mt-1">{state.fieldErrors.currentPassword[0]}</p>
        )}
      </div>
      <div>
        <label htmlFor="newPassword" className="text-xs font-medium mb-1 block">
          New password
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          autoComplete="new-password"
          className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary"
        />
        {state?.fieldErrors?.newPassword && <p className="text-xs text-danger mt-1">{state.fieldErrors.newPassword[0]}</p>}
      </div>
      <div>
        <label htmlFor="confirmPassword" className="text-xs font-medium mb-1 block">
          Confirm new password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary"
        />
        {state?.fieldErrors?.confirmPassword && (
          <p className="text-xs text-danger mt-1">{state.fieldErrors.confirmPassword[0]}</p>
        )}
      </div>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      {state?.success && <p className="text-sm text-success">{state.success}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {pending ? "Saving…" : "Update password"}
      </button>
    </form>
  );
}
