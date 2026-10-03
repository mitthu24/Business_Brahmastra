import Link from "next/link";
import type { AccessStatus } from "@/lib/access/status";

const COPY: Record<"EXPIRED" | "SUSPENDED", { title: string; body: string }> = {
  EXPIRED: {
    title: "Your trial has ended",
    body:
      "Your 3-day trial has finished. Your account, progress, journal, canvas and final project are all safe - " +
      "you just can't start new lessons until your access is reactivated.",
  },
  SUSPENDED: {
    title: "Access suspended",
    body:
      "Your access has been suspended. Your account and progress are preserved. Please contact the " +
      "90-Day Business School team if you believe this is a mistake.",
  },
};

/** Rendered in place of gated learning content for EXPIRED/SUSPENDED users - never a redirect, so
 * the user keeps their navigation and can still reach /progress, /journal, /account, etc. to see
 * their preserved data. See docs/PHASE-5.md "Trial UX". */
export function AccessExpiredNotice({ status }: { status: Extract<AccessStatus, "EXPIRED" | "SUSPENDED"> }) {
  const copy = COPY[status];
  return (
    <div className="card p-6 max-w-lg" role="status">
      <h1 className="text-xl font-bold mb-2">{copy.title}</h1>
      <p className="text-sm text-muted mb-5">{copy.body}</p>
      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard" className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-bg-elevated transition-colors">
          Back to dashboard
        </Link>
        <Link href="/account" className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity">
          View account status
        </Link>
      </div>
    </div>
  );
}
