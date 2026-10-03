"use client";

import { useState } from "react";
import Link from "next/link";
import type { Lesson } from "@/lib/content/types";
import { useProgressStore } from "@/lib/progress/store";
import type { QuizAnswer } from "@/lib/progress/xp";
import { Icon } from "@/components/nav/Icon";
import { TOTAL_DAYS } from "@/lib/content/lessons";
import { LessonSection } from "@/components/ui/LessonSection";
import { ExerciseCard } from "@/components/ui/ExerciseCard";
import { CaseStudyCard } from "@/components/ui/CaseStudyCard";
import { Callout } from "@/components/ui/Callout";

export function LessonInteractive({ lesson }: { lesson: Lesson }) {
  const [exerciseRevealed, setExerciseRevealed] = useState(false);
  const [caseStudyRead, setCaseStudyRead] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [learned, setLearned] = useState("");
  const [application, setApplication] = useState("");
  const [reflectionSaved, setReflectionSaved] = useState(false);

  const completedDays = useProgressStore((s) => s.completedDays);
  const completeDay = useProgressStore((s) => s.completeDay);
  const completeExercise = useProgressStore((s) => s.completeExercise);
  const completeCaseStudy = useProgressStore((s) => s.completeCaseStudy);
  const submitQuiz = useProgressStore((s) => s.submitQuiz);
  const saveReflection = useProgressStore((s) => s.saveReflection);
  const quizAttempts = useProgressStore((s) => s.quizAttempts);

  // Subscribe to the underlying `completedDays` array (not the `isDayCompleted` getter function,
  // whose reference never changes) so this component actually re-renders when completion state changes.
  const dayDone = completedDays.includes(lesson.day);
  const alreadyAttemptedQuiz = Boolean(quizAttempts[lesson.id]);
  const allQuestionsAnswered = lesson.quiz.every((q) => selectedAnswers[q.id] !== undefined);

  function revealExercise() {
    setExerciseRevealed(true);
    completeExercise(lesson.id);
  }

  function markCaseStudyRead() {
    setCaseStudyRead(true);
    completeCaseStudy(lesson.id);
  }

  function handleSubmitQuiz() {
    const answers: QuizAnswer[] = lesson.quiz.map((q) => ({
      questionId: q.id,
      selectedIndex: selectedAnswers[q.id],
      correctIndex: q.correctIndex,
    }));
    submitQuiz(lesson.id, answers);
    setQuizSubmitted(true);
  }

  function handleSaveReflection() {
    saveReflection(lesson.id, learned, application);
    setReflectionSaved(true);
  }

  const correctCount = lesson.quiz.filter((q) => selectedAnswers[q.id] === q.correctIndex).length;

  return (
    <div className="space-y-8">
      <LessonSection icon="📝" title="PRACTICE">
        <ExerciseCard prompt={lesson.exercise.prompt} revealed={exerciseRevealed} answer={lesson.exercise.answer} onReveal={revealExercise} />
      </LessonSection>

      <LessonSection icon="🏪" title="MINI CASE STUDY">
        <CaseStudyCard text={lesson.caseStudy} read={caseStudyRead} onMarkRead={markCaseStudyRead} />
      </LessonSection>

      <LessonSection icon="🎤" title="FOUNDER QUESTION">
        <div className="card p-5 italic">{lesson.founderQuestion}</div>
      </LessonSection>

      <LessonSection icon="⚡" title="QUICK QUIZ">
        <div className="card p-5">
          <div className="space-y-5">
            {lesson.quiz.map((q, qi) => {
              const selected = selectedAnswers[q.id];
              return (
                <fieldset key={q.id}>
                  <legend className="font-medium mb-2 text-sm">{qi + 1}. {q.question}</legend>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => {
                      const isSelected = selected === oi;
                      const isCorrect = oi === q.correctIndex;
                      let style = "border-border hover:bg-bg-elevated";
                      if (quizSubmitted) {
                        if (isCorrect) style = "border-success bg-success/10";
                        else if (isSelected) style = "border-danger bg-danger/10";
                      } else if (isSelected) {
                        style = "border-primary bg-primary/10";
                      }
                      return (
                        <button
                          key={oi}
                          disabled={quizSubmitted}
                          aria-pressed={isSelected}
                          onClick={() => setSelectedAnswers((prev) => ({ ...prev, [q.id]: oi }))}
                          className={`w-full text-left text-sm rounded-lg border px-3 py-2 transition-colors ${style}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {quizSubmitted && <p className="text-xs text-muted mt-2">{q.explanation}</p>}
                </fieldset>
              );
            })}
          </div>

          {!quizSubmitted ? (
            <button
              onClick={handleSubmitQuiz}
              disabled={!allQuestionsAnswered}
              className="mt-5 rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              Submit Quiz {alreadyAttemptedQuiz ? "" : "(+25 XP)"}
            </button>
          ) : (
            <p className="mt-5 text-sm font-medium">
              You got {correctCount}/{lesson.quiz.length} correct ({Math.round((correctCount / lesson.quiz.length) * 100)}%).
            </p>
          )}
        </div>
      </LessonSection>

      <LessonSection icon="📌" title="REMEMBER THIS">
        <div className="card p-5">
          <ul className="list-disc list-inside space-y-1.5 text-sm mb-4">
            {lesson.takeaways.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
          <Callout tone="accent" icon="🧠" title="Remember This">
            {lesson.rememberThis}
          </Callout>
        </div>
      </LessonSection>

      <LessonSection icon="💭" title="DAILY REFLECTION">
        <div className="card p-5 space-y-3">
          <div>
            <label htmlFor={`reflection-learned-${lesson.id}`} className="text-sm font-medium block mb-1">What did I learn today?</label>
            <textarea
              id={`reflection-learned-${lesson.id}`}
              value={learned}
              onChange={(e) => setLearned(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary"
            />
          </div>
          <div>
            <label htmlFor={`reflection-application-${lesson.id}`} className="text-sm font-medium block mb-1">Where can I apply this in a real business?</label>
            <textarea
              id={`reflection-application-${lesson.id}`}
              value={application}
              onChange={(e) => setApplication(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary"
            />
          </div>
          <button onClick={handleSaveReflection} className="rounded-lg bg-bg-elevated border border-border px-4 py-2 text-sm font-medium hover:bg-primary/10 transition-colors">
            Save reflection
          </button>
          {reflectionSaved && <p className="text-xs text-success">Saved to your Founder Journal.</p>}
        </div>
      </LessonSection>

      <div className="card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-semibold">{dayDone ? "Day complete ✅" : "Ready to mark this day complete?"}</p>
          <p className="text-xs text-muted">Completing a day awards +50 XP and updates your streak.</p>
        </div>
        {!dayDone ? (
          <button onClick={() => completeDay(lesson.day)} className="rounded-lg bg-success text-white px-6 py-3 font-medium hover:opacity-90 transition-opacity whitespace-nowrap">
            Mark Day Complete
          </button>
        ) : (
          <Icon name="CheckCircle2" size={32} className="text-success shrink-0" />
        )}
      </div>

      <div className="flex items-center justify-between pt-2">
        {lesson.day > 1 ? (
          <Link href={`/learn/day/${lesson.day - 1}`} className="text-sm text-muted hover:text-foreground">← Day {lesson.day - 1}</Link>
        ) : <span />}
        {lesson.day < TOTAL_DAYS ? (
          <Link href={`/learn/day/${lesson.day + 1}`} className="text-sm text-primary font-medium hover:opacity-80">Day {lesson.day + 1} →</Link>
        ) : <span />}
      </div>
    </div>
  );
}
