"use client";

import { useActionState } from "react";
import { updateAchievementEntryAction, type FormState } from "../../../achievement-actions";
import type { AchievementEntryRow } from "@/lib/db/achievement-queries";

export function EditAchievementForm({ entry }: { entry: AchievementEntryRow }) {
  const action = updateAchievementEntryAction.bind(null, entry.id);
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, undefined);

  return (
    <form action={formAction} className="space-y-4 max-w-xl">
      {state?.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}
      {state?.success && <p className="text-sm text-success">{state.success}</p>}

      <div>
        <label className="text-sm font-medium block mb-1">Id</label>
        <p className="text-sm text-muted">{entry.id} (fixed — tied to the unlock engine)</p>
      </div>

      <div>
        <label htmlFor="name" className="text-sm font-medium block mb-1">Name</label>
        <input id="name" name="name" defaultValue={entry.name} required className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {state?.fieldErrors?.name && <p className="text-xs text-danger mt-1">{state.fieldErrors.name[0]}</p>}
      </div>

      <div>
        <label htmlFor="description" className="text-sm font-medium block mb-1">Description</label>
        <textarea id="description" name="description" defaultValue={entry.description} required rows={2} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {state?.fieldErrors?.description && <p className="text-xs text-danger mt-1">{state.fieldErrors.description[0]}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="icon" className="text-sm font-medium block mb-1">Icon</label>
          <input id="icon" name="icon" defaultValue={entry.icon} required className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
          {state?.fieldErrors?.icon && <p className="text-xs text-danger mt-1">{state.fieldErrors.icon[0]}</p>}
        </div>
        <div>
          <label htmlFor="category" className="text-sm font-medium block mb-1">Category</label>
          <input id="category" name="category" defaultValue={entry.category} required className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
          {state?.fieldErrors?.category && <p className="text-xs text-danger mt-1">{state.fieldErrors.category[0]}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="xp" className="text-sm font-medium block mb-1">XP (display only — not wired to actual XP awarded)</label>
        <input id="xp" name="xp" type="number" min={0} max={10000} defaultValue={entry.xp} required className="w-32 rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {state?.fieldErrors?.xp && <p className="text-xs text-danger mt-1">{state.fieldErrors.xp[0]}</p>}
      </div>

      <div className="pt-2">
        <button type="submit" disabled={pending} className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
          Save changes
        </button>
      </div>
    </form>
  );
}
