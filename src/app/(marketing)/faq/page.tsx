import type { Metadata } from "next";
import { Icon } from "@/components/nav/Icon";
import { ScrollReveal } from "@/components/marketing/ScrollReveal";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about 90-Day Business School.",
  alternates: { canonical: "/faq" },
};

const faqs = [
  { q: "What is 90-Day Business School?", a: "A structured, 90-day curriculum covering business fundamentals, startups, finance, marketing, sales, operations and strategy — paired with calculators, case studies and practical tools." },
  { q: "How does the 90-day journey work?", a: "One lesson per day across 15 phases. Each day includes a short explanation, a worked example, a practice exercise and a quiz, each building on everything before it." },
  { q: "What do I learn?", a: "Everything from how a business makes money, to startup validation, unit economics, marketing, sales, operations, people management, funding, strategy, and a final founder project for your own idea." },
  { q: "Do I need an MBA or business background to start?", a: "No. Every lesson is written in plain English for complete beginners, introducing each technical term with a simple explanation before using it." },
  { q: "How long does each day take?", a: "Most days take 20-40 minutes, combining a short explanation, a worked example, a practice exercise, and a quick quiz." },
  { q: "Is this specific to India or global?", a: "Both. Concepts are universal, with Indian examples (GST, Zerodha, Zomato) alongside global ones (Amazon, Airbnb, Netflix) wherever relevant." },
  { q: "Is there a trial?", a: "Yes — every new account starts with a 3-day free trial, no payment details required up front." },
  { q: "What happens after the trial?", a: "Paid plans are not live yet. Continued access after your trial is currently arranged directly with our team — see the Pricing or Contact page." },
  { q: "Can I track progress?", a: "Yes. Your streak, XP, completed lessons, exercises, quizzes and unlocked achievements are all tracked and synced to your account." },
  { q: "Are calculators included?", a: "Yes — 12+ interactive business calculators (profit, margin, CAC, LTV, break-even, runway, valuation and more) are built into the product." },
  { q: "What do I get at the end?", a: "A completed, structured business plan for your own idea, built step-by-step through the Final Project wizard." },
];

export default function FaqPage() {
  return (
    <div className="px-4 lg:px-8 max-w-3xl mx-auto pt-16 pb-24">
      <ScrollReveal>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-center mb-12">Frequently asked questions</h1>
      </ScrollReveal>
      <div className="space-y-3">
        {faqs.map((f) => (
          <details key={f.q} className="card p-5 group">
            <summary className="font-medium cursor-pointer list-none flex items-center justify-between gap-3">
              {f.q}
              <Icon name="ChevronDown" size={18} className="text-muted group-open:rotate-180 transition-transform shrink-0" />
            </summary>
            <p className="text-sm text-muted mt-3">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
