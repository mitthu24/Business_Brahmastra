"use client";

import { useActionState } from "react";
import { use } from "react";
import { resetPassword, type FormState } from "../../actions";

export default function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [state, action, pending] = useActionState<FormState, FormData>(resetPassword, undefined);

  return (
    <div className="card p-6">
      <h1 className="text-xl font-semibold mb-1">Choose a new password</h1>
      <p className="text-sm text-muted mb-6">This link is valid for a limited time and can only be used once.</p>

      <form action={action} className="space-y-4">
        <input type="hidden" name="token" value={token} />
        <div>
          <label htmlFor="password" className="text-sm font-medium mb-1 block">
            New password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary"
          />
          {state?.fieldErrors?.password && <p className="text-xs text-danger mt-1">{state.fieldErrors.password[0]}</p>}
        </div>
        <div>
          <label htmlFor="confirmPassword" className="text-sm font-medium mb-1 block">
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

        {state?.error && (
          <p role="alert" className="text-sm text-danger">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {pending ? "Saving…" : "Set new password"}
        </button>
      </form>
    </div>
  );
}
