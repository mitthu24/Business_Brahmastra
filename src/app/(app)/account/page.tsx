import type { Metadata } from "next";
import { verifyAccess } from "@/lib/auth/dal";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db/client";
import { getUserProfile } from "@/lib/db/auth-queries";
import { Icon } from "@/components/nav/Icon";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { LogoutButton } from "./LogoutButton";

export const metadata: Metadata = { title: "Account" };
export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Active",
  TRIAL: "Trial",
  EXPIRED: "Trial ended",
  SUSPENDED: "Suspended",
};

const STATUS_TONE: Record<string, string> = {
  ACTIVE: "bg-success/15 text-success",
  TRIAL: "bg-primary/15 text-primary",
  EXPIRED: "bg-warning/15 text-warning",
  SUSPENDED: "bg-danger/15 text-danger",
};

export default async function AccountPage() {
  const access = await verifyAccess();
  if (!access) redirect("/login");
  const { user, status, accessInfo } = access;
  const db = getDb();
  const profile = await getUserProfile(db, user.id);
  const initials = (profile?.name ?? user.email).slice(0, 1).toUpperCase();

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-1">Account</h1>
      <p className="text-muted mb-8">Manage your account, sign-in details and access.</p>

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        {/* Left: identity + access summary */}
        <div className="space-y-6">
          <div className="card p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/15 text-primary text-2xl font-bold flex items-center justify-center mx-auto mb-3">
              {initials}
            </div>
            <p className="font-semibold">{profile?.name ?? "—"}</p>
            <p className="text-sm text-muted break-all">{user.email}</p>
            <span className={`inline-block mt-3 text-xs font-medium rounded-full px-3 py-1 ${STATUS_TONE[status] ?? "bg-bg-elevated text-muted"}`}>
              {STATUS_LABEL[status] ?? status}
            </span>
          </div>
          <div className="hidden lg:block">
            <LogoutButton />
          </div>
        </div>

        {/* Right: details + security */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Icon name="User" size={16} className="text-primary" />
              Profile
            </h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Name</dt>
                <dd className="font-medium">{profile?.name ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Email</dt>
                <dd className="font-medium">{user.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Member since</dt>
                <dd className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</dd>
              </div>
            </dl>
          </div>

          <div className="card p-6">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Icon name="ShieldCheck" size={16} className="text-primary" />
              Access status
            </h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Status</dt>
                <dd className="font-medium">{STATUS_LABEL[status] ?? status}</dd>
              </div>
              {status === "TRIAL" && (
                <div className="flex justify-between">
                  <dt className="text-muted">Trial ends</dt>
                  <dd className="font-medium">
                    {accessInfo.trialEndsAt.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    {" "}({accessInfo.daysRemaining <= 1 ? "today/tomorrow" : `${accessInfo.daysRemaining} days left`})
                  </dd>
                </div>
              )}
              {(status === "EXPIRED" || status === "SUSPENDED") && (
                <p className="text-muted">
                  Your account and all your progress, journal, canvas and final project entries are preserved.
                  Contact the 90-Day Business School team to reactivate access.
                </p>
              )}
            </dl>
          </div>

          <div className="card p-6">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Icon name="Lock" size={16} className="text-primary" />
              Change password
            </h2>
            <ChangePasswordForm />
          </div>

          <div className="lg:hidden">
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
}
