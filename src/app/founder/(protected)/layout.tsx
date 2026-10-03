import Link from "next/link";
import { requireFounderOrRedirect } from "@/lib/auth/dal";
import { FounderLogoutButton } from "./FounderLogoutButton";

// Every route under /founder/ except /founder/login lives in this group. requireFounderOrRedirect
// re-checks role === "founder" against the DB on every single request to any page here - it is
// the real authorization boundary, not src/proxy.ts (which only does a cheap cookie-presence
// check) and not anything client-side. See docs/PHASE-5.md "Founder route protection".
export default async function FounderProtectedLayout({ children }: { children: React.ReactNode }) {
  await requireFounderOrRedirect();

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-bg-elevated">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/founder/dashboard" className="font-semibold text-sm">
              🔑 Founder
            </Link>
            <nav className="flex gap-4 text-sm" aria-label="Founder navigation">
              <Link href="/founder/dashboard" className="text-muted hover:text-foreground">
                Dashboard
              </Link>
              <Link href="/founder/users" className="text-muted hover:text-foreground">
                Users
              </Link>
            </nav>
          </div>
          <FounderLogoutButton />
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
