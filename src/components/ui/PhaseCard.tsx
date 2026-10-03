import Link from "next/link";
import { Icon } from "@/components/nav/Icon";
import { ProgressBar } from "./ProgressBar";
import type { Phase } from "@/lib/content/types";

export type PhaseState = "completed" | "current" | "upcoming";

export function PhaseCard({
  phase,
  state,
  completedInPhase,
  totalDays,
  href,
}: {
  phase: Phase;
  state: PhaseState;
  completedInPhase: number;
  totalDays: number;
  href: string;
}) {
  const percent = Math.round((completedInPhase / totalDays) * 100);

  return (
    <Link
      href={href}
      className={`card p-5 flex flex-col gap-3 transition-all hover:border-primary/50 ${
        state === "current" ? "border-primary ring-1 ring-primary/40 scale-[1.02] shadow-lg" : ""
      }`}
      aria-current={state === "current" ? "step" : undefined}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold shrink-0 ${
            state === "completed"
              ? "bg-success/20 text-success"
              : state === "current"
              ? "bg-primary/20 text-primary"
              : "bg-bg-elevated text-muted"
          }`}
        >
          {state === "completed" ? <Icon name="Check" size={20} /> : <Icon name={phase.icon} size={20} />}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted">PHASE {String(phase.number).padStart(2, "0")}</p>
          <p className="font-semibold leading-tight">{phase.title}</p>
          <p className="text-xs text-muted">Days {phase.startDay}–{phase.endDay}</p>
        </div>
        {state === "current" && (
          <span className="ml-auto text-[10px] rounded-full bg-primary text-primary-foreground px-2 py-0.5 shrink-0">CURRENT</span>
        )}
      </div>
      <p className="text-sm text-muted">{phase.description}</p>
      <ProgressBar percent={percent} size="sm" label={`${completedInPhase}/${totalDays} days · ${percent}%`} />
    </Link>
  );
}
