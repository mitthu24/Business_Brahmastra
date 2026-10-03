"use client";

import { phases } from "@/lib/content/phases";
import { useProgressStore } from "@/lib/progress/store";
import { PhaseCard } from "@/components/ui/PhaseCard";
import { Icon } from "@/components/nav/Icon";

export function RoadmapView() {
  const completedDays = useProgressStore((s) => s.completedDays);
  const completedSet = new Set(completedDays);

  return (
    <div className="relative max-w-3xl mx-auto">
      {/* connecting rail */}
      <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-border hidden sm:block" aria-hidden />

      <div className="flex flex-col items-center gap-1 mb-4 sm:ml-0">
        <div className="w-12 h-12 rounded-full bg-success/20 text-success flex items-center justify-center font-bold">
          <Icon name="Play" size={18} />
        </div>
        <p className="text-xs text-muted">START</p>
      </div>

      <div className="space-y-4">
        {phases.map((phase, idx) => {
          const totalDays = phase.endDay - phase.startDay + 1;
          const completedInPhase = Array.from({ length: totalDays }, (_, i) => phase.startDay + i).filter((d) =>
            completedSet.has(d)
          ).length;
          const previousPhase = phases[idx - 1];
          const previousComplete = !previousPhase
            ? true
            : Array.from({ length: previousPhase.endDay - previousPhase.startDay + 1 }, (_, i) => previousPhase.startDay + i).every(
                (d) => completedSet.has(d)
              );
          const unlocked = idx === 0 || previousComplete || completedInPhase > 0;
          const isComplete = completedInPhase === totalDays;
          const isCurrent = unlocked && !isComplete;

          const nextDay = completedInPhase < totalDays ? phase.startDay + completedInPhase : phase.startDay;

          return (
            <div key={phase.id} className="sm:pl-14 relative">
              <div className="hidden sm:flex absolute left-0 top-5 w-12 h-12 items-center justify-center">
                <div className={`w-3 h-3 rounded-full ${isComplete ? "bg-success" : isCurrent ? "bg-primary" : "bg-border"}`} />
              </div>
              <PhaseCard
                phase={phase}
                state={isComplete ? "completed" : isCurrent ? "current" : "upcoming"}
                completedInPhase={completedInPhase}
                totalDays={totalDays}
                href={`/learn/day/${unlocked ? nextDay : phase.startDay}`}
              />
            </div>
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-1 mt-4">
        <div className="w-12 h-12 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold">
          <Icon name="Trophy" size={18} />
        </div>
        <p className="text-xs text-muted">FOUNDER PROJECT</p>
      </div>
    </div>
  );
}
