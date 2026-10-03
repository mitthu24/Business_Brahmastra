"use client";

import { useActionState } from "react";
import { createFormulaEntryAction, type FormState } from "../../../content-actions";
import { FORMULA_CATEGORIES } from "@/lib/content/cms-categories";

export function CreateFormulaForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(createFormulaEntryAction, undefined);

  return (
    <form action={formAction} className="space-y-4 max-w-xl">
      {state?.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}

      <div>
        <label htmlFor="name" className="text-sm font-medium block mb-1">Name</label>
        <input id="name" name="name" required className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {state?.fieldErrors?.name && <p className="text-xs text-danger mt-1">{state.fieldErrors.name[0]}</p>}
      </div>

      <div>
        <label htmlFor="id" className="text-sm font-medium block mb-1">Id (optional — derived from name if left blank)</label>
        <input id="id" name="id" placeholder="e.g. gross-margin" className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {state?.fieldErrors?.id && <p className="text-xs text-danger mt-1">{state.fieldErrors.id[0]}</p>}
      </div>

      <div>
        <label htmlFor="category" className="text-sm font-medium block mb-1">Category</label>
        <select id="category" name="category" required className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary">
          {FORMULA_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {state?.fieldErrors?.category && <p className="text-xs text-danger mt-1">{state.fieldErrors.category[0]}</p>}
      </div>

      <div>
        <label htmlFor="expression" className="text-sm font-medium block mb-1">Expression</label>
        <input id="expression" name="expression" required className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm font-mono outline-none focus-visible:border-primary" />
        {state?.fieldErrors?.expression && <p className="text-xs text-danger mt-1">{state.fieldErrors.expression[0]}</p>}
      </div>

      <div>
        <label htmlFor="explanation" className="text-sm font-medium block mb-1">Explanation</label>
        <textarea id="explanation" name="explanation" required rows={3} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {state?.fieldErrors?.explanation && <p className="text-xs text-danger mt-1">{state.fieldErrors.explanation[0]}</p>}
      </div>

      <div>
        <label htmlFor="example" className="text-sm font-medium block mb-1">Worked example</label>
        <textarea id="example" name="example" required rows={2} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {state?.fieldErrors?.example && <p className="text-xs text-danger mt-1">{state.fieldErrors.example[0]}</p>}
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
