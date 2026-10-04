"use client";

import { useState } from "react";
import Link from "next/link";
import { phases } from "@/lib/content/phases";
import { Icon } from "@/components/nav/Icon";

/** Interactive 15-phase roadmap teaser for the marketing homepage - a compact, clickable
 * timeline, not the full 90-lesson wall the spec explicitly warns against
 * (docs/PHASE-5.4.md "90-Day Roadmap Section": "Do not display all 90 lessons in a huge wall").
 * Reads the same src/lib/content/phases.ts data the real /roadmap page and founder curriculum
 * CMS use, so it can never drift out of sync with the actual product. Desktop renders a
 * horizontal scrollable timeline; mobile renders a vertical one - built mobile-first rather than
 * just shrinking the desktop layout. */
export function RoadmapGraphic() {
  const [activeId, setActiveId] = useState(phases[0].id);
  const active = phases.find((p) => p.id === activeId) ?? phases[0];

  return (
    <div>
      {/* Desktop: horizontal timeline */}
      <div className="hidden lg:block">
        <div className="relative flex gap-2 overflow-x-auto pb-4 scrollbar-thin">
          {phases.map((phase) => (
            <button
              key={phase.id}
              type="button"
              onClick={() => setActiveId(phase.id)}
              aria-pressed={phase.id === activeId}
              className={`flex-shrink-0 flex flex-col items-center gap-2 px-3 py-3 rounded-xl border transition-colors min-w-[86px] ${
                phase.id === activeId
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border text-muted hover:border-primary/40 hover:text-foreground"
              }`}
            >
              <Icon name={phase.icon} size={20} className={phase.id === activeId ? "text-primary" : ""} />
              <span className="text-xs font-semibold">Day {phase.startDay}</span>
              <span className="text-[11px] text-center leading-tight">{phase.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile/tablet: vertical timeline */}
      <div className="lg:hidden space-y-2">
        {phases.map((phase) => (
          <button
            key={phase.id}
            type="button"
            onClick={() => setActiveId(activeId === phase.id ? "" : phase.id)}
            aria-expanded={activeId === phase.id}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-colors ${
              activeId === phase.id ? "border-primary bg-primary/10" : "border-border"
            }`}
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/15 text-primary font-semibold text-sm shrink-0">
              {phase.number}
            </span>
            <span className="flex-1">
              <span className="block text-sm font-medium">{phase.title}</span>
              <span className="block text-xs text-muted">Days {phase.startDay}–{phase.endDay}</span>
            </span>
            <Icon name="ChevronDown" size={18} className={`text-muted transition-transform ${activeId === phase.id ? "rotate-180" : ""}`} />
          </button>
        ))}
      </div>

      {/* Desktop detail panel for the active phase */}
      <div className="hidden lg:block mt-4 card p-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/15 text-primary font-semibold">
            {active.number}
          </span>
          <div>
            <h3 className="font-semibold">{active.title}</h3>
            <p className="text-xs text-muted">Days {active.startDay}–{active.endDay}</p>
          </div>
        </div>
        <p className="text-sm text-muted">{active.description}</p>
      </div>

      {/* Mobile expanded description, inline under the active phase row */}
      <div className="lg:hidden">
        {activeId && (
          <p className="text-sm text-muted px-4 py-3 mt-1">{phases.find((p) => p.id === activeId)?.description}</p>
        )}
      </div>

      <div className="text-center mt-8">
        <Link href="/roadmap" className="text-sm font-medium text-primary hover:underline">
          Explore the full 90-day roadmap →
        </Link>
      </div>
    </div>
  );
}
