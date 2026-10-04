/** A plain pulsing placeholder block - no animation library, just the `animate-pulse` utility
 * Tailwind already ships (which itself respects the global `prefers-reduced-motion: reduce` rule
 * in globals.css). Used by route-level loading.tsx files so a dynamic route (every page under
 * the (app) group is dynamic because the shared layout reads cookies for auth - see
 * docs/PHASE-5.5.1 performance notes) shows an immediate, layout-matching placeholder instead of
 * a blank screen while the server resolves the real data. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-bg-elevated ${className}`} />;
}
