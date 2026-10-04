"use client";

import { useEffect, useRef, useState } from "react";

/** Animates from 0 to `value` once visible, then stays put - never re-triggers on scroll back
 * up/down (a counter that re-counts every time it re-enters the viewport reads as a bug, not a
 * feature). Respects reduced motion implicitly: the interval below is a value change, not a CSS
 * animation, but check for the media query explicitly here since nothing in globals.css can
 * silence a JS setInterval - a reduced-motion visitor sees the final value immediately. */
function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function Counter({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(() => (prefersReducedMotion() ? value : 0));

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const duration = 900;
        const start = performance.now();
        function tick(now: number) {
          const progress = Math.min((now - start) / duration, 1);
          setDisplay(Math.round(value * progress));
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={ref}>
      {prefix}
      {display.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}
