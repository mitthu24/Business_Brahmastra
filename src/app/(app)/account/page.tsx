import type { Metadata } from "next";
import { requireUserOrRedirect } from "@/lib/auth/dal";
import { getDb } from "@/lib/db/client";
import { findUserById, getUserProfile } from "@/lib/db/auth-queries";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { LogoutButton } from "./LogoutButton";

export const metadata: Metadata = { title: "Account" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await requireUserOrRedirect();
  const db = getDb();
  const [user, profile] = await Promise.all([findUserById(db, session.userId), getUserProfile(db, session.userId)]);

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-1">Account</h1>
      <p className="text-muted mb-6">Manage your account and sign-in details.</p>

      <div className="card p-5 mb-6">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Name</dt>
            <dd className="font-medium">{profile?.name ?? "—"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Email</dt>
            <dd className="font-medium">{user?.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Member since</dt>
            <dd className="font-medium">{user ? new Date(user.createdAt).toLocaleDateString() : "—"}</dd>
          </div>
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
