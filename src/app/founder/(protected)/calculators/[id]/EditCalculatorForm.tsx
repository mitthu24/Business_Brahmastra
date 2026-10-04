"use client";

import { useActionState } from "react";
import { updateCalculatorEntryAction, type FormState } from "../../../calculator-actions";
import type { CalculatorEntryRow } from "@/lib/db/calculator-queries";

export function EditCalculatorForm({ entry }: { entry: CalculatorEntryRow }) {
  const action = updateCalculatorEntryAction.bind(null, entry.id);
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, undefined);

  return (
    <form action={formAction} className="space-y-4 max-w-xl">
      {state?.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}
      {state?.success && <p className="text-sm text-success">{state.success}</p>}

      <div>
        <label className="text-sm font-medium block mb-1">Slug</label>
        <p className="text-sm text-muted">{entry.id} (fixed — the calculator page&apos;s permanent route)</p>
      </div>

      <div>
        <label htmlFor="title" className="text-sm font-medium block mb-1">Title</label>
        <input id="title" name="title" defaultValue={entry.title} required className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {state?.fieldErrors?.title && <p className="text-xs text-danger mt-1">{state.fieldErrors.title[0]}</p>}
      </div>

      <div>
        <label htmlFor="description" className="text-sm font-medium block mb-1">Description</label>
        <textarea id="description" name="description" defaultValue={entry.description} required rows={2} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {state?.fieldErrors?.description && <p className="text-xs text-danger mt-1">{state.fieldErrors.description[0]}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className="text-sm font-medium block mb-1">Category</label>
          <input id="category" name="category" defaultValue={entry.category} required className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
          {state?.fieldErrors?.category && <p className="text-xs text-danger mt-1">{state.fieldErrors.category[0]}</p>}
        </div>
        <div>
          <label htmlFor="ordering" className="text-sm font-medium block mb-1">Order</label>
          <input id="ordering" name="ordering" type="number" min={0} max={1000} defaultValue={entry.ordering} required className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
          {state?.fieldErrors?.ordering && <p className="text-xs text-danger mt-1">{state.fieldErrors.ordering[0]}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="helpText" className="text-sm font-medium block mb-1">Formula documentation / help text (optional)</label>
        <textarea id="helpText" name="helpText" defaultValue={entry.helpText ?? ""} rows={3} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
      </div>

      <div className="pt-2">
        <button type="submit" disabled={pending} className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
          Save changes
        </button>
      </div>
    </form>
  );
}
