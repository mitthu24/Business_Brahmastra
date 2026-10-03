import type { Metadata } from "next";
import { verifyAccess } from "@/lib/auth/dal";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db/client";
import { getUserProfile } from "@/lib/db/auth-queries";
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

export default async function AccountPage() {
  const access = await verifyAccess();
  if (!access) redirect("/login");
  const { user, status, accessInfo } = access;
  const db = getDb();
  const profile = await getUserProfile(db, user.id);

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-1">Account</h1>
      <p className="text-muted mb-6">Manage your account, sign-in details and access.</p>

      <div className="card p-5 mb-6">
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

      <div className="card p-5 mb-6">
        <h2 className="text-sm font-semibold mb-3">Access status</h2>
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

      <div className="card p-5 mb-6">
        <h2 className="text-sm font-semibold mb-3">Change password</h2>
        <ChangePasswordForm />
      </div>

      <LogoutButton />
    </div>
  );
}
