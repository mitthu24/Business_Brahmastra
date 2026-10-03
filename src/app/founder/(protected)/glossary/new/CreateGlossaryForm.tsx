"use client";

import { useActionState } from "react";
import { createGlossaryEntryAction, type FormState } from "../../../content-actions";

export function CreateGlossaryForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(createGlossaryEntryAction, undefined);

  return (
    <form action={formAction} className="space-y-4 max-w-xl">
      {state?.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}

      <div>
        <label htmlFor="term" className="text-sm font-medium block mb-1">Term</label>
        <input id="term" name="term" required className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {state?.fieldErrors?.term && <p className="text-xs text-danger mt-1">{state.fieldErrors.term[0]}</p>}
      </div>

      <div>
        <label htmlFor="slug" className="text-sm font-medium block mb-1">Slug (optional — derived from term if left blank)</label>
        <input id="slug" name="slug" placeholder="e.g. gross-margin" className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {state?.fieldErrors?.slug && <p className="text-xs text-danger mt-1">{state.fieldErrors.slug[0]}</p>}
      </div>

      <div>
        <label htmlFor="definition" className="text-sm font-medium block mb-1">Definition</label>
        <textarea id="definition" name="definition" required rows={3} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {state?.fieldErrors?.definition && <p className="text-xs text-danger mt-1">{state.fieldErrors.definition[0]}</p>}
      </div>

      <div>
        <label htmlFor="example" className="text-sm font-medium block mb-1">Example</label>
        <textarea id="example" name="example" required rows={2} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {state?.fieldErrors?.example && <p className="text-xs text-danger mt-1">{state.fieldErrors.example[0]}</p>}
      </div>

      <div>
        <label htmlFor="formula" className="text-sm font-medium block mb-1">Formula (optional)</label>
        <input id="formula" name="formula" className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
      </div>

      <div>
        <label htmlFor="mnemonic" className="text-sm font-medium block mb-1">Mnemonic (optional)</label>
        <input id="mnemonic" name="mnemonic" className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
      </div>

      <div>
        <label htmlFor="relatedTerms" className="text-sm font-medium block mb-1">Related terms (comma-separated)</label>
        <input id="relatedTerms" name="relatedTerms" placeholder="Profit, Revenue" className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
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
