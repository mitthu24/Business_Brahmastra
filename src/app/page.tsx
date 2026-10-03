import Link from "next/link";
import type { Metadata } from "next";
import { phases } from "@/lib/content/phases";
import { Icon } from "@/components/nav/Icon";

export const metadata: Metadata = {
  title: "90-Day Business School — Learn Business & Startups",
  description:
    "Learn business, startups, finance, marketing, sales, operations, strategy and entrepreneurship through a practical 90-day roadmap.",
  openGraph: {
    title: "90-Day Business School — Learn Business & Startups",
    description:
      "Learn business, startups, finance, marketing, sales, operations, strategy and entrepreneurship through a practical 90-day roadmap.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "90-Day Business School",
    description: "Learn Business. Understand Startups. Think Like a Founder.",
  },
};

const stats = [
  { label: "Days", value: "90" },
  { label: "Phases", value: "15" },
  { label: "Concepts", value: "150+" },
  { label: "Exercises", value: "90+" },
  { label: "Formulas", value: "35+" },
  { label: "Case Studies", value: "12+" },
];

const whyPoints = [
  { icon: "BookOpen", title: "Structured, not scattered", desc: "A deliberate 90-day sequence, not a random pile of articles — each day builds on the last." },
  { icon: "Calculator", title: "Practical, not theoretical", desc: "Real formulas, real numbers, and interactive calculators you can use on your own business idea today." },
  { icon: "Building2", title: "Grounded in real examples", desc: "Indian and global companies, clearly separating documented facts from illustrative analysis." },
  { icon: "Trophy", title: "Ends with YOUR business", desc: "A 17-step founder project turns everything you learn into your own real, presentable business plan." },
];

const faqs = [
  { q: "Do I need an MBA or business background to start?", a: "No. The entire course is written in simple English for complete beginners, introducing every technical term with a plain-language explanation first." },
  { q: "How long does each day take?", a: "Most days take 20-40 minutes, combining a short explanation, a worked example, a practice exercise, and a quick quiz." },
  { q: "Is this specific to India or global?", a: "Both. Concepts are universal, with Indian examples (GST, Zerodha, Zomato) alongside global ones (Amazon, Airbnb, Netflix) wherever relevant." },
  { q: "What do I get at the end?", a: "A completed, structured business plan for your own idea, built step-by-step through the Final Project wizard, exportable as a PDF." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between px-4 py-4 lg:px-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden>🎓</span>
          <span className="font-semibold">90-Day Business School</span>
        </div>
        <Link href="/dashboard" className="text-sm text-muted hover:text-foreground">Go to app →</Link>
      </header>

      <section className="px-4 lg:px-8 max-w-4xl mx-auto text-center pt-12 pb-16">
        <p className="text-primary font-medium mb-4">Learn Business. Understand Startups. Think Like a Founder.</p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6">
          Master Business in <span className="text-accent">90 Days.</span>
        </h1>
        <p className="text-lg text-muted max-w-2xl mx-auto mb-8">
          From business fundamentals to startup strategy, finance, marketing, sales and growth — learn how businesses actually work.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/learn/day/1" className="rounded-lg bg-primary text-primary-foreground px-6 py-3 font-medium hover:opacity-90 transition-opacity">
            Start Day 1 →
          </Link>
          <Link href="/roadmap" className="rounded-lg border border-border px-6 py-3 font-medium hover:bg-bg-elevated transition-colors">
            Explore 90-Day Roadmap
          </Link>
        </div>
      </section>

      <section className="px-4 lg:px-8 max-w-5xl mx-auto grid grid-cols-3 sm:grid-cols-6 gap-4 pb-16">
        {stats.map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <div className="text-2xl font-bold text-primary">{s.value}</div>
            <div className="text-xs text-muted mt-1">{s.label}</div>
          </div>
        ))}
      </section>

      <section className="px-4 lg:px-8 max-w-5xl mx-auto pb-16">
        <h2 className="text-2xl font-bold mb-8 text-center">Why this course</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {whyPoints.map((p) => (
            <div key={p.title} className="card p-6">
              <Icon name={p.icon} size={24} className="text-accent mb-3" />
              <h3 className="font-semibold mb-2">{p.title}</h3>
              <p className="text-sm text-muted">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 lg:px-8 max-w-5xl mx-auto pb-16">
        <h2 className="text-2xl font-bold mb-2 text-center">The 90-Day Roadmap</h2>
        <p className="text-muted text-center mb-8">15 phases, from business basics to your own founder project.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {phases.map((phase) => (
            <div key={phase.id} className="card p-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/15 text-primary font-semibold text-sm shrink-0">{phase.number}</span>
              <div>
                <div className="font-medium text-sm">{phase.title}</div>
                <div className="text-xs text-muted">Days {phase.startDay}–{phase.endDay}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 lg:px-8 max-w-5xl mx-auto pb-16">
        <h2 className="text-2xl font-bold mb-8 text-center">Interactive tools built in</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: "Calculator", title: "Business Calculators", desc: "Profit, margin, CAC, LTV, break-even, runway, valuation and more." },
            { icon: "Gamepad2", title: "Business Simulator", desc: "Run a café, SaaS, or retail business and react to real scenarios." },
            { icon: "LayoutGrid", title: "Business Model Canvas", desc: "Map your idea across all 9 blocks of a classic strategy canvas." },
            { icon: "Rocket", title: "Startup Validator", desc: "A Startup Readiness Checklist — not a success predictor." },
            { icon: "Building2", title: "Case Study Library", desc: "Real companies, clearly separating fact from illustrative analysis." },
            { icon: "GraduationCap", title: "Founder Project", desc: "A 17-step wizard producing your own exportable business plan." },
          ].map((t) => (
            <div key={t.title} className="card p-5">
              <Icon name={t.icon} size={22} className="text-primary mb-3" />
              <h3 className="font-medium mb-1 text-sm">{t.title}</h3>
              <p className="text-xs text-muted">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 lg:px-8 max-w-3xl mx-auto pb-20">
        <h2 className="text-2xl font-bold mb-8 text-center">Frequently asked questions</h2>
        <div className="space-y-4">
          {faqs.map((f) => (
            <details key={f.q} className="card p-4 group">
              <summary className="font-medium cursor-pointer list-none flex items-center justify-between">
                {f.q}
                <Icon name="ChevronDown" size={18} className="text-muted group-open:rotate-180 transition-transform" />
              </summary>
              <p className="text-sm text-muted mt-3">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="px-4 lg:px-8 max-w-3xl mx-auto pb-24 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to think like a founder?</h2>
        <Link href="/learn/day/1" className="inline-block rounded-lg bg-primary text-primary-foreground px-8 py-3 font-medium hover:opacity-90 transition-opacity">
          Start Day 1 →
        </Link>
      </section>
    </div>
  );
}
