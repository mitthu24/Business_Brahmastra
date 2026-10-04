"use client";

import { useState } from "react";

/** Mirrors how src/components/ui/ExerciseCard.tsx renders to a learner, but purely local state -
 * never calls completeExercise, never awards XP, never touches progress (docs/PHASE-5.3.md
 * "Exercise/Quiz CMS" Part 8). */
export function ExercisePreview({ prompt, answer }: { prompt: string; answer: string }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="card p-5 max-w-xl">
      <p className="mb-4">{prompt}</p>
      {!revealed ? (
        <button onClick={() => setRevealed(true)} className="rounded-lg bg-bg-elevated border border-border px-4 py-2 text-sm font-medium hover:bg-primary/10 transition-colors">
          Reveal Answer (preview only)
        </button>
      ) : (
        <div className="rounded-lg bg-success/10 border border-success/30 p-4 text-sm">
          <div className="font-medium text-success mb-1">✅ Answer</div>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}
