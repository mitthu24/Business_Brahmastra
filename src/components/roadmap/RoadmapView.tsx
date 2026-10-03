"use client";

import Link from "next/link";
import { phases } from "@/lib/content/phases";
import { useProgressStore } from "@/lib/progress/store";
import { Icon } from "@/components/nav/Icon";

export function RoadmapView() {
  const completedDays = useProgressStore((s) => s.completedDays);
  const completedSet = new Set(completedDays);

  return (
    <div className="space-y-4">
      {phases.map((phase, idx) => {
        const totalDays = phase.endDay - phase.startDay + 1;
        const completedInPhase = Array.from({ length: totalDays }, (_, i) => phase.startDay + i).filter((d) =>
          completedSet.has(d)
        ).length;
        const progressPercent = Math.round((completedInPhase / totalDays) * 100);
        const previousPhase = phases[idx - 1];
        const previousComplete = !previousPhase
          ? true
          : Array.from({ length: previousPhase.endDay - previousPhase.startDay + 1 }, (_, i) => previousPhase.startDay + i).every((d) => completedSet.has(d));
        const unlocked = idx === 0 || previousComplete || completedInPhase > 0;
        const isComplete = progressPercent === 100;

        return (
          <div key={phase.id} className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div
                className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                  isComplete ? "bg-success/20 text-success" : unlocked ? "bg-primary/15 text-primary" : "bg-bg-elevated text-muted"
                }`}
              >
                {isComplete ? <Icon name="Check" size={20} /> : unlocked ? <Icon name={phase.icon} size={20} /> : <Icon name="Lock" size={16} />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted">Phase {phase.number}</span>
                  <h3 className="font-semibold">{phase.title}</h3>
                </div>
                <p className="text-sm text-muted mt-0.5">{phase.description}</p>
                <p className="text-xs text-muted mt-1">Days {phase.startDay}–{phase.endDay}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 sm:w-56 shrink-0">
              <div className="flex-1">
                <div className="h-2 rounded-full bg-bg-elevated overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
                </div>
                <div className="text-xs text-muted mt-1">{completedInPhase}/{totalDays} days · {progressPercent}%</div>
              </div>
              <Link
                href={`/learn/day/${unlocked ? (completedInPhase < totalDays ? phase.startDay + completedInPhase : phase.startDay) : phase.startDay}`}
                className={`text-sm font-medium px-3 py-1.5 rounded-lg whitespace-nowrap ${
                  unlocked ? "bg-primary text-primary-foreground hover:opacity-90" : "bg-bg-elevated text-muted cursor-not-allowed"
                }`}
                aria-disabled={!unlocked}
              >
                {isComplete ? "Review" : "Continue"}
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
