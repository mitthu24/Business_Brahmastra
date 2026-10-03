import { AppShell } from "@/components/nav/AppShell";
import { requireUserOrRedirect } from "@/lib/auth/dal";

export default async function AppGroupLayout({ children }: { children: React.ReactNode }) {
  // Redirects to /login if there is no valid, DB-verified session. This is the real
  // authorization boundary for every page under this layout (src/proxy.ts only does a cheap,
  // optimistic cookie-presence check before this ever runs) - see docs/PHASE-4.md.
  await requireUserOrRedirect();
  return <AppShell>{children}</AppShell>;
}
