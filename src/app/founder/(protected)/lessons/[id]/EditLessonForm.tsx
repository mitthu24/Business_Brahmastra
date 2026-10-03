"use client";

import { useActionState } from "react";
import { updateLessonAction, type FormState } from "../../../lesson-actions";
import { phases } from "@/lib/content/phases";
import type { LessonRow } from "@/lib/db/lesson-queries";

export function EditLessonForm({ lesson }: { lesson: LessonRow }) {
  const action = updateLessonAction.bind(null, lesson.id);
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, undefined);

  const field = (name: string) => state?.fieldErrors?.[name]?.[0];

  return (
    <form action={formAction} className="space-y-4 max-w-2xl">
      {state?.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}
      {state?.success && <p className="text-sm text-success">{state.success}</p>}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium block mb-1">Day</label>
          <p className="text-sm text-muted">{lesson.day} (fixed — the canonical identifier for all learner progress)</p>
        </div>
        <div>
          <label htmlFor="phaseId" className="text-sm font-medium block mb-1">Phase</label>
          <select id="phaseId" name="phaseId" defaultValue={lesson.phaseId} required className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary">
            {phases.map((p) => (
              <option key={p.id} value={p.id}>Phase {p.number}: {p.title}</option>
            ))}
          </select>
          {field("phaseId") && <p className="text-xs text-danger mt-1">{field("phaseId")}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="title" className="text-sm font-medium block mb-1">Title</label>
        <input id="title" name="title" defaultValue={lesson.title} required className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {field("title") && <p className="text-xs text-danger mt-1">{field("title")}</p>}
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Slug</label>
        <p className="text-sm text-muted">{lesson.slug} (fixed)</p>
      </div>

      <div>
        <label htmlFor="objective" className="text-sm font-medium block mb-1">Objective (Today&apos;s Mission)</label>
        <textarea id="objective" name="objective" defaultValue={lesson.objective} required rows={2} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {field("objective") && <p className="text-xs text-danger mt-1">{field("objective")}</p>}
      </div>

      <div>
        <label htmlFor="concept" className="text-sm font-medium block mb-1">Concept</label>
        <textarea id="concept" name="concept" defaultValue={lesson.concept} required rows={3} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {field("concept") && <p className="text-xs text-danger mt-1">{field("concept")}</p>}
      </div>

      <div>
        <label htmlFor="simpleExplanation" className="text-sm font-medium block mb-1">Simple Explanation</label>
        <textarea id="simpleExplanation" name="simpleExplanation" defaultValue={lesson.simpleExplanation} required rows={2} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {field("simpleExplanation") && <p className="text-xs text-danger mt-1">{field("simpleExplanation")}</p>}
      </div>

      <div>
        <label htmlFor="analogy" className="text-sm font-medium block mb-1">Analogy</label>
        <textarea id="analogy" name="analogy" defaultValue={lesson.analogy} required rows={2} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {field("analogy") && <p className="text-xs text-danger mt-1">{field("analogy")}</p>}
      </div>

      <div>
        <label htmlFor="businessExample" className="text-sm font-medium block mb-1">Real-life Example</label>
        <textarea id="businessExample" name="businessExample" defaultValue={lesson.businessExample} required rows={2} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {field("businessExample") && <p className="text-xs text-danger mt-1">{field("businessExample")}</p>}
      </div>

      <div>
        <label htmlFor="indiaExample" className="text-sm font-medium block mb-1">India Example (optional)</label>
        <textarea id="indiaExample" name="indiaExample" defaultValue={lesson.indiaExample ?? ""} rows={2} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
      </div>

      <div>
        <label htmlFor="startupExample" className="text-sm font-medium block mb-1">Startup Example (optional)</label>
        <textarea id="startupExample" name="startupExample" defaultValue={lesson.startupExample ?? ""} rows={2} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
      </div>

      <fieldset className="border border-border rounded-lg p-3 space-y-2">
        <legend className="text-sm font-medium px-1">Formula (optional)</legend>
        <input name="formulaName" defaultValue={lesson.formula?.name ?? ""} placeholder="Name" className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        <input name="formulaExpression" defaultValue={lesson.formula?.expression ?? ""} placeholder="Expression" className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm font-mono outline-none focus-visible:border-primary" />
        <textarea name="formulaWorkedExample" defaultValue={lesson.formula?.workedExample ?? ""} placeholder="Worked example" rows={2} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
      </fieldset>

      <fieldset className="border border-border rounded-lg p-3 space-y-2">
        <legend className="text-sm font-medium px-1">Mnemonic (optional)</legend>
        <input name="mnemonicLabel" defaultValue={lesson.mnemonic?.label ?? ""} placeholder="Label, e.g. VALUE" className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        <textarea name="mnemonicBreakdown" defaultValue={(lesson.mnemonic?.breakdown ?? []).join("\n")} placeholder="One line per letter breakdown" rows={3} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
      </fieldset>

      <div>
        <label htmlFor="commonMistake" className="text-sm font-medium block mb-1">Common Mistake</label>
        <textarea id="commonMistake" name="commonMistake" defaultValue={lesson.commonMistake} required rows={2} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {field("commonMistake") && <p className="text-xs text-danger mt-1">{field("commonMistake")}</p>}
      </div>

      <div>
        <label htmlFor="exercisePrompt" className="text-sm font-medium block mb-1">Exercise</label>
        <textarea id="exercisePrompt" name="exercisePrompt" defaultValue={lesson.exercisePrompt} required rows={2} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {field("exercisePrompt") && <p className="text-xs text-danger mt-1">{field("exercisePrompt")}</p>}
      </div>

      <div>
        <label htmlFor="exerciseAnswer" className="text-sm font-medium block mb-1">Exercise Answer</label>
        <textarea id="exerciseAnswer" name="exerciseAnswer" defaultValue={lesson.exerciseAnswer} required rows={2} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {field("exerciseAnswer") && <p className="text-xs text-danger mt-1">{field("exerciseAnswer")}</p>}
      </div>

      <div>
        <label htmlFor="caseStudy" className="text-sm font-medium block mb-1">Case Study</label>
        <textarea id="caseStudy" name="caseStudy" defaultValue={lesson.caseStudy} required rows={3} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {field("caseStudy") && <p className="text-xs text-danger mt-1">{field("caseStudy")}</p>}
      </div>

      <div>
        <label htmlFor="founderQuestion" className="text-sm font-medium block mb-1">Founder Question</label>
        <textarea id="founderQuestion" name="founderQuestion" defaultValue={lesson.founderQuestion} required rows={2} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {field("founderQuestion") && <p className="text-xs text-danger mt-1">{field("founderQuestion")}</p>}
      </div>

      <div>
        <label htmlFor="quiz" className="text-sm font-medium block mb-1">
          Quiz (JSON array of {"{question, options[], correctIndex, explanation}"})
        </label>
        <textarea
          id="quiz"
          name="quiz"
          defaultValue={JSON.stringify(lesson.quiz, null, 2)}
          rows={10}
          className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm font-mono outline-none focus-visible:border-primary"
        />
        {field("quiz") && <p className="text-xs text-danger mt-1">{field("quiz")}</p>}
      </div>

      <div>
        <label htmlFor="takeaways" className="text-sm font-medium block mb-1">Takeaways (one per line)</label>
        <textarea id="takeaways" name="takeaways" defaultValue={lesson.takeaways.join("\n")} rows={4} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
      </div>

      <div>
        <label htmlFor="rememberThis" className="text-sm font-medium block mb-1">Remember This</label>
        <textarea id="rememberThis" name="rememberThis" defaultValue={lesson.rememberThis} required rows={2} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
        {field("rememberThis") && <p className="text-xs text-danger mt-1">{field("rememberThis")}</p>}
      </div>

      <div className="pt-2">
        <button type="submit" disabled={pending} className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
          Save changes
        </button>
      </div>
    </form>
  );
}
