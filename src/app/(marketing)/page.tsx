import Link from "next/link";
import type { Metadata } from "next";
import { Icon } from "@/components/nav/Icon";
import { ScrollReveal } from "@/components/marketing/ScrollReveal";
import { HeroVisual } from "@/components/marketing/graphics/HeroVisual";
import { RoadmapGraphic } from "@/components/marketing/graphics/RoadmapGraphic";
import { DecisionFlowGraphic } from "@/components/marketing/graphics/DecisionFlowGraphic";
import { CalculatorShowcase } from "@/components/marketing/graphics/CalculatorShowcase";

export const metadata: Metadata = {
  title: "90-Day Business School — Learn Business, Startups & Entrepreneurship",
  description:
    "A structured 90-day journey through business fundamentals, startups, finance, marketing, sales and strategy — built for students, young professionals and aspiring founders in India and beyond.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "90-Day Business School — Build Better Business Thinking",
    description:
      "Learn business, startups, finance, marketing, sales and strategy through a structured 90-day journey. Start your 3-day free trial.",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "90-Day Business School",
    description: "90 days to think like a business builder.",
  },
};

const valueStats = [
  { value: "90", label: "Days", sub: "Structured learning" },
  { value: "15", label: "Phases", sub: "Complete business journey" },
  { value: "157+", label: "Concepts", sub: "Business glossary" },
  { value: "12+", label: "Calculators", sub: "Interactive tools" },
  { value: "39+", label: "Formulas", sub: "With worked examples" },
  { value: "12+", label: "Case Studies", sub: "Real companies" },
];

const problems = [
  { icon: "Shuffle", text: "Too much theory, too little practice" },
  { icon: "Youtube", text: "Random YouTube learning, no structure" },
  { icon: "Puzzle", text: "No practical exercises to apply what you read" },
  { icon: "EyeOff", text: "No way to track real progress" },
];

const solutionSteps = [
  { icon: "BookOpen", label: "Learn" },
  { icon: "ClipboardCheck", label: "Practice" },
  { icon: "Calculator", label: "Calculate" },
  { icon: "LayoutGrid", label: "Apply" },
  { icon: "TrendingUp", label: "Track" },
];

const productExperience = [
  { icon: "LayoutDashboard", title: "Dashboard", desc: "Your streak, XP, and where you left off." },
  { icon: "BookOpen", title: "Daily Lesson", desc: "One focused concept a day, 20-40 minutes." },
  { icon: "TrendingUp", title: "Progress", desc: "Every completed day, exercise and quiz, tracked." },
  { icon: "Calculator", title: "Calculators", desc: "Profit, margin, CAC, LTV, break-even and more." },
  { icon: "BookMarked", title: "Business Glossary", desc: "157+ terms explained in plain English." },
  { icon: "Building2", title: "Case Studies", desc: "Real companies — fact clearly separated from analysis." },
  { icon: "Gamepad2", title: "Business Simulator", desc: "Run a café, SaaS or retail business through real scenarios." },
  { icon: "LayoutGrid", title: "Business Model Canvas", desc: "Map your idea across all 9 strategy blocks." },
  { icon: "Rocket", title: "Startup Validator", desc: "A startup readiness checklist, not a success predictor." },
  { icon: "NotebookPen", title: "Founder Journal", desc: "Reflect on what you learn and how it applies." },
  { icon: "GraduationCap", title: "Final Project", desc: "A 17-step wizard producing your own business plan." },
];

const features = [
  {
    key: "learn",
    icon: "BookOpen",
    title: "LEARN",
    tagline: "One focused business lesson every day.",
    desc: "No scattered articles or hour-long videos — a short, clear explanation plus a worked example, every single day.",
  },
  {
    key: "practice",
    icon: "ClipboardCheck",
    title: "PRACTICE",
    tagline: "Turn knowledge into decisions.",
    desc: "A practical exercise and quiz for every lesson, scored server-side so your result always reflects the real answer.",
  },
  {
    key: "calculate",
    icon: "Calculator",
    title: "CALCULATE",
    tagline: "Understand the numbers.",
    desc: "Profit, margin, ROI, CAC, LTV, break-even, runway and more — plug in your own numbers, instantly.",
  },
  {
    key: "build",
    icon: "LayoutGrid",
    title: "BUILD",
    tagline: "Apply everything to a real business.",
    desc: "The Business Model Canvas, Startup Validator and Final Project turn 90 days of learning into your own business plan.",
  },
  {
    key: "track",
    icon: "TrendingUp",
    title: "TRACK",
    tagline: "See yourself improve.",
    desc: "Streaks, XP and achievements that reflect what you've actually completed — nothing fabricated, nothing inflated.",
  },
];

