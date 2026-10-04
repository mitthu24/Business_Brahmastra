import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/nav/Icon";
import { ScrollReveal } from "@/components/marketing/ScrollReveal";

export const metadata: Metadata = {
  title: "About",
  description: "Why 90-Day Business School exists, and the structured, practical philosophy behind the 90-day journey.",
  alternates: { canonical: "/about" },
};

const principles = [
  { icon: "ListOrdered", title: "Structure over scatter", desc: "90 days, 15 phases, one concept at a time — not a random pile of articles and videos." },
  { icon: "ClipboardCheck", title: "Practice over theory", desc: "Every lesson pairs a concept with a worked example, an exercise and a quiz — not just reading." },
  { icon: "ShieldCheck", title: "Honesty over hype", desc: "Case studies separate documented fact from illustrative analysis. Nothing here claims more than it is." },
  { icon: "Building2", title: "Grounded in reality", desc: "Indian examples (GST, Zerodha, Zomato) alongside global ones (Amazon, Airbnb, Netflix) — business thinking that applies wherever you are." },
];

export default function AboutPage() {
  return (
    <div>
      <section className="px-4 lg:px-8 max-w-3xl mx-auto pt-16 pb-14 text-center">
        <ScrollReveal>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5">Why this exists.</h1>
          <p className="text-lg text-muted">
            Most people trying to learn business end up with a browser full of bookmarked articles and
            half-watched videos — interesting, but not a plan. 90-Day Business School is a structured
            alternative: one deliberate sequence that builds business thinking day by day, instead of
            leaving you to assemble it yourself.
          </p>
        </ScrollReveal>
      </section>

      <section className="px-4 lg:px-8 max-w-3xl mx-auto pb-16">
        <ScrollReveal>
          <h2 className="text-2xl font-bold mb-4">The 90-day approach</h2>
          <p className="text-muted">
            Each day takes 20-40 minutes and follows the same loop: learn a concept, see it worked through
            with a real example, apply it to a short exercise, and check your understanding with a quiz.
            Fifteen phases carry that loop from business fundamentals all the way to a final founder
            project — your own business plan, built step by step rather than written in one sitting.
          </p>
        </ScrollReveal>
      </section>

      <section className="px-4 lg:px-8 max-w-5xl mx-auto pb-20">
        <ScrollReveal>
          <h2 className="text-2xl font-bold text-center mb-10">What we believe</h2>
        </ScrollReveal>
        <div className="grid sm:grid-cols-2 gap-5">
          {principles.map((p, i) => (
            <ScrollReveal key={p.title} delayMs={i * 80}>
              <div className="card p-6 h-full">
                <Icon name={p.icon} size={24} className="text-primary mb-3" />
                <h3 className="font-semibold mb-2">{p.title}</h3>
                <p className="text-sm text-muted">{p.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <ScrollReveal>
        <section className="px-4 lg:px-8 max-w-3xl mx-auto pb-24 text-center">
          <h2 className="text-2xl font-bold mb-4">Start your own 90 days.</h2>
          <Link href="/signup" className="inline-block rounded-lg bg-primary text-primary-foreground px-8 py-3.5 font-medium hover:opacity-90 transition-opacity">
            Start Your 3-Day Free Trial
          </Link>
        </section>
      </ScrollReveal>
    </div>
  );
}
