"use client";

import { useActionState } from "react";
import { updateGlossaryEntryAction, type FormState } from "../../../content-actions";
import type { GlossaryEntryRow } from "@/lib/db/content-queries";

export function EditGlossaryForm({ entry }: { entry: GlossaryEntryRow }) {
  const action = updateGlossaryEntryAction.bind(null, entry.id);
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, undefined);

  return (
    <form action={formAction} className="space-y-4 max-w-xl">
      {state?.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}
      {state?.success && <p className="text-sm text-success">{state.success}</p>}

      <div>
        <label htmlFor="term" className="text-sm font-medium block mb-1">Term</label>
        <input id="term" name="term" defaultValue={entry.term} required className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {state?.fieldErrors?.term && <p className="text-xs text-danger mt-1">{state.fieldErrors.term[0]}</p>}
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Slug</label>
        <p className="text-sm text-muted">{entry.slug} (fixed — the slug is this term&apos;s permanent identifier)</p>
      </div>

      <div>
        <label htmlFor="definition" className="text-sm font-medium block mb-1">Definition</label>
        <textarea id="definition" name="definition" defaultValue={entry.definition} required rows={3} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {state?.fieldErrors?.definition && <p className="text-xs text-danger mt-1">{state.fieldErrors.definition[0]}</p>}
      </div>

      <div>
        <label htmlFor="example" className="text-sm font-medium block mb-1">Example</label>
        <textarea id="example" name="example" defaultValue={entry.example} required rows={2} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {state?.fieldErrors?.example && <p className="text-xs text-danger mt-1">{state.fieldErrors.example[0]}</p>}
      </div>

      <div>
        <label htmlFor="formula" className="text-sm font-medium block mb-1">Formula (optional)</label>
        <input id="formula" name="formula" defaultValue={entry.formula ?? ""} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
      </div>

      <div>
        <label htmlFor="mnemonic" className="text-sm font-medium block mb-1">Mnemonic (optional)</label>
        <input id="mnemonic" name="mnemonic" defaultValue={entry.mnemonic ?? ""} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
      </div>

      <div>
        <label htmlFor="relatedTerms" className="text-sm font-medium block mb-1">Related terms (comma-separated)</label>
        <input id="relatedTerms" name="relatedTerms" defaultValue={entry.relatedTerms.join(", ")} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
      </div>

      <div className="pt-2">
        <button type="submit" disabled={pending} className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
          Save changes
        </button>
      </div>
    </form>
  );
}
