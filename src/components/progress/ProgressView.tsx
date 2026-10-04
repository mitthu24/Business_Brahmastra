"use client";

import { phases } from "@/lib/content/phases";
import { useProgressStore } from "@/lib/progress/store";
import { TOTAL_DAYS } from "@/lib/content/lessons";
import { achievements } from "@/lib/progress/achievements";
import { MetricCard } from "@/components/ui/MetricCard";
import { CircularProgress } from "@/components/ui/CircularProgress";

export function ProgressView() {
  const completedDays = useProgressStore((s) => s.completedDays);
  const quizAttempts = useProgressStore((s) => s.quizAttempts);
  const completedExercises = useProgressStore((s) => s.completedExercises);
  const completedCaseStudies = useProgressStore((s) => s.completedCaseStudies);
  const xp = useProgressStore((s) => s.xp);
  const streak = useProgressStore((s) => s.streak);
  const unlockedAchievements = useProgressStore((s) => s.unlockedAchievements);
  const completedSet = new Set(completedDays);

  const quizValues = Object.values(quizAttempts).map((a) => a.accuracyPercent);
  const avgAccuracy = quizValues.length === 0 ? null : Math.round(quizValues.reduce((a, b) => a + b, 0) / quizValues.length);
  const overallPercent = Math.round((completedDays.length / TOTAL_DAYS) * 100);

  return (
    <div>
      <div className="card p-6 mb-8 flex flex-col sm:flex-row items-center gap-6">
        <CircularProgress percent={overallPercent} size={96} sublabel="complete" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1 w-full">
          <MetricCard icon="Flame" label="Current Streak" value={`${streak.currentStreak} days`} />
          <MetricCard icon="Zap" label="Total XP" value={xp.toLocaleString()} />
          <MetricCard icon="ClipboardCheck" label="Exercises Completed" value={`${completedExercises.length}`} />
          <MetricCard icon="Trophy" label="Achievements" value={`${unlockedAchievements.length}/${achievements.length}`} />
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <MetricCard icon="BookOpen" label="Days Completed" value={`${completedDays.length}/${TOTAL_DAYS}`} />
        <MetricCard icon="HelpCircle" label="Average Quiz Accuracy" value={avgAccuracy === null ? "—" : `${avgAccuracy}%`} />
        <MetricCard icon="Building2" label="Case Studies Completed" value={`${completedCaseStudies.length}`} />
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
                <div className="h-full bg-primary rounded-full transition-[width] duration-500" style={{ width: `${percent}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
