import type { Metadata } from "next";
import { Icon } from "@/components/nav/Icon";
import { ScrollReveal } from "@/components/marketing/ScrollReveal";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the 90-Day Business School team.",
  alternates: { canonical: "/contact" },
};

/** No contact backend exists in this app, and the spec is explicit: "Do not build a fake
 * contact backend. Use the existing implementation if present" (docs/PHASE-5.4.md "Contact
 * Page"). With no existing implementation, a plain mailto link is the honest minimum - it sends
 * through the visitor's own mail client rather than simulating a working form submission. Uses
 * the same placeholder domain as metadataBase (src/app/layout.tsx) rather than a real-looking
 * domain this product does not actually own - replace both together once a real domain and inbox
 * exist. */
const SUPPORT_EMAIL = "support@example.com";

const reasons = [
  { icon: "HelpCircle", title: "Product questions", desc: "Anything about how the 90-day journey, calculators, or tools work." },
  { icon: "LifeBuoy", title: "Account & access", desc: "Trial, login issues, or continuing access after your trial ends." },
  { icon: "MessageSquare", title: "Feedback", desc: "Found something confusing, broken, or worth improving? Tell us." },
];

export default function ContactPage() {
  return (
    <div className="px-4 lg:px-8 max-w-3xl mx-auto pt-16 pb-24">
      <ScrollReveal>
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5">Get in touch.</h1>
          <p className="text-lg text-muted">We read every message.</p>
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <div className="card p-8 text-center mb-10">
          <Icon name="Mail" size={28} className="text-primary mx-auto mb-4" />
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-lg font-medium text-primary hover:underline">
            {SUPPORT_EMAIL}
          </a>
          <p className="text-sm text-muted mt-2">We aim to respond within 2 business days.</p>
        </div>
      </ScrollReveal>

      <div className="grid sm:grid-cols-3 gap-4">
        {reasons.map((r, i) => (
          <ScrollReveal key={r.title} delayMs={i * 80}>
            <div className="card p-5 h-full">
              <Icon name={r.icon} size={20} className="text-primary mb-2.5" />
              <h3 className="font-medium text-sm mb-1">{r.title}</h3>
              <p className="text-xs text-muted">{r.desc}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
