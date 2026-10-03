"use client";

import { useActionState } from "react";
import { updateFormulaEntryAction, type FormState } from "../../../content-actions";
import { FORMULA_CATEGORIES } from "@/lib/content/cms-categories";
import type { FormulaEntryRow } from "@/lib/db/content-queries";

export function EditFormulaForm({ entry }: { entry: FormulaEntryRow }) {
  const action = updateFormulaEntryAction.bind(null, entry.id);
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, undefined);

  return (
    <form action={formAction} className="space-y-4 max-w-xl">
      {state?.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}
      {state?.success && <p className="text-sm text-success">{state.success}</p>}

      <div>
        <label htmlFor="name" className="text-sm font-medium block mb-1">Name</label>
        <input id="name" name="name" defaultValue={entry.name} required className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {state?.fieldErrors?.name && <p className="text-xs text-danger mt-1">{state.fieldErrors.name[0]}</p>}
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Id</label>
        <p className="text-sm text-muted">{entry.id} (fixed — this formula&apos;s permanent identifier)</p>
      </div>

      <div>
        <label htmlFor="category" className="text-sm font-medium block mb-1">Category</label>
        <select id="category" name="category" defaultValue={entry.category} required className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary">
          {FORMULA_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {state?.fieldErrors?.category && <p className="text-xs text-danger mt-1">{state.fieldErrors.category[0]}</p>}
      </div>

      <div>
        <label htmlFor="expression" className="text-sm font-medium block mb-1">Expression</label>
        <input id="expression" name="expression" defaultValue={entry.expression} required className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm font-mono outline-none focus-visible:border-primary" />
        {state?.fieldErrors?.expression && <p className="text-xs text-danger mt-1">{state.fieldErrors.expression[0]}</p>}
      </div>

      <div>
        <label htmlFor="explanation" className="text-sm font-medium block mb-1">Explanation</label>
        <textarea id="explanation" name="explanation" defaultValue={entry.explanation} required rows={3} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {state?.fieldErrors?.explanation && <p className="text-xs text-danger mt-1">{state.fieldErrors.explanation[0]}</p>}
      </div>

      <div>
        <label htmlFor="example" className="text-sm font-medium block mb-1">Worked example</label>
        <textarea id="example" name="example" defaultValue={entry.example} required rows={2} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {state?.fieldErrors?.example && <p className="text-xs text-danger mt-1">{state.fieldErrors.example[0]}</p>}
      </div>

      <div className="pt-2">
        <button type="submit" disabled={pending} className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
          Save changes
        </button>
      </div>
    </form>
  );
}
