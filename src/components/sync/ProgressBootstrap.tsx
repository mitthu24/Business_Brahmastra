"use client";

import { useEffect, useRef } from "react";
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

/** Runs once per browser, right after the protected app shell mounts (i.e. right after
 * signup/login): migrates any pre-existing localStorage progress to the cloud exactly once
 * (server-side idempotency guards this even if the client flag is somehow lost - see
 * src/lib/db/migration-queries.ts), then hydrates the store from the server, which is the
 * single source of truth from this point on. Renders nothing. */
export function ProgressBootstrap() {
  const hydrateFromServer = useProgressStore((s) => s.hydrateFromServer);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

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
