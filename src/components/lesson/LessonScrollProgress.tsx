"use client";

import { useEffect, useState } from "react";

/** Phone-only (docs/PHASE-5.5.md "Lesson Progress": "Step X of Y, overall lesson progress...
 * animated progress indicators"). On a long lesson page the 90-day roadmap progress bar in the
 * header answers "how far through the course", not "how far through THIS lesson" - this answers
 * the second question, specifically for the small screen where scrolling to re-check your place
 * is most annoying. Pure presentation: tracks scroll position within the lesson <article>,
 * touches no completion/XP/streak state.
 *
 * Phase 5.5.1 performance fix: this previously ran its scroll handler (and a setState per event)
 * on every device, including desktop, even though the element it drives is `lg:hidden` and
 * therefore invisible there - pure wasted re-renders on every scroll while reading a lesson on a
 * wide screen. It now (a) skips attaching the listener at all above the `lg` breakpoint, matching
 * the CSS that hides the element, and (b) throttles updates to one per animation frame instead of
 * one per scroll event, which on a fast trackpad/touch flick can fire dozens of times a frame. */
export function LessonScrollProgress({ sectionCount }: { sectionCount: number }) {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(min-width: 1024px)").matches) return;

    const article = document.querySelector("article");
    if (!article) return;

    let ticking = false;

    function measure() {
      ticking = false;
      const rect = article!.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) {
        setPercent(100);
        return;
      }
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      setPercent(Math.round((scrolled / total) * 100));
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(measure);
    }

    measure();
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
