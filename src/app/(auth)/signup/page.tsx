"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup, type FormState } from "../actions";

export default function SignupPage() {
  const [state, action, pending] = useActionState<FormState, FormData>(signup, undefined);

  return (
    <div className="card p-6">
      <h1 className="text-xl font-semibold mb-1">Create your account</h1>
      <p className="text-sm text-muted mb-6">Your progress will sync to the cloud so it&apos;s there on any device.</p>

      <form action={action} className="space-y-4">
        <div>
          <label htmlFor="name" className="text-sm font-medium mb-1 block">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            aria-invalid={state?.fieldErrors?.name ? true : undefined}
            aria-describedby={state?.fieldErrors?.name ? "name-error" : undefined}
            className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary"
          />
          {state?.fieldErrors?.name && (
            <p id="name-error" className="text-xs text-danger mt-1">
              {state.fieldErrors.name[0]}
            </p>
          )}
        </div>
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
            aria-invalid={state?.fieldErrors?.email ? true : undefined}
            aria-describedby={state?.fieldErrors?.email ? "email-error" : undefined}
            className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary"
          />
          {state?.fieldErrors?.email && (
            <p id="email-error" className="text-xs text-danger mt-1">
              {state.fieldErrors.email[0]}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="password" className="text-sm font-medium mb-1 block">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            aria-invalid={state?.fieldErrors?.password ? true : undefined}
            aria-describedby={state?.fieldErrors?.password ? "password-error" : undefined}
            className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary"
          />
          {state?.fieldErrors?.password && (
            <p id="password-error" className="text-xs text-danger mt-1">
              {state.fieldErrors.password[0]}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="confirmPassword" className="text-sm font-medium mb-1 block">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            aria-invalid={state?.fieldErrors?.confirmPassword ? true : undefined}
            aria-describedby={state?.fieldErrors?.confirmPassword ? "confirm-password-error" : undefined}
            className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary"
          />
          {state?.fieldErrors?.confirmPassword && (
            <p id="confirm-password-error" className="text-xs text-danger mt-1">
              {state.fieldErrors.confirmPassword[0]}
            </p>
          )}
        </div>

        {state?.error && (
          <p role="alert" aria-live="polite" className="text-sm text-danger">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {pending ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="text-xs text-center mt-4">
        <span className="text-muted">Already have an account? </span>
        <Link href="/login" className="text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
