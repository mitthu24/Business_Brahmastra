"use client";

import { useState, useTransition } from "react";
import type { ContentStatus } from "@/lib/db/content-queries";

type SetStatusFn = (id: string, status: ContentStatus) => Promise<{ ok: boolean; error?: string }>;

/** Shared publish/unpublish/archive/restore controls for the glossary, formula, and case-study
 * CMS (Phase 5.3 slice 2) - the three content types have identical status-transition UI, so this
 * is the one place that logic lives rather than copy-pasted three times. `setStatus` is the
 * type-specific server action (setGlossaryStatusAction / setFormulaStatusAction /
 * setCaseStudyStatusAction), passed in as a prop from the server-rendered page. */
export function ContentStatusActions({ id, status, setStatus }: { id: string; status: ContentStatus; setStatus: SetStatusFn }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(next: ContentStatus) {
    setError(null);
    startTransition(async () => {
      const result = await setStatus(id, next);
      if (!result.ok) setError(result.error ?? "Action failed.");
    });
  }

  return (
    <div className="flex flex-col gap-1 items-start">
      <div className="flex flex-wrap gap-1.5">
        {status !== "published" && (
          <button
            type="button"
            disabled={pending}
            onClick={() => run("published")}
            className="rounded-md border border-border px-2 py-1 text-xs font-medium hover:bg-bg-elevated transition-colors disabled:opacity-50"
          >
            Publish
          </button>
        )}
        {status === "published" && (
          <button
            type="button"
            disabled={pending}
            onClick={() => run("draft")}
            className="rounded-md border border-border px-2 py-1 text-xs font-medium hover:bg-bg-elevated transition-colors disabled:opacity-50"
          >
            Unpublish
          </button>
        )}
        {status === "draft" && (
          <button
            type="button"
            disabled={pending}
            onClick={() => run("archived")}
            className="rounded-md border border-danger/40 text-danger px-2 py-1 text-xs font-medium hover:bg-danger/10 transition-colors disabled:opacity-50"
          >
            Archive
          </button>
        )}
        {status === "archived" && (
          <button
            type="button"
            disabled={pending}
            onClick={() => run("draft")}
            className="rounded-md border border-border px-2 py-1 text-xs font-medium hover:bg-bg-elevated transition-colors disabled:opacity-50"
          >
            Restore to draft
          </button>
        )}
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
