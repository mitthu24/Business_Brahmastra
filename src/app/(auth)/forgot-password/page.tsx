"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPassword, type FormState } from "../actions";

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState<FormState, FormData>(forgotPassword, undefined);

  return (
    <div className="card p-6">
      <h1 className="text-xl font-semibold mb-1">Reset your password</h1>
      <p className="text-sm text-muted mb-6">Enter your account email and we&apos;ll send a reset link.</p>

      {state?.success ? (
        <p className="text-sm text-success">{state.success}</p>
      ) : (
        <form action={action} className="space-y-4">
          <div>
            <label htmlFor="email" className="text-sm font-medium mb-1 block">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary"
            />
            {state?.fieldErrors?.email && <p className="text-xs text-danger mt-1">{state.fieldErrors.email[0]}</p>}
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
            {pending ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}

      <p className="text-xs text-center mt-4">
        <Link href="/login" className="text-primary hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}
