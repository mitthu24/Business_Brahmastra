import { requireFounderOrRedirect } from "@/lib/auth/dal";
import { getDb } from "@/lib/db/client";
import { getUserProfile } from "@/lib/db/auth-queries";
import { FounderShell } from "@/components/founder/FounderShell";

// Every route under /founder/ except /founder/login lives in this group. requireFounderOrRedirect
// re-checks role === "founder" against the DB on every single request to any page here - it is
// the real authorization boundary, not src/proxy.ts (which only does a cheap cookie-presence
// check) and not anything client-side. See docs/PHASE-5.md "Founder route protection".
export default async function FounderProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireFounderOrRedirect();
  const profile = await getUserProfile(getDb(), user.id);

  return (
    <FounderShell founderName={profile?.name ?? null} founderEmail={user.email}>
      {children}
    </FounderShell>
  );
}
