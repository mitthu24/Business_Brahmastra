"use client";

import { useActionState } from "react";
import { updateCaseStudyEntryAction, type FormState } from "../../../content-actions";
import { CASE_STUDY_CATEGORIES } from "@/lib/content/cms-categories";
import type { CaseStudyEntryRow } from "@/lib/db/content-queries";

export function EditCaseStudyForm({ entry }: { entry: CaseStudyEntryRow }) {
  const action = updateCaseStudyEntryAction.bind(null, entry.id);
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, undefined);

  return (
    <form action={formAction} className="space-y-4 max-w-xl">
      {state?.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}
      {state?.success && <p className="text-sm text-success">{state.success}</p>}

      <div>
        <label htmlFor="company" className="text-sm font-medium block mb-1">Company</label>
        <input id="company" name="company" defaultValue={entry.company} required className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {state?.fieldErrors?.company && <p className="text-xs text-danger mt-1">{state.fieldErrors.company[0]}</p>}
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Id</label>
        <p className="text-sm text-muted">{entry.id} (fixed — this case study&apos;s permanent identifier)</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className="text-sm font-medium block mb-1">Category</label>
          <select id="category" name="category" defaultValue={entry.category} required className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary">
            {CASE_STUDY_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {state?.fieldErrors?.category && <p className="text-xs text-danger mt-1">{state.fieldErrors.category[0]}</p>}
        </div>
        <div>
          <label htmlFor="factType" className="text-sm font-medium block mb-1">Fact type</label>
          <select id="factType" name="factType" defaultValue={entry.factType} required className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary">
            <option value="documented">Documented</option>
            <option value="illustrative">Illustrative</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="industry" className="text-sm font-medium block mb-1">Industry</label>
        <input id="industry" name="industry" defaultValue={entry.industry} required className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {state?.fieldErrors?.industry && <p className="text-xs text-danger mt-1">{state.fieldErrors.industry[0]}</p>}
      </div>

      {(
        [
          ["problem", "Problem", entry.problem],
          ["solution", "Solution", entry.solution],
          ["customer", "Customer", entry.customer],
          ["businessModel", "Business model", entry.businessModel],
          ["revenueModel", "Revenue model", entry.revenueModel],
          ["growth", "Growth", entry.growth],
          ["competition", "Competition", entry.competition],
          ["challenges", "Challenges", entry.challenges],
        ] as const
      ).map(([field, label, value]) => (
        <div key={field}>
          <label htmlFor={field} className="text-sm font-medium block mb-1">{label}</label>
          <textarea id={field} name={field} defaultValue={value} required rows={2} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
          {state?.fieldErrors?.[field] && <p className="text-xs text-danger mt-1">{state.fieldErrors[field][0]}</p>}
        </div>
      ))}

      <div>
        <label htmlFor="lessons" className="text-sm font-medium block mb-1">Lessons (one per line)</label>
        <textarea id="lessons" name="lessons" defaultValue={entry.lessons.join("\n")} rows={3} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
      </div>

      <div className="pt-2">
        <button type="submit" disabled={pending} className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
          Save changes
        </button>
      </div>
    </form>
  );
}
