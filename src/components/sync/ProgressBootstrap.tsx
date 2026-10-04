"use client";

import { useEffect } from "react";
import { useProgressStore, type ServerProgressSnapshot } from "@/lib/progress/store";

const MIGRATION_FLAG_KEY = "bb-cloud-migration-complete";
const LOCAL_PROGRESS_KEY = "business-school-progress";
const LOCAL_JOURNAL_KEY = "founder-journal";
const LOCAL_CANVAS_KEY = "business-model-canvas";
const LOCAL_FINAL_PROJECT_KEY = "final-project-answers";

function readJSON<T>(key: string): T | undefined {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
}

function buildLocalSnapshot() {
  // zustand's `persist` wraps the state in { state, version }.
  const persisted = readJSON<{ state?: Record<string, unknown> }>(LOCAL_PROGRESS_KEY);
  const progress = persisted?.state;
  const journal = readJSON(LOCAL_JOURNAL_KEY);
  const canvas = readJSON(LOCAL_CANVAS_KEY);
  const finalProjectAnswers = readJSON(LOCAL_FINAL_PROJECT_KEY);
  return { progress, journal, canvas, finalProjectAnswers };
}

// Module-level, not component state (Phase 5.5.2 performance fix): AppShell - and therefore this
// component - mounts separately in the (app) layout and the (public) layout, so navigating
// between e.g. /dashboard and /roadmap unmounts and remounts it. A `useRef` guard resets on every
// such remount, which was silently refiring the full migration-check + GET /api/progress network
// round trip on every single crossing between the two route groups - a real, unnecessary DB hit
// each time, even though the Zustand store (a module-level singleton, unaffected by component
// remounts) already held perfectly valid, already-hydrated data. A plain module-level flag is a
// real per-browser-session guard (reset only by an actual full page load/new tab, matching what
// this component's own "runs once per browser" contract always claimed), not a per-mount one.
//
// SAFETY (Phase 5.5.2 follow-up, after review): this flag surviving remounts is exactly what
// makes it safe to skip redundant refetches for the SAME user - but it would just as happily skip
// the fetch for a DIFFERENT user who logs in afterward in the same browser tab (no hard reload),
// since nothing about this module knows a user changed. That is not this flag's job to know -
// resetBootstrapGuard() below exists so the one place that DOES know (logout) can reset it
// explicitly. See LogoutButton.tsx, which calls this alongside
// useProgressStore.getState().resetLocalProgress() before the server logout action runs, and
// src/lib/progress/store.test.ts / src/components/sync/ProgressBootstrap.test.ts for the
// regression coverage.
let hasBootstrappedThisSession = false;

export function resetBootstrapGuard() {
  hasBootstrappedThisSession = false;
}

/** Runs once per browser, right after the protected app shell mounts (i.e. right after
 * signup/login): migrates any pre-existing localStorage progress to the cloud exactly once
 * (server-side idempotency guards this even if the client flag is somehow lost - see
 * src/lib/db/migration-queries.ts), then hydrates the store from the server, which is the
 * single source of truth from this point on. Renders nothing. */
export function ProgressBootstrap() {
  const hydrateFromServer = useProgressStore((s) => s.hydrateFromServer);

  useEffect(() => {
    if (hasBootstrappedThisSession) return;
    hasBootstrappedThisSession = true;

    (async () => {
      try {
        let alreadyMigrated = false;
        try {
          alreadyMigrated = window.localStorage.getItem(MIGRATION_FLAG_KEY) === "1";
        } catch {
          // localStorage unavailable (private mode) - fall through and let the server decide.
        }

        if (!alreadyMigrated) {
          const snapshot = buildLocalSnapshot();
          const hasAnyLocalData =
            snapshot.progress || snapshot.journal || snapshot.canvas || snapshot.finalProjectAnswers;
          if (hasAnyLocalData) {
            await fetch("/api/migrate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(snapshot),
            }).catch(() => null);
          }
          try {
            window.localStorage.setItem(MIGRATION_FLAG_KEY, "1");
          } catch {
            // ignore
          }
        }

        const res = await fetch("/api/progress");
        if (res.ok) {
          const data: ServerProgressSnapshot = await res.json();
          hydrateFromServer(data);
        }
      } catch {
        // Offline or DB unavailable on first load: the store keeps whatever it already had
        // (from its own localStorage cache via zustand/persist), and SyncStatusBadge will show
        // a retry affordance once a mutation is attempted.
      }
    })();
  }, [hydrateFromServer]);

  return null;
}
