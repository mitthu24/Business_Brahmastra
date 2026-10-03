"use client";

import { phases } from "@/lib/content/phases";
import { useProgressStore } from "@/lib/progress/store";
import { TOTAL_DAYS } from "@/lib/content/lessons";

export function ProgressView() {
  const completedDays = useProgressStore((s) => s.completedDays);
  const quizAttempts = useProgressStore((s) => s.quizAttempts);
  const completedExercises = useProgressStore((s) => s.completedExercises);
  const completedSet = new Set(completedDays);

  const quizValues = Object.values(quizAttempts).map((a) => a.accuracyPercent);
  const avgAccuracy = quizValues.length === 0 ? null : Math.round(quizValues.reduce((a, b) => a + b, 0) / quizValues.length);

  return (
    <div>
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <StatBlock label="Overall Completion" value={`${Math.round((completedDays.length / TOTAL_DAYS) * 100)}%`} />
        <StatBlock label="Exercises Completed" value={`${completedExercises.length}`} />
        <StatBlock label="Average Quiz Accuracy" value={avgAccuracy === null ? "—" : `${avgAccuracy}%`} />
      </div>

      <h2 className="text-lg font-semibold mb-4">Progress by Phase</h2>
      <div className="space-y-3">
        {phases.map((phase) => {
          const totalDays = phase.endDay - phase.startDay + 1;
          const completedInPhase = Array.from({ length: totalDays }, (_, i) => phase.startDay + i).filter((d) => completedSet.has(d)).length;
          const percent = Math.round((completedInPhase / totalDays) * 100);
          return (
            <div key={phase.id} className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Phase {phase.number}: {phase.title}</span>
                <span className="text-xs text-muted">{completedInPhase}/{totalDays}</span>
              </div>
              <div className="h-2 rounded-full bg-bg-elevated overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${percent}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-5">
      <div className="text-2xl font-bold text-primary">{value}</div>
      <div className="text-xs text-muted mt-1">{label}</div>
    </div>
  );
}
