"use client";

import { logout } from "@/app/(auth)/actions";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:text-foreground hover:border-danger/50 transition-colors"
      >
        Log out
      </button>
    </form>
  );
}
