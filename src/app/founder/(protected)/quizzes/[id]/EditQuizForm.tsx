"use client";

import { useActionState } from "react";
import { updateQuizAction, type FormState } from "../../../quiz-actions";
import type { LessonRow } from "@/lib/db/lesson-queries";

export function EditQuizForm({ lesson }: { lesson: LessonRow }) {
  const action = updateQuizAction.bind(null, lesson.id);
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, undefined);

  return (
    <form action={formAction} className="space-y-4 max-w-xl">
      {state?.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}
      {state?.success && <p className="text-sm text-success">{state.success}</p>}

      <div>
        <label htmlFor="quiz" className="text-sm font-medium block mb-1">
          Quiz (JSON array of {"{question, options[], correctIndex, explanation}"})
        </label>
        <textarea
          id="quiz"
          name="quiz"
          defaultValue={JSON.stringify(lesson.quiz, null, 2)}
          rows={14}
          className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm font-mono outline-none focus-visible:border-primary"
        />
        <p className="text-xs text-muted mt-1">
          Scoring is server-authoritative: the server re-checks each answer against this stored data, never trusting
          a learner&apos;s submitted correctIndex (see src/lib/db/progress-queries.ts#submitQuizTx).
        </p>
        {state?.fieldErrors?.quiz && <p className="text-xs text-danger mt-1">{state.fieldErrors.quiz[0]}</p>}
      </div>

      <div className="pt-2">
        <button type="submit" disabled={pending} className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
          Save changes
        </button>
      </div>
    </form>
  );
}
