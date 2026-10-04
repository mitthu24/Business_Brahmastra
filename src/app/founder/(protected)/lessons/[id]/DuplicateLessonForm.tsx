"use client";

import { useActionState, useState } from "react";
import { duplicateLessonAction, type FormState } from "../../../lesson-actions";

export function DuplicateLessonForm({ lessonId }: { lessonId: string }) {
  const [open, setOpen] = useState(false);
  const action = duplicateLessonAction.bind(null, lessonId);
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, undefined);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs rounded-md border border-border px-2 py-1 hover:bg-bg-elevated transition-colors"
      >
        Duplicate lesson
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <label htmlFor="targetDay" className="text-xs text-muted">Copy to day</label>
      <input
        id="targetDay"
        name="targetDay"
        type="number"
        min={1}
        max={90}
        required
        className="w-20 rounded-lg border border-border bg-bg-elevated px-2 py-1 text-xs outline-none focus-visible:border-primary"
      />
      <button type="submit" disabled={pending} className="rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
        Create draft copy
      </button>
      <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-bg-elevated transition-colors">
        Cancel
      </button>
      {state?.fieldErrors?.targetDay && <p role="alert" className="text-xs text-danger w-full">{state.fieldErrors.targetDay[0]}</p>}
      {state?.error && <p role="alert" className="text-xs text-danger w-full">{state.error}</p>}
    </form>
  );
}
