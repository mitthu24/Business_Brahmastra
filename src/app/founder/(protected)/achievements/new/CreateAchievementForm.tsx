"use client";

import { useActionState } from "react";
import { createAchievementEntryAction, type FormState } from "../../../achievement-actions";
import type { Achievement } from "@/lib/progress/achievements";

export function CreateAchievementForm({ missing }: { missing: Achievement[] }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(createAchievementEntryAction, undefined);

  return (
    <form action={formAction} className="space-y-4 max-w-xl">
      {state?.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}

      <div>
        <label htmlFor="id" className="text-sm font-medium block mb-1">Achievement</label>
        <select
          id="id"
          name="id"
          required
          onChange={(e) => {
            const match = missing.find((m) => m.id === e.target.value);
            const form = e.currentTarget.form;
            if (match && form) {
              (form.elements.namedItem("name") as HTMLInputElement).value = match.title;
              (form.elements.namedItem("description") as HTMLTextAreaElement).value = match.description;
              (form.elements.namedItem("icon") as HTMLInputElement).value = match.icon;
            }
          }}
          className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary"
        >
          {missing.map((m) => (
            <option key={m.id} value={m.id}>{m.title} ({m.id})</option>
          ))}
        </select>
        <p className="text-xs text-muted mt-1">Only achievements the unlock engine already knows about - you can&apos;t invent a new id here.</p>
        {state?.fieldErrors?.id && <p className="text-xs text-danger mt-1">{state.fieldErrors.id[0]}</p>}
      </div>

      <div>
        <label htmlFor="name" className="text-sm font-medium block mb-1">Name</label>
        <input id="name" name="name" defaultValue={missing[0]?.title} required className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {state?.fieldErrors?.name && <p className="text-xs text-danger mt-1">{state.fieldErrors.name[0]}</p>}
      </div>

      <div>
        <label htmlFor="description" className="text-sm font-medium block mb-1">Description</label>
        <textarea id="description" name="description" defaultValue={missing[0]?.description} required rows={2} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {state?.fieldErrors?.description && <p className="text-xs text-danger mt-1">{state.fieldErrors.description[0]}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="icon" className="text-sm font-medium block mb-1">Icon</label>
          <input id="icon" name="icon" defaultValue={missing[0]?.icon} required className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
          {state?.fieldErrors?.icon && <p className="text-xs text-danger mt-1">{state.fieldErrors.icon[0]}</p>}
        </div>
        <div>
          <label htmlFor="category" className="text-sm font-medium block mb-1">Category</label>
          <input id="category" name="category" defaultValue="Milestone" required className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
          {state?.fieldErrors?.category && <p className="text-xs text-danger mt-1">{state.fieldErrors.category[0]}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="xp" className="text-sm font-medium block mb-1">XP (display only — not wired to actual XP awarded)</label>
        <input id="xp" name="xp" type="number" min={0} max={10000} defaultValue={0} required className="w-32 rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {state?.fieldErrors?.xp && <p className="text-xs text-danger mt-1">{state.fieldErrors.xp[0]}</p>}
      </div>

      <div className="flex gap-2 pt-2">
        <button type="submit" name="intent" value="draft" disabled={pending} className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-bg-elevated transition-colors disabled:opacity-50">
          Save as draft
        </button>
        <button type="submit" name="intent" value="publish" disabled={pending} className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
          Publish
        </button>
      </div>
    </form>
  );
}
