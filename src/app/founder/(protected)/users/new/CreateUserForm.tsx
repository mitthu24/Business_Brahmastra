"use client";

import { useActionState, useState } from "react";
import { createUserAction, type FormState } from "../../../actions";

export function CreateUserForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(createUserAction, undefined);
  const [role, setRole] = useState<"user" | "founder">("user");

  return (
    <form action={action} className="card p-6 space-y-4">
      <div>
        <label htmlFor="name" className="text-sm font-medium mb-1 block">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="off"
          className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary"
        />
        {state?.fieldErrors?.name && <p className="text-xs text-danger mt-1">{state.fieldErrors.name[0]}</p>}
      </div>

      <div>
        <label htmlFor="email" className="text-sm font-medium mb-1 block">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="off"
          className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary"
        />
        {state?.fieldErrors?.email && <p className="text-xs text-danger mt-1">{state.fieldErrors.email[0]}</p>}
      </div>

      <div>
        <label htmlFor="password" className="text-sm font-medium mb-1 block">Password</label>
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
        <label htmlFor="confirmPassword" className="text-sm font-medium mb-1 block">Confirm password</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary"
        />
        {state?.fieldErrors?.confirmPassword && <p className="text-xs text-danger mt-1">{state.fieldErrors.confirmPassword[0]}</p>}
      </div>

      <div>
        <label htmlFor="role" className="text-sm font-medium mb-1 block">Role</label>
        <select
          id="role"
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value as "user" | "founder")}
          className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary"
        >
          <option value="user">Learner</option>
          <option value="founder">Founder</option>
        </select>
      </div>

      {role === "founder" && (
        <div className="rounded-lg border border-warning/40 bg-warning/10 p-3">
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" name="confirmFounder" className="mt-0.5" />
            <span>
              I understand this grants full founder access (user management, content, audit log) and I mean to create
              another founder account.
            </span>
          </label>
          {state?.fieldErrors?.confirmFounder && <p className="text-xs text-danger mt-1">{state.fieldErrors.confirmFounder[0]}</p>}
        </div>
      )}

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
        {pending ? "Creating…" : "Create user"}
      </button>
    </form>
  );
}
