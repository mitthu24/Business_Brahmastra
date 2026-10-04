import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

/** Phase 5.4 marketing redesign: public, unauthenticated marketing pages (/, /features,
 * /pricing, /about, /contact, /faq, /privacy, /terms) get their own premium nav/footer, entirely
 * separate from the learner app's AppShell (src/components/nav/AppShell.tsx) used by
 * src/app/(public)/* (roadmap, glossary, calculators, etc.) - those reference-tool pages are left
 * untouched by this redesign, as required. No auth check here, same as (public): any visitor
 * sees the same marketing site. */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
