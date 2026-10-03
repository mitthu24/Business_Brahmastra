import type { Metadata } from "next";
import { verifyAccess } from "@/lib/auth/dal";
import { getDb } from "@/lib/db/client";
import { getUserProfile } from "@/lib/db/auth-queries";
import { DashboardView } from "@/components/dashboard/DashboardView";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // (app) layout already enforces authentication; dashboard additionally needs the user's name
  // and live access status (trial days remaining, etc.) to render - it does NOT gate access here,
  // since an expired/suspended user should still see their dashboard and data (docs/PHASE-5.md).
  const access = await verifyAccess();
  const profile = access ? await getUserProfile(getDb(), access.user.id) : null;

  return <DashboardView userName={profile?.name ?? null} access={access?.accessInfo ?? null} />;
}
