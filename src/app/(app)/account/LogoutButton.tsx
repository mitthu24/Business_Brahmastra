"use client";

import { logout } from "@/app/(auth)/actions";
import { useProgressStore } from "@/lib/progress/store";
import { resetBootstrapGuard } from "@/components/sync/ProgressBootstrap";

/**
 * Clears this browser tab's client-side progress state before the server logout action runs
 * (confirmed security-review finding, Phase 5.5.2 follow-up): the server action only clears the
 * session cookie - it has no way to reach into the browser's Zustand store or localStorage. Without
 * this, if a different user logs in afterward in the SAME TAB (no hard reload), the module-level
 * "already synced" guard added in Phase 5.5.2 (src/components/sync/ProgressBootstrap.tsx) would
 * skip that user's fetch entirely, and the previous user's progress - still sitting in the store
 * and in localStorage - would be what renders. resetLocalProgress() zeroes the store (and its
 * persisted localStorage copy) and resetBootstrapGuard() clears the module flag, so the very next
 * ProgressBootstrap mount (which happens on login, since (auth) pages don't render it at all)
 * unconditionally fetches fresh, correctly-scoped data for whoever is now authenticated.
 */
function clearClientProgressState() {
  useProgressStore.getState().resetLocalProgress();
  resetBootstrapGuard();
}

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        onClick={clearClientProgressState}
        className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:text-foreground hover:border-danger/50 transition-colors"
      >
        Log out
      </button>
    </form>
  );
}
