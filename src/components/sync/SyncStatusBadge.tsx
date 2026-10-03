"use client";

import { useProgressStore } from "@/lib/progress/store";
import { Icon } from "@/components/nav/Icon";

export function SyncStatusBadge() {
  const syncStatus = useProgressStore((s) => s.syncStatus);
  const retrySync = useProgressStore((s) => s.retrySync);

  if (syncStatus === "idle" || syncStatus === "saved") {
    return (
      <span className="hidden sm:flex items-center gap-1 text-xs text-muted" aria-live="polite">
        <Icon name="Cloud" size={13} /> Synced
      </span>
    );
  }
  if (syncStatus === "saving") {
    return (
      <span className="hidden sm:flex items-center gap-1 text-xs text-muted" aria-live="polite">
        <Icon name="Loader" size={13} className="animate-spin" /> Saving…
      </span>
    );
  }

  const label = syncStatus === "offline" ? "Offline" : "Sync failed";
  return (
    <button
      onClick={retrySync}
      className="flex items-center gap-1 text-xs text-danger hover:underline"
      aria-live="polite"
    >
      <Icon name="CloudOff" size={13} /> {label} · Retry
    </button>
  );
}
