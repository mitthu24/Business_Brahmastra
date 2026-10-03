"use client";

import { useState } from "react";
import type { QuizQuestion, ExerciseBlock } from "@/lib/content/types";
import { LessonSection } from "@/components/ui/LessonSection";
import { Callout } from "@/components/ui/Callout";

/**
 * Founder preview only (Phase 5.3 slice 3, docs/PHASE-5.3.md "Lesson preview"). Deliberately NOT
 * the real src/components/lesson/LessonInteractive.tsx: that component calls into
 * useProgressStore (completeExercise/completeCaseStudy/submitQuiz/completeDay), each of which POSTs
 * to /api/progress and would genuinely mark the founder's own account as having completed this
 * lesson, award XP, and move their streak - completely unacceptable for a "preview as learner"
 * action. Every interaction here is local component state only; nothing is ever sent to the server.
 */
export function LessonPreviewInteractive({ exercise, caseStudy, founderQuestion, quiz, takeaways, rememberThis }: {
  exercise: ExerciseBlock;
  caseStudy: string;
  founderQuestion: string;
  quiz: QuizQuestion[];
  takeaways: string[];
  rememberThis: string;
}) {
  const [exerciseRevealed, setExerciseRevealed] = useState(false);
  const [caseStudyRead, setCaseStudyRead] = useState(false);

  return (
    <div className="space-y-8">
      <LessonSection icon="📝" title="PRACTICE">
        <div className="card p-5">
          <p className="mb-4">{exercise.prompt}</p>
          {!exerciseRevealed ? (
            <button onClick={() => setExerciseRevealed(true)} className="rounded-lg bg-bg-elevated border border-border px-4 py-2 text-sm font-medium hover:bg-primary/10 transition-colors">
              Reveal Answer (preview only)
            </button>
          ) : (
            <div className="rounded-lg bg-success/10 border border-success/30 p-4 text-sm">
              <div className="font-medium text-success mb-1">✅ Answer</div>
              <p>{exercise.answer}</p>
            </div>
          )}
        </div>
      </LessonSection>

      <LessonSection icon="🏪" title="MINI CASE STUDY">
        <div className="card p-5">
          <p>{caseStudy}</p>
          {!caseStudyRead ? (
            <button onClick={() => setCaseStudyRead(true)} className="mt-4 rounded-lg bg-bg-elevated border border-border px-4 py-2 text-sm font-medium hover:bg-primary/10 transition-colors">
              Mark as read (preview only)
            </button>
          ) : (
            <p className="mt-3 text-xs text-muted">Preview only — nothing was recorded.</p>
          )}
        </div>
      </LessonSection>

      <LessonSection icon="🎤" title="FOUNDER QUESTION">
        <div className="card p-5 italic">{founderQuestion}</div>
      </LessonSection>

      <LessonSection icon="⚡" title="QUICK QUIZ (answer key shown — preview only)">
        <div className="card p-5 space-y-5">
          {quiz.map((q, qi) => (
            <fieldset key={q.id}>
              <legend className="font-medium mb-2 text-sm">{qi + 1}. {q.question}</legend>
              <div className="space-y-2">
                {q.options.map((opt, oi) => (
                  <div
                    key={oi}
                    className={`w-full text-left text-sm rounded-lg border px-3 py-2 ${oi === q.correctIndex ? "border-success bg-success/10" : "border-border"}`}
                  >
                    {opt} {oi === q.correctIndex && <span className="text-success font-medium">(correct)</span>}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted mt-2">{q.explanation}</p>
            </fieldset>
          ))}
          {quiz.length === 0 && <p className="text-sm text-muted">No quiz questions yet.</p>}
        </div>
      </LessonSection>

      <LessonSection icon="📌" title="REMEMBER THIS">
        <div className="card p-5">
          <ul className="list-disc list-inside space-y-1.5 text-sm mb-4">
            {takeaways.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
          <Callout tone="accent" icon="🧠" title="Remember This">{rememberThis}</Callout>
        </div>
      </LessonSection>
    </div>
  );
}
