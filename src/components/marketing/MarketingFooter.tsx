import Link from "next/link";
import { Icon } from "@/components/nav/Icon";

/** Every link below points at a route that actually exists in the repo (docs/PHASE-5.4.md
 * "Footer": "Only link to routes that actually exist") - verified against src/app at the time
 * this was written: /, /roadmap, /features, /pricing, /faq, /about, /contact, /privacy, /terms,
 * /login, /signup, plus the public reference tools (/glossary, /formulas, /case-studies,
 * /calculators, /simulator) that already existed before this redesign. */
const columns = [
  {
    heading: "Product",
    links: [
      { href: "/features", label: "Features" },
      { href: "/pricing", label: "Pricing" },
      { href: "/roadmap", label: "90-Day Roadmap" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    heading: "Learning",
    links: [
      { href: "/glossary", label: "Business Glossary" },
      { href: "/formulas", label: "Formula Library" },
      { href: "/case-studies", label: "Case Studies" },
      { href: "/calculators", label: "Calculators" },
      { href: "/simulator", label: "Business Simulator" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-14">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-10">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/15 text-primary">
                <Icon name="GraduationCap" size={18} />
              </span>
              <span>90-Day Business School</span>
            </Link>
            <p className="text-sm text-muted mt-4 max-w-xs">
              Learn business by building your business thinking — one day at a time.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.heading}>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted mb-4">{col.heading}</h3>
              <ul className="space-y-2.5 text-sm">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-muted hover:text-foreground transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
          <p>© {new Date().getFullYear()} 90-Day Business School.</p>
          <div className="flex items-center gap-5">
            <Link href="/login" className="hover:text-foreground transition-colors">Log in</Link>
            <Link href="/signup" className="hover:text-foreground transition-colors">Sign up</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
