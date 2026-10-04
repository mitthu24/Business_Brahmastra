"use client";

import { useState } from "react";
import { phases } from "@/lib/content/phases";
import { useProgressStore } from "@/lib/progress/store";
import { PhaseCard } from "@/components/ui/PhaseCard";
import { Icon } from "@/components/nav/Icon";

/** Phase state derivation (unlocked/complete/current) is shared verbatim between the desktop
 * horizontal timeline and the mobile vertical one below - this is presentation-only, the
 * progression logic itself (what counts as unlocked) is untouched from before the Phase 5.5
 * redesign. */
function usePhaseStates() {
  const completedDays = useProgressStore((s) => s.completedDays);
  const completedSet = new Set(completedDays);

  return phases.map((phase, idx) => {
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

    return { phase, totalDays, completedInPhase, unlocked, isComplete, isCurrent, nextDay };
  });
}

export function RoadmapView() {
  const phaseStates = usePhaseStates();
  const [activeIdx, setActiveIdx] = useState(() => phaseStates.findIndex((p) => p.isCurrent) || 0);
  const active = phaseStates[activeIdx] ?? phaseStates[0];

  return (
    <div>
      {/* Desktop: horizontal structured timeline (docs/PHASE-5.5.md "90-Day Journey") */}
      <div className="hidden lg:block">
        <div className="relative">
          <div className="absolute left-0 right-0 top-6 h-0.5 bg-border" aria-hidden />
          <div className="relative flex justify-between gap-1">
            {phaseStates.map((p, idx) => (
              <button
                key={p.phase.id}
                type="button"
                onClick={() => setActiveIdx(idx)}
                aria-pressed={idx === activeIdx}
                className="flex flex-col items-center gap-2 group flex-1 min-w-0"
              >
                <span
                  className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center font-bold shrink-0 border-2 transition-all ${
                    p.isComplete
                      ? "bg-success/20 text-success border-success"
                      : p.isCurrent
                      ? "bg-primary text-primary-foreground border-primary scale-110 shadow-lg"
                      : "bg-bg-elevated text-muted border-border"
                  } ${idx === activeIdx ? "ring-2 ring-primary/40 ring-offset-2 ring-offset-bg" : ""}`}
                >
                  {p.isComplete ? <Icon name="Check" size={18} /> : p.unlocked ? p.phase.number : <Icon name="Lock" size={14} />}
                </span>
                <span className={`text-[11px] text-center leading-tight truncate w-full ${p.isCurrent ? "text-foreground font-medium" : "text-muted"}`}>
                  {p.phase.title}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <PhaseCard
            phase={active.phase}
            state={active.isComplete ? "completed" : active.isCurrent ? "current" : "upcoming"}
            completedInPhase={active.completedInPhase}
            totalDays={active.totalDays}
            href={`/learn/day/${active.unlocked ? active.nextDay : active.phase.startDay}`}
          />
        </div>
      </div>

      {/* Mobile: vertical timeline */}
      <div className="lg:hidden relative max-w-3xl mx-auto">
        <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-border hidden sm:block" aria-hidden />

        <div className="flex flex-col items-center gap-1 mb-4 sm:ml-0">
          <div className="w-12 h-12 rounded-full bg-success/20 text-success flex items-center justify-center font-bold">
            <Icon name="Play" size={18} />
          </div>
          <p className="text-xs text-muted">START</p>
        </div>

        <div className="space-y-4">
          {phaseStates.map((p) => (
            <div key={p.phase.id} className="sm:pl-14 relative">
              <div className="hidden sm:flex absolute left-0 top-5 w-12 h-12 items-center justify-center">
                <div className={`w-3 h-3 rounded-full ${p.isComplete ? "bg-success" : p.isCurrent ? "bg-primary" : "bg-border"}`} />
              </div>
              <PhaseCard
                phase={p.phase}
                state={p.isComplete ? "completed" : p.isCurrent ? "current" : "upcoming"}
                completedInPhase={p.completedInPhase}
                totalDays={p.totalDays}
                href={`/learn/day/${p.unlocked ? p.nextDay : p.phase.startDay}`}
              />
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-1 mt-4">
          <div className="w-12 h-12 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold">
            <Icon name="Trophy" size={18} />
          </div>
          <p className="text-xs text-muted">FOUNDER PROJECT</p>
        </div>
      </div>
    </div>
  );
}
