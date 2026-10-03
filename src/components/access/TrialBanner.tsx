import type { AccessInfo } from "@/lib/access/status";

function formatEndDate(date: Date): string {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/**
 * Pure display of server-computed access info (docs/PHASE-5.md "Trial UX"). This never decides
 * access on its own - it only renders whatever status/daysRemaining the server already computed
 * (via src/lib/access/status.ts), so there is no client-side countdown that could drift from, or
 * be mistaken for, the real authority.
 */
export function TrialBanner({ access }: { access: AccessInfo }) {
  if (access.status === "ACTIVE") return null;

  if (access.status === "TRIAL") {
    const days = access.daysRemaining;
    const label = days <= 0 ? "Trial ends today" : days === 1 ? "1 day remaining" : `${days} days remaining`;
    return (
      <div className="card p-4 mb-6 bg-primary/10 border-primary/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2" role="status">
        <div>
          <p className="text-sm font-medium text-primary">3-day trial · {label}</p>
          <p className="text-xs text-muted mt-0.5">Trial ends {formatEndDate(access.trialEndsAt)}</p>
        </div>
      </div>
    );
  }

  const copy =
    access.status === "EXPIRED"
      ? { title: "Your trial has ended", body: "Your progress is saved. Contact us to reactivate your access." }
      : { title: "Access suspended", body: "Contact the 90-Day Business School team if you believe this is a mistake." };

  return (
    <div className="card p-4 mb-6 bg-danger/10 border-danger/30" role="alert">
      <p className="text-sm font-medium text-danger">{copy.title}</p>
      <p className="text-xs text-muted mt-0.5">{copy.body}</p>
    </div>
  );
}
