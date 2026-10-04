import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/nav/Icon";
import { ScrollReveal } from "@/components/marketing/ScrollReveal";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Start 90-Day Business School with a 3-day free trial — no payment details required.",
  alternates: { canonical: "/pricing" },
};

const trialIncludes = [
  "All 90 days of lessons, exercises and quizzes",
  "Every calculator, the glossary and formula library",
  "Business Simulator, Canvas and Startup Validator",
  "Progress, streak, XP and achievement tracking",
];

/** No paid tier exists yet in this app (confirmed by inventory - no payment/pricing
 * configuration anywhere in the codebase) - docs/PHASE-5.4.md "Pricing": "Do NOT invent
 * pricing... If payment is not yet implemented, do not create fake checkout functionality."
 * This page is honest about that instead of fabricating a price. */
export default function PricingPage() {
  return (
    <div className="px-4 lg:px-8 max-w-4xl mx-auto pt-16 pb-24">
      <ScrollReveal>
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5">Simple, honest access.</h1>
          <p className="text-lg text-muted max-w-xl mx-auto">
            Every account starts with a full-featured free trial — no payment details required.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <div className="card p-8 max-w-md mx-auto text-center">
          <p className="text-xs font-semibold text-accent uppercase tracking-wide mb-3">Free Trial</p>
          <p className="text-5xl font-bold mb-1">3 days</p>
          <p className="text-sm text-muted mb-6">Full access. No card required.</p>
          <ul className="space-y-2.5 text-sm text-left mb-8">
            {trialIncludes.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <Icon name="Check" size={16} className="text-success shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
          <Link
            href="/signup"
            className="block rounded-lg bg-primary text-primary-foreground px-6 py-3 font-medium hover:opacity-90 transition-opacity"
          >
            Start Your 3-Day Free Trial
          </Link>
        </div>
      </ScrollReveal>

      <ScrollReveal delayMs={100}>
        <div className="mt-12 card p-6 max-w-2xl mx-auto text-center text-sm text-muted">
          <p>
            Paid plans are not live yet. Continued access after your trial is currently arranged directly
            with our team —{" "}
            <Link href="/contact" className="text-primary hover:underline">
              contact us
            </Link>{" "}
            if you&apos;d like to keep going.
          </p>
        </div>
      </ScrollReveal>
    </div>
  );
}
