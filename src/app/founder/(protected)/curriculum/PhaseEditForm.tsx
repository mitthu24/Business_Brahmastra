"use client";

import { useActionState, useState } from "react";
import { updatePhaseAction, type FormState } from "../../settings-actions";
import type { PhaseDisplayRow } from "@/lib/db/settings-queries";

export function PhaseEditForm({ phase }: { phase: PhaseDisplayRow }) {
  const [open, setOpen] = useState(false);
  const action = updatePhaseAction.bind(null, phase.number);
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, undefined);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs rounded-md border border-border px-2 py-1 hover:bg-bg-elevated transition-colors"
      >
        Edit phase
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-wrap items-start gap-2 max-w-2xl">
      <div className="flex-1 min-w-[160px]">
        <input
          name="name"
          defaultValue={phase.name}
          required
          placeholder="Phase name"
          className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-1.5 text-sm outline-none focus-visible:border-primary"
        />
      </div>
      <div className="flex-[2] min-w-[220px]">
        <input
          name="description"
          defaultValue={phase.description}
          required
          placeholder="Phase description"
          className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-1.5 text-sm outline-none focus-visible:border-primary"
        />
      </div>
      <button type="submit" disabled={pending} className="rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
        Save
      </button>
      <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-bg-elevated transition-colors">
        Cancel
      </button>
      {state?.error && <p role="alert" className="text-xs text-danger w-full">{state.error}</p>}
      {state?.success && <p className="text-xs text-success w-full">{state.success}</p>}
    </form>
  );
}
