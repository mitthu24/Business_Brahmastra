import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Founder · New exercise" };

/** There is no "create an exercise" flow: every lesson already has exactly one exercise field
 * (see docs/PHASE-5.3.md "Exercise/Quiz CMS" Part 1 inventory) created when the lesson itself is
 * created. This page is honest about that rather than fabricating a create form with nowhere
 * real to attach its result. */
export default function NewExercisePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">New exercise</h1>
      <p className="text-muted mb-4 max-w-xl">
        An exercise always belongs to a lesson - there is no standalone exercise to create on its own.
        To add or edit an exercise, create the lesson first (it includes an exercise field), then come
        back here to manage its status.
      </p>
      <Link href="/founder/lessons/new" className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity">
        Create a new lesson
      </Link>
    </div>
  );
}
