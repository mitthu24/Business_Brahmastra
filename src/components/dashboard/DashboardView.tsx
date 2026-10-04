"use client";

import Link from "next/link";
import { useProgressStore } from "@/lib/progress/store";
import { getPhaseForDay } from "@/lib/content/phases";
import { TOTAL_DAYS, getLessonByDay } from "@/lib/content/lessons";
import { achievements } from "@/lib/progress/achievements";
import { MetricCard } from "@/components/ui/MetricCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { CircularProgress } from "@/components/ui/CircularProgress";
import { TrialBanner } from "@/components/access/TrialBanner";
import { hasProtectedAccess, type AccessInfo } from "@/lib/access/status";

export function DashboardView({
  userName,
  access,
}: {
  userName: string | null;
  access: AccessInfo | null;
}) {
  const completedDays = useProgressStore((s) => s.completedDays);
  const completedExercises = useProgressStore((s) => s.completedExercises);
  const quizAttempts = useProgressStore((s) => s.quizAttempts);
  const xp = useProgressStore((s) => s.xp);
  const streak = useProgressStore((s) => s.streak);
  const unlockedAchievements = useProgressStore((s) => s.unlockedAchievements);

  const completedCount = completedDays.length;
  const currentDay = Math.min(completedCount + 1, TOTAL_DAYS);
  const currentPhase = getPhaseForDay(currentDay);
  const progressPercent = Math.round((completedCount / TOTAL_DAYS) * 100);
  const conceptsLearned = completedCount; // one core concept block credited per completed lesson
  const quizAccuracyValues = Object.values(quizAttempts).map((a) => a.accuracyPercent);
  const avgQuizAccuracy =
    quizAccuracyValues.length === 0 ? null : Math.round(quizAccuracyValues.reduce((a, b) => a + b, 0) / quizAccuracyValues.length);
  const currentLesson = getLessonByDay(currentDay);

  const phaseTotalDays = currentPhase.endDay - currentPhase.startDay + 1;
  const phaseCompletedDays = Array.from({ length: phaseTotalDays }, (_, i) => currentPhase.startDay + i).filter((d) =>
    completedDays.includes(d)
  ).length;

  const canLearn = access ? hasProtectedAccess(access.status) : true;
  const displayName = userName ?? "Founder";

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Good day, {displayName} 👋</h1>
      <p className="text-muted mb-6">Here&apos;s where you stand in your 90-day journey.</p>

      {access && <TrialBanner access={access} />}

      {/* TODAY'S MISSION - the one dominant CTA on this page */}
      <div className="card p-6 mb-6 bg-gradient-to-br from-primary/10 via-bg-card to-bg-card border-primary/20">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:justify-between">
          <div className="flex items-center gap-5">
            <CircularProgress percent={progressPercent} size={76} sublabel="journey" />
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">Today&apos;s Mission</p>
              <div className="text-2xl font-bold">Day {currentDay}{currentLesson ? `: ${currentLesson.title}` : ""}</div>
              <div className="text-sm text-muted mt-1">Phase: {currentPhase.title}</div>
            </div>
          </div>
          {canLearn ? (
            <Link
              href={`/learn/day/${currentDay}`}
              className="rounded-lg bg-primary text-primary-foreground px-6 py-3 font-medium hover:opacity-90 transition-opacity whitespace-nowrap text-center shrink-0"
            >
              Continue Learning →
            </Link>
          ) : (
            <Link
              href="/account"
              className="rounded-lg border border-border px-6 py-3 font-medium hover:bg-bg-elevated transition-colors whitespace-nowrap text-center shrink-0"
            >
              View access status
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <MetricCard icon="Flame" label="Streak" value={`${streak.currentStreak} days`} />
        <MetricCard icon="Zap" label="XP" value={xp.toLocaleString()} />
        <MetricCard icon="BookOpen" label="Lessons" value={`${completedCount}/${TOTAL_DAYS}`} />
        <MetricCard icon="Brain" label="Concepts" value={`${conceptsLearned}`} />
        <MetricCard icon="ClipboardCheck" label="Exercises" value={`${completedExercises.length}`} />
        <MetricCard icon="Trophy" label="Achievements" value={`${unlockedAchievements.length}/${achievements.length}`} />
      </div>

      <div className="card p-5 mb-6">
        <p className="text-xs text-muted mb-2">CURRENT PHASE</p>
        <div className="flex items-center justify-between mb-2">
          <p className="font-semibold">Phase {currentPhase.number}: {currentPhase.title}</p>
          <span className="text-xs text-muted">{phaseCompletedDays}/{phaseTotalDays} days</span>
        </div>
        <ProgressBar percent={(phaseCompletedDays / phaseTotalDays) * 100} size="sm" />
        {avgQuizAccuracy !== null && <p className="text-xs text-muted mt-3">Average quiz accuracy so far: {avgQuizAccuracy}%</p>}
      </div>

      <div className="card p-5 bg-primary/10 border-primary/30 mb-6">
        <p className="text-xs font-medium text-primary mb-1">RECOMMENDED NEXT ACTION</p>
        <p className="text-sm">
          {completedCount === 0
            ? "Start Day 1 to begin your 90-day journey."
            : `Continue with Day ${currentDay}${currentLesson ? `: ${currentLesson.title}` : ""} to keep your ${streak.currentStreak}-day streak alive.`}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/roadmap" className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-bg-elevated transition-colors">View full roadmap</Link>
        <Link href="/achievements" className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-bg-elevated transition-colors">View achievements</Link>
        <Link href="/progress" className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-bg-elevated transition-colors">View detailed progress</Link>
      </div>
    </div>
  );
}
