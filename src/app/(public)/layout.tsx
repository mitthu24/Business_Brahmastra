import { AppShell } from "@/components/nav/AppShell";

// Phase 5 "Public vs authenticated access": these pages (roadmap, glossary, formulas,
// calculators, case-studies, simulator) are reference/learning tools that don't require an
// account. Unlike the (app) group's layout, this one does NOT call requireUserOrRedirect - a
// visitor with no session at all can read everything here. The same AppShell is reused so logged
// in and anonymous visitors get identical navigation; ProgressBootstrap inside it already
// degrades gracefully (401s silently) for anonymous visitors.
export default function PublicGroupLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
