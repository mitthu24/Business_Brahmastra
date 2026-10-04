"use client";

import { useActionState } from "react";
import { updateExerciseAction, type FormState } from "../../../exercise-actions";
import type { LessonRow } from "@/lib/db/lesson-queries";

export function EditExerciseForm({ lesson }: { lesson: LessonRow }) {
  const action = updateExerciseAction.bind(null, lesson.id);
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, undefined);

  return (
    <form action={formAction} className="space-y-4 max-w-xl">
      {state?.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}
      {state?.success && <p className="text-sm text-success">{state.success}</p>}

      <div>
        <label htmlFor="exercisePrompt" className="text-sm font-medium block mb-1">Prompt</label>
        <textarea
          id="exercisePrompt"
          name="exercisePrompt"
          defaultValue={lesson.exercisePrompt}
          required
          rows={3}
          className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary"
        />
        {state?.fieldErrors?.exercisePrompt && <p className="text-xs text-danger mt-1">{state.fieldErrors.exercisePrompt[0]}</p>}
      </div>

      <div>
        <label htmlFor="exerciseAnswer" className="text-sm font-medium block mb-1">Answer</label>
        <textarea
          id="exerciseAnswer"
          name="exerciseAnswer"
          defaultValue={lesson.exerciseAnswer}
          required
          rows={3}
          className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary"
        />
        <p className="text-xs text-muted mt-1">Never shown to a learner until they reveal it after attempting the prompt.</p>
        {state?.fieldErrors?.exerciseAnswer && <p className="text-xs text-danger mt-1">{state.fieldErrors.exerciseAnswer[0]}</p>}
      </div>

      <div className="pt-2">
        <button type="submit" disabled={pending} className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
          Save changes
        </button>
      </div>
    </form>
  );
}
