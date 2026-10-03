"use client";

import Link from "next/link";
import { useProgressStore } from "@/lib/progress/store";
import { getPhaseForDay } from "@/lib/content/phases";
import { TOTAL_DAYS, getLessonByDay } from "@/lib/content/lessons";
import { Icon } from "@/components/nav/Icon";

function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="card p-4">
      <Icon name={icon} size={18} className="text-primary mb-2" />
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}

export function DashboardView() {
  const completedDays = useProgressStore((s) => s.completedDays);
  const completedExercises = useProgressStore((s) => s.completedExercises);
  const quizAttempts = useProgressStore((s) => s.quizAttempts);
  const xp = useProgressStore((s) => s.xp);
  const streak = useProgressStore((s) => s.streak);

  const completedCount = completedDays.length;
  const currentDay = Math.min(completedCount + 1, TOTAL_DAYS);
  const currentPhase = getPhaseForDay(currentDay);
  const progressPercent = Math.round((completedCount / TOTAL_DAYS) * 100);
  const conceptsLearned = completedCount * 1; // one core concept block per completed lesson, conservatively counted
  const quizAccuracyValues = Object.values(quizAttempts).map((a) => a.accuracyPercent);
  const avgQuizAccuracy =
    quizAccuracyValues.length === 0 ? null : Math.round(quizAccuracyValues.reduce((a, b) => a + b, 0) / quizAccuracyValues.length);
  const currentLesson = getLessonByDay(currentDay);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Good day, Founder 👋</h1>
      <p className="text-muted mb-6">Here&apos;s where you stand in your 90-day journey.</p>

      <div className="card p-6 mb-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
        <div>
          <div className="text-xs text-muted mb-1">Current Day</div>
          <div className="text-2xl font-bold">Day {currentDay}{currentLesson ? `: ${currentLesson.title}` : ""}</div>
          <div className="text-sm text-muted mt-1">Phase: {currentPhase.title}</div>
        </div>
        <Link href={`/learn/day/${currentDay}`} className="rounded-lg bg-primary text-primary-foreground px-5 py-2.5 font-medium hover:opacity-90 transition-opacity whitespace-nowrap">
          Continue Learning →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon="BarChart3" label="Overall Progress" value={`${progressPercent}%`} />
        <StatCard icon="Flame" label="Streak" value={`${streak.currentStreak} days`} />
        <StatCard icon="Zap" label="XP" value={xp.toLocaleString()} />
        <StatCard icon="BookOpen" label="Lessons Completed" value={`${completedCount}/${TOTAL_DAYS}`} />
        <StatCard icon="Brain" label="Concepts Learned" value={`${conceptsLearned}`} />
        <StatCard icon="ClipboardCheck" label="Exercises Done" value={`${completedExercises.length}`} />
        <StatCard icon="Target" label="Quiz Accuracy" value={avgQuizAccuracy === null ? "—" : `${avgQuizAccuracy}%`} />
        <StatCard icon="Layers" label="Current Phase" value={currentPhase.title} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/roadmap" className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-bg-elevated transition-colors">View full roadmap</Link>
        <Link href="/achievements" className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-bg-elevated transition-colors">View achievements</Link>
        <Link href="/progress" className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-bg-elevated transition-colors">View detailed progress</Link>
      </div>
    </div>
  );
}
