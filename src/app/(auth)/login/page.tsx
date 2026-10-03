"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, type FormState } from "../actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState<FormState, FormData>(login, undefined);

  return (
    <div className="card p-6">
      <h1 className="text-xl font-semibold mb-1">Log in</h1>
      <p className="text-sm text-muted mb-6">Welcome back. Pick up right where you left off.</p>

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
        <div>
          <label htmlFor="password" className="text-sm font-medium mb-1 block">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary"
          />
          {state?.fieldErrors?.password && <p className="text-xs text-danger mt-1">{state.fieldErrors.password[0]}</p>}
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
          {pending ? "Logging in…" : "Log in"}
        </button>
      </form>

      <div className="flex items-center justify-between mt-4 text-xs">
        <Link href="/forgot-password" className="text-muted hover:text-foreground">
          Forgot password?
        </Link>
        <Link href="/signup" className="text-primary hover:underline">
          Create an account
        </Link>
      </div>
    </div>
  );
}
