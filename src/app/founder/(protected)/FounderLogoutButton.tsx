"use client";

import { founderLogout } from "../actions";

export function FounderLogoutButton() {
  return (
    <form action={founderLogout}>
      <button
        type="submit"
        className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground hover:border-danger/50 transition-colors"
      >
        Log out
      </button>
    </form>
  );
}
