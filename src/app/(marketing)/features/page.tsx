import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/nav/Icon";
import { ScrollReveal } from "@/components/marketing/ScrollReveal";
import { CalculatorShowcase } from "@/components/marketing/graphics/CalculatorShowcase";

export const metadata: Metadata = {
  title: "Features",
  description: "Everything inside 90-Day Business School: daily lessons, exercises, quizzes, calculators, case studies, simulator, canvas, validator and a final founder project.",
  alternates: { canonical: "/features" },
};

const features = [
  { icon: "BookOpen", title: "Daily Lessons", desc: "One structured lesson a day across 15 phases — concept, worked example, analogy, and a common mistake to avoid." },
  { icon: "ClipboardCheck", title: "Exercises", desc: "A practical exercise for every lesson, so you apply the concept instead of just reading it." },
  { icon: "HelpCircle", title: "Quizzes", desc: "A short quiz per lesson, scored server-side against the trusted answer — never trusting the browser." },
  { icon: "Calculator", title: "Calculators", desc: "12+ interactive tools: profit, margin, ROI, CAC, LTV, break-even, runway, valuation, dilution, churn, retention and conversion." },
  { icon: "BookMarked", title: "Business Glossary", desc: "157+ business and startup terms, explained in plain English with examples and related concepts." },
  { icon: "Sigma", title: "Formula Library", desc: "39+ business formulas with explanations and worked examples, not just raw equations." },
  { icon: "Building2", title: "Case Studies", desc: "Real companies — Zerodha, Zoho, Swiggy, Nykaa, CRED and more — with documented facts clearly separated from illustrative analysis." },
  { icon: "Gamepad2", title: "Business Simulator", desc: "Run a café, SaaS, e-commerce, gym, retail or manufacturing business and react to real operating scenarios." },
  { icon: "LayoutGrid", title: "Business Model Canvas", desc: "Map your own idea across all 9 blocks of the classic strategy canvas." },
  { icon: "Rocket", title: "Startup Validator", desc: "A startup readiness checklist that flags gaps in your thinking — not a prediction of success." },
  { icon: "NotebookPen", title: "Founder Journal", desc: "A space to reflect on what you learned and how it applies to your own idea, day by day." },
  { icon: "GraduationCap", title: "Final Project", desc: "A 17-step guided wizard that turns 90 days of learning into your own exportable business plan." },
  { icon: "TrendingUp", title: "Progress Tracking", desc: "Streaks, XP, completed lessons/exercises/quizzes and achievements — all tracked and synced to your account." },
];

export default function FeaturesPage() {
  return (
    <div>
      <section className="px-4 lg:px-8 max-w-4xl mx-auto pt-16 pb-14 text-center">
        <ScrollReveal>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5">Everything you need to think like a founder.</h1>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Not just lessons — a complete practice environment for business thinking.
          </p>
        </ScrollReveal>
      </section>

      <section className="px-4 lg:px-8 max-w-6xl mx-auto pb-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <ScrollReveal key={f.title} delayMs={(i % 3) * 70}>
              <div className="card p-6 h-full">
                <Icon name={f.icon} size={24} className="text-primary mb-3" />
                <h2 className="font-semibold mb-2">{f.title}</h2>
                <p className="text-sm text-muted">{f.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="px-4 lg:px-8 max-w-5xl mx-auto pb-24">
        <ScrollReveal>
          <h2 className="text-2xl font-bold text-center mb-8">See a calculator in action</h2>
          <CalculatorShowcase />
        </ScrollReveal>
      </section>

      <ScrollReveal>
        <section className="px-4 lg:px-8 max-w-3xl mx-auto pb-24 text-center">
          <h2 className="text-2xl font-bold mb-4">Try it yourself.</h2>
          <Link href="/signup" className="inline-block rounded-lg bg-primary text-primary-foreground px-8 py-3.5 font-medium hover:opacity-90 transition-opacity">
            Start Your 3-Day Free Trial
          </Link>
        </section>
      </ScrollReveal>
    </div>
  );
}
