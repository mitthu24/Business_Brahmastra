"use client";

import { useActionState } from "react";
import { createCaseStudyEntryAction, type FormState } from "../../../content-actions";
import { CASE_STUDY_CATEGORIES } from "@/lib/content/cms-categories";

export function CreateCaseStudyForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(createCaseStudyEntryAction, undefined);

  return (
    <form action={formAction} className="space-y-4 max-w-xl">
      {state?.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}

      <div>
        <label htmlFor="company" className="text-sm font-medium block mb-1">Company</label>
        <input id="company" name="company" required className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {state?.fieldErrors?.company && <p className="text-xs text-danger mt-1">{state.fieldErrors.company[0]}</p>}
      </div>

      <div>
        <label htmlFor="id" className="text-sm font-medium block mb-1">Id (optional — derived from company if left blank)</label>
        <input id="id" name="id" placeholder="e.g. zerodha" className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {state?.fieldErrors?.id && <p className="text-xs text-danger mt-1">{state.fieldErrors.id[0]}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className="text-sm font-medium block mb-1">Category</label>
          <select id="category" name="category" required className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary">
            {CASE_STUDY_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {state?.fieldErrors?.category && <p className="text-xs text-danger mt-1">{state.fieldErrors.category[0]}</p>}
        </div>
        <div>
          <label htmlFor="factType" className="text-sm font-medium block mb-1">Fact type</label>
          <select id="factType" name="factType" required className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary">
            <option value="documented">Documented</option>
            <option value="illustrative">Illustrative</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="industry" className="text-sm font-medium block mb-1">Industry</label>
        <input id="industry" name="industry" required className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {state?.fieldErrors?.industry && <p className="text-xs text-danger mt-1">{state.fieldErrors.industry[0]}</p>}
      </div>

      {(
        [
          ["problem", "Problem"],
          ["solution", "Solution"],
          ["customer", "Customer"],
          ["businessModel", "Business model"],
          ["revenueModel", "Revenue model"],
          ["growth", "Growth"],
          ["competition", "Competition"],
          ["challenges", "Challenges"],
        ] as const
      ).map(([field, label]) => (
        <div key={field}>
          <label htmlFor={field} className="text-sm font-medium block mb-1">{label}</label>
          <textarea id={field} name={field} required rows={2} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
          {state?.fieldErrors?.[field] && <p className="text-xs text-danger mt-1">{state.fieldErrors[field][0]}</p>}
        </div>
      ))}

      <div>
        <label htmlFor="lessons" className="text-sm font-medium block mb-1">Lessons (one per line)</label>
        <textarea id="lessons" name="lessons" rows={3} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
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
