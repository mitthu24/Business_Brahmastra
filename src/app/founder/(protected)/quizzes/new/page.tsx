import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Founder · New quiz" };

/** No "create a quiz" flow: every lesson already has a quiz field, created with the lesson itself
 * (docs/PHASE-5.3.md "Exercise/Quiz CMS" Part 1 inventory). */
export default function NewQuizPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">New quiz</h1>
      <p className="text-muted mb-4 max-w-xl">
        A quiz always belongs to a lesson - there is no standalone quiz to create on its own. To add
        or edit a quiz, create the lesson first (it includes a quiz field), then come back here to
        manage its status.
      </p>
      <Link href="/founder/lessons/new" className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity">
        Create a new lesson
      </Link>
    </div>
  );
}