const faqs = [
  { q: "What is 90-Day Business School?", a: "A structured, 90-day curriculum covering business fundamentals, startups, finance, marketing, sales, operations and strategy — paired with calculators, case studies and practical tools." },
  { q: "How does the 90-day journey work?", a: "One lesson per day across 15 phases. Each day includes a short explanation, a worked example, a practice exercise and a quiz, building on everything before it." },
  { q: "What do I learn?", a: "Everything from how a business makes money to startup validation, unit economics, marketing, sales, people management, funding, and a final founder project for your own idea." },
  { q: "Is there a trial?", a: "Yes — every new account starts with a 3-day free trial, no payment details required up front." },
  { q: "Can I track progress?", a: "Yes. Your streak, XP, completed lessons, exercises, quizzes and unlocked achievements are all tracked and synced to your account." },
  { q: "Are calculators included?", a: "Yes — 12+ interactive business calculators (profit, margin, CAC, LTV, break-even, runway, valuation and more) are built into the product." },
  { q: "What happens after the trial?", a: "See the Pricing page for current access details." },
];

export default function LandingPage() {
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden px-4 lg:px-8 pt-14 pb-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--color-bg-card)_0%,_var(--color-bg)_60%)]" />
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-medium text-accent bg-accent/10 border border-accent/20 rounded-full px-3 py-1 mb-6">
              <Icon name="Sparkles" size={14} />
              Learn business by building your business thinking
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-bold tracking-tight leading-[1.08] mb-6">
              90 Days to Think
              <br />
              Like a <span className="text-primary">Business Builder.</span>
            </h1>
            <p className="text-lg text-muted max-w-xl mb-8">
              Learn business, startups, finance, marketing, sales, strategy and real-world decision
              making through a structured 90-day journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/signup"
                className="rounded-lg bg-primary text-primary-foreground px-6 py-3.5 font-medium text-center hover:opacity-90 transition-opacity"
              >
                Start Your 3-Day Free Trial
              </Link>
              <Link
                href="/roadmap"
                className="rounded-lg border border-border px-6 py-3.5 font-medium text-center hover:bg-bg-elevated transition-colors"
              >
                Explore the 90-Day Roadmap
              </Link>
            </div>
          </div>
          <HeroVisual />
        </div>
      </section>

      {/* VALUE / TRUST STATS */}
      <ScrollReveal>
        <section className="px-4 lg:px-8 max-w-6xl mx-auto pb-20">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {valueStats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-primary">{s.value}</p>
                <p className="text-xs font-medium mt-1">{s.label}</p>
                <p className="text-[11px] text-muted">{s.sub}</p>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* PROBLEM -> SOLUTION */}
      <section className="px-4 lg:px-8 max-w-6xl mx-auto pb-24">
        <ScrollReveal>
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">Most business learning is fragmented.</h2>
          <p className="text-muted text-center mb-10">One structured journey fixes that.</p>
        </ScrollReveal>
        <div className="grid lg:grid-cols-2 gap-8">
          <ScrollReveal>
            <div className="card p-6 h-full">
              <h3 className="font-semibold mb-4 text-muted">The problem</h3>
              <ul className="space-y-3">
                {problems.map((p) => (
                  <li key={p.text} className="flex items-start gap-3 text-sm">
                    <Icon name={p.icon} size={18} className="text-warning shrink-0 mt-0.5" />
                    {p.text}
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
          <ScrollReveal delayMs={120}>
            <div className="card p-6 h-full">
              <h3 className="font-semibold mb-4 text-primary">The solution</h3>
              <div className="flex flex-wrap items-center gap-2">
                {solutionSteps.map((s, i) => (
                  <div key={s.label} className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1.5 text-sm font-medium">
                      <Icon name={s.icon} size={15} />
                      {s.label}
                    </span>
                    {i < solutionSteps.length - 1 && <Icon name="ArrowRight" size={14} className="text-muted" />}
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted mt-5">
                Every day moves you through this exact loop — never just reading, never just watching.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 90-DAY ROADMAP */}
      <section className="px-4 lg:px-8 max-w-6xl mx-auto pb-24">
        <ScrollReveal>
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">The 90-Day Roadmap</h2>
          <p className="text-muted text-center mb-10">15 phases. Start at Business Foundation, end with your own Founder Project.</p>
        </ScrollReveal>
        <ScrollReveal delayMs={100}>
          <RoadmapGraphic />
        </ScrollReveal>
      </section>

      {/* PRODUCT EXPERIENCE */}
      <section className="px-4 lg:px-8 max-w-6xl mx-auto pb-24">
        <ScrollReveal>
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">What you actually get</h2>
          <p className="text-muted text-center mb-10">Every tool below is part of the real product — not a mockup.</p>
        </ScrollReveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {productExperience.map((item, i) => (
            <ScrollReveal key={item.title} delayMs={(i % 4) * 70}>
              <div className="card p-5 h-full">
                <Icon name={item.icon} size={22} className="text-primary mb-3" />
                <h3 className="font-medium text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-muted">{item.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* FEATURE SECTIONS: LEARN / PRACTICE / CALCULATE / BUILD / TRACK */}
      <section className="px-4 lg:px-8 max-w-6xl mx-auto pb-24 space-y-16">
        {features.map((f, i) => (
          <ScrollReveal key={f.key}>
            <div className={`grid lg:grid-cols-2 gap-10 items-center ${i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}>
              <div>
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary tracking-wide mb-3">
                  <Icon name={f.icon} size={16} />
                  {f.title}
                </span>
                <h3 className="text-2xl font-bold mb-3">{f.tagline}</h3>
                <p className="text-muted">{f.desc}</p>
              </div>
              <div>
                {f.key === "calculate" ? (
                  <CalculatorShowcase />
                ) : (
                  <div className="card p-8 flex items-center justify-center aspect-[16/10]">
                    <Icon name={f.icon} size={64} className="text-primary/30" />
                  </div>
                )}
              </div>
            </div>
          </ScrollReveal>
        ))}
      </section>

      {/* BUSINESS THINKING FLOW */}
      <section className="px-4 lg:px-8 max-w-6xl mx-auto pb-24">
        <ScrollReveal>
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">Business thinking, one chain of decisions.</h2>
          <p className="text-muted text-center mb-10">Every lesson reinforces this loop — not just facts to memorize.</p>
        </ScrollReveal>
        <div className="overflow-x-auto">
          <div className="min-w-[640px] lg:min-w-0 flex justify-center">
            <DecisionFlowGraphic />
          </div>
        </div>
      </section>

      {/* CASE STUDY PHILOSOPHY */}
      <ScrollReveal>
        <section className="px-4 lg:px-8 max-w-4xl mx-auto pb-24">
          <div className="card p-8">
            <p className="text-xs font-semibold text-accent uppercase tracking-wide mb-4">Case Study</p>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {["Problem", "Decision", "Trade-off", "Outcome", "Lesson"].map((step, i) => (
                <span key={step} className="flex items-center gap-2">
                  <span className="rounded-full border border-border px-3 py-1.5">{step}</span>
                  {i < 4 && <Icon name="ArrowRight" size={14} className="text-muted" />}
                </span>
              ))}
            </div>
            <p className="text-sm text-muted mt-5">
              Real companies — Zerodha, Zoho, Swiggy, Nykaa and more — broken down through this exact
              framework, with documented facts clearly separated from illustrative analysis.{" "}
              <Link href="/case-studies" className="text-primary hover:underline">
                Browse the case study library →
              </Link>
            </p>
          </div>
        </section>
      </ScrollReveal>

      {/* FAQ */}
      <section className="px-4 lg:px-8 max-w-3xl mx-auto pb-24">
        <ScrollReveal>
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">Frequently asked questions</h2>
        </ScrollReveal>
        <div className="space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="card p-4 group">
              <summary className="font-medium cursor-pointer list-none flex items-center justify-between gap-3">
                {f.q}
                <Icon name="ChevronDown" size={18} className="text-muted group-open:rotate-180 transition-transform shrink-0" />
              </summary>
              <p className="text-sm text-muted mt-3">{f.a}</p>
            </details>
          ))}
        </div>
        <p className="text-center text-sm text-muted mt-6">
          <Link href="/faq" className="text-primary hover:underline">See the full FAQ →</Link>
        </p>
      </section>

      {/* FINAL CTA */}
      <ScrollReveal>
        <section className="px-4 lg:px-8 max-w-3xl mx-auto pb-28 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to think like a founder?</h2>
          <p className="text-muted mb-8">Start your 3-day free trial — no payment details required.</p>
          <Link
            href="/signup"
            className="inline-block rounded-lg bg-primary text-primary-foreground px-8 py-3.5 font-medium hover:opacity-90 transition-opacity"
          >
            Start Your 3-Day Free Trial
          </Link>
        </section>
      </ScrollReveal>
    </div>
  );
}
