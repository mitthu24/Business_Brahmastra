"use client";

import { useEffect, useRef, useState } from "react";

/** Lightweight scroll-reveal: fades/slides an element in once it enters the viewport, via a
 * single shared IntersectionObserver pattern rather than a library (docs/PHASE-5.4.md
 * "Performance": "Avoid loading heavy animation libraries for simple CSS animations"). The
 * transition is plain CSS, so the global `prefers-reduced-motion: reduce` rule in globals.css
 * (which zeroes all animation/transition durations site-wide) silences it automatically - no
 * per-component reduced-motion check needed. */
export function ScrollReveal({
  children,
  className = "",
  delayMs = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"} ${className}`}
      style={{ transitionDelay: visible ? `${delayMs}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}
