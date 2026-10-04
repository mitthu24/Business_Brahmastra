"use client";

import { useEffect, useState } from "react";

/** Phone-only (docs/PHASE-5.5.md "Lesson Progress": "Step X of Y, overall lesson progress...
 * animated progress indicators"). On a long lesson page the 90-day roadmap progress bar in the
 * header answers "how far through the course", not "how far through THIS lesson" - this answers
 * the second question, specifically for the small screen where scrolling to re-check your place
 * is most annoying. Pure presentation: tracks scroll position within the lesson <article>,
 * touches no completion/XP/streak state. */
export function LessonScrollProgress({ sectionCount }: { sectionCount: number }) {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const article = document.querySelector("article");
    if (!article) return;

    function onScroll() {
      const rect = article!.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) {
        setPercent(100);
        return;
      }
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      setPercent(Math.round((scrolled / total) * 100));
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const currentStep = Math.max(1, Math.min(sectionCount, Math.ceil((percent / 100) * sectionCount)));

  return (
    <div className="lg:hidden sticky top-[57px] z-20 -mx-4 px-4 py-2 bg-bg/95 backdrop-blur border-b border-border">
      <div className="flex items-center justify-between text-[11px] text-muted mb-1">
        <span>Step {currentStep} of {sectionCount}</span>
        <span>{percent}%</span>
      </div>
      <div className="h-1 rounded-full bg-bg-elevated overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-[width] duration-200 motion-reduce:transition-none" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
