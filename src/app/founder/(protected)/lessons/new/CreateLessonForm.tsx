"use client";

import { useActionState } from "react";
import { createLessonAction, type FormState } from "../../../lesson-actions";
import { phases } from "@/lib/content/phases";

export function CreateLessonForm({ defaultDay }: { defaultDay?: number }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(createLessonAction, undefined);

  const field = (name: string) => state?.fieldErrors?.[name]?.[0];

  return (
    <form action={formAction} className="space-y-4 max-w-2xl">
      {state?.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="day" className="text-sm font-medium block mb-1">Day (1–90)</label>
          <input id="day" name="day" type="number" min={1} max={90} defaultValue={defaultDay} required className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
          {field("day") && <p className="text-xs text-danger mt-1">{field("day")}</p>}
        </div>
        <div>
          <label htmlFor="phaseId" className="text-sm font-medium block mb-1">Phase</label>
          <select id="phaseId" name="phaseId" required className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary">
            {phases.map((p) => (
              <option key={p.id} value={p.id}>Phase {p.number}: {p.title}</option>
            ))}
          </select>
          {field("phaseId") && <p className="text-xs text-danger mt-1">{field("phaseId")}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="title" className="text-sm font-medium block mb-1">Title</label>
        <input id="title" name="title" required className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {field("title") && <p className="text-xs text-danger mt-1">{field("title")}</p>}
      </div>

      <div>
        <label htmlFor="slug" className="text-sm font-medium block mb-1">Slug</label>
        <input id="slug" name="slug" placeholder="e.g. what-is-a-business" required className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {field("slug") && <p className="text-xs text-danger mt-1">{field("slug")}</p>}
      </div>

      <div>
        <label htmlFor="objective" className="text-sm font-medium block mb-1">Objective (Today&apos;s Mission)</label>
        <textarea id="objective" name="objective" required rows={2} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {field("objective") && <p className="text-xs text-danger mt-1">{field("objective")}</p>}
      </div>

      <div>
        <label htmlFor="concept" className="text-sm font-medium block mb-1">Concept</label>
        <textarea id="concept" name="concept" required rows={3} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {field("concept") && <p className="text-xs text-danger mt-1">{field("concept")}</p>}
      </div>

      <div>
        <label htmlFor="simpleExplanation" className="text-sm font-medium block mb-1">Simple Explanation</label>
        <textarea id="simpleExplanation" name="simpleExplanation" required rows={2} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {field("simpleExplanation") && <p className="text-xs text-danger mt-1">{field("simpleExplanation")}</p>}
      </div>

      <div>
        <label htmlFor="analogy" className="text-sm font-medium block mb-1">Analogy</label>
        <textarea id="analogy" name="analogy" required rows={2} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {field("analogy") && <p className="text-xs text-danger mt-1">{field("analogy")}</p>}
      </div>

      <div>
        <label htmlFor="businessExample" className="text-sm font-medium block mb-1">Real-life Example</label>
        <textarea id="businessExample" name="businessExample" required rows={2} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {field("businessExample") && <p className="text-xs text-danger mt-1">{field("businessExample")}</p>}
      </div>

      <div>
        <label htmlFor="indiaExample" className="text-sm font-medium block mb-1">India Example (optional)</label>
        <textarea id="indiaExample" name="indiaExample" rows={2} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
      </div>

      <div>
        <label htmlFor="startupExample" className="text-sm font-medium block mb-1">Startup Example (optional)</label>
        <textarea id="startupExample" name="startupExample" rows={2} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
      </div>

      <fieldset className="border border-border rounded-lg p-3 space-y-2">
        <legend className="text-sm font-medium px-1">Formula (optional)</legend>
        <input name="formulaName" placeholder="Name" className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        <input name="formulaExpression" placeholder="Expression" className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm font-mono outline-none focus-visible:border-primary" />
        <textarea name="formulaWorkedExample" placeholder="Worked example" rows={2} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
      </fieldset>

      <fieldset className="border border-border rounded-lg p-3 space-y-2">
        <legend className="text-sm font-medium px-1">Mnemonic (optional)</legend>
        <input name="mnemonicLabel" placeholder="Label, e.g. VALUE" className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        <textarea name="mnemonicBreakdown" placeholder="One line per letter breakdown" rows={3} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
      </fieldset>

      <div>
        <label htmlFor="commonMistake" className="text-sm font-medium block mb-1">Common Mistake</label>
        <textarea id="commonMistake" name="commonMistake" required rows={2} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {field("commonMistake") && <p className="text-xs text-danger mt-1">{field("commonMistake")}</p>}
      </div>

      <div>
        <label htmlFor="exercisePrompt" className="text-sm font-medium block mb-1">Exercise</label>
        <textarea id="exercisePrompt" name="exercisePrompt" required rows={2} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {field("exercisePrompt") && <p className="text-xs text-danger mt-1">{field("exercisePrompt")}</p>}
      </div>

      <div>
        <label htmlFor="exerciseAnswer" className="text-sm font-medium block mb-1">Exercise Answer</label>
        <textarea id="exerciseAnswer" name="exerciseAnswer" required rows={2} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {field("exerciseAnswer") && <p className="text-xs text-danger mt-1">{field("exerciseAnswer")}</p>}
      </div>

      <div>
        <label htmlFor="caseStudy" className="text-sm font-medium block mb-1">Case Study</label>
        <textarea id="caseStudy" name="caseStudy" required rows={3} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {field("caseStudy") && <p className="text-xs text-danger mt-1">{field("caseStudy")}</p>}
      </div>

      <div>
        <label htmlFor="founderQuestion" className="text-sm font-medium block mb-1">Founder Question</label>
        <textarea id="founderQuestion" name="founderQuestion" required rows={2} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {field("founderQuestion") && <p className="text-xs text-danger mt-1">{field("founderQuestion")}</p>}
      </div>

      <div>
        <label htmlFor="quiz" className="text-sm font-medium block mb-1">
          Quiz (JSON array of {"{question, options[], correctIndex, explanation}"})
        </label>
        <textarea
          id="quiz"
          name="quiz"
          rows={6}
          placeholder={'[\n  {"question": "...", "options": ["A", "B", "C", "D"], "correctIndex": 1, "explanation": "..."}\n]'}
          className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm font-mono outline-none focus-visible:border-primary"
        />
        {field("quiz") && <p className="text-xs text-danger mt-1">{field("quiz")}</p>}
      </div>

      <div>
        <label htmlFor="takeaways" className="text-sm font-medium block mb-1">Takeaways (one per line)</label>
        <textarea id="takeaways" name="takeaways" rows={4} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
      </div>

      <div>
        <label htmlFor="rememberThis" className="text-sm font-medium block mb-1">Remember This</label>
        <textarea id="rememberThis" name="rememberThis" required rows={2} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {field("rememberThis") && <p className="text-xs text-danger mt-1">{field("rememberThis")}</p>}
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
