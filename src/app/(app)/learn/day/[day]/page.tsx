import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { allLessons, getLessonByDay, TOTAL_DAYS } from "@/lib/content/lessons";
import { getPhaseForDay } from "@/lib/content/phases";
import { LessonInteractive } from "@/components/lesson/LessonInteractive";

export function generateStaticParams() {
  return allLessons.map((l) => ({ day: String(l.day) }));
}

export async function generateMetadata({ params }: { params: Promise<{ day: string }> }): Promise<Metadata> {
  const { day } = await params;
  const lesson = getLessonByDay(Number(day));
  if (!lesson) return {};
  return { title: `Day ${lesson.day}: ${lesson.title}`, description: lesson.objective };
}

export default async function LessonPage({ params }: { params: Promise<{ day: string }> }) {
  const { day } = await params;
  const dayNum = Number(day);
  const lesson = getLessonByDay(dayNum);
  if (!lesson || !Number.isInteger(dayNum) || dayNum < 1 || dayNum > TOTAL_DAYS) notFound();

  const phase = getPhaseForDay(lesson.day);

  return (
    <article className="space-y-8 max-w-3xl">
      <header>
        <div className="flex items-center gap-2 text-sm text-muted mb-2">
          <span>Phase {phase.number}: {phase.title}</span>
          <span>·</span>
          <span>Day {lesson.day} of {TOTAL_DAYS}</span>
        </div>
        <h1 className="text-3xl font-bold">{lesson.title}</h1>
      </header>

      <section>
        <h2 className="text-sm font-semibold tracking-wide text-muted mb-3">🎯 TODAY&apos;S MISSION</h2>
        <div className="card p-5 text-lg">{lesson.objective}</div>
      </section>

      <section>
        <h2 className="text-sm font-semibold tracking-wide text-muted mb-3">🧠 CONCEPT</h2>
        <div className="card p-5 space-y-3">
          <p>{lesson.concept}</p>
          <p className="text-muted text-sm">{lesson.simpleExplanation}</p>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold tracking-wide text-muted mb-3">💡 EASY EXAMPLE</h2>
        <div className="card p-5">{lesson.analogy}</div>
      </section>

      <section>
        <h2 className="text-sm font-semibold tracking-wide text-muted mb-3">🏢 REAL BUSINESS EXAMPLES</h2>
        <div className="card p-5 space-y-3 text-sm">
          <p><span className="font-medium">Global: </span>{lesson.businessExample}</p>
          {lesson.indiaExample && <p><span className="font-medium">India: </span>{lesson.indiaExample}</p>}
          {lesson.startupExample && <p><span className="font-medium">Startup: </span>{lesson.startupExample}</p>}
        </div>
      </section>

      {lesson.formula && (
        <section>
          <h2 className="text-sm font-semibold tracking-wide text-muted mb-3">📐 FORMULA</h2>
          <div className="card p-5 bg-primary/10 border-primary/30">
            <p className="font-semibold mb-2">{lesson.formula.name}</p>
            <pre className="whitespace-pre-wrap font-mono text-sm text-primary mb-3">{lesson.formula.expression}</pre>
            <p className="text-sm text-muted">{lesson.formula.workedExample}</p>
          </div>
        </section>
      )}

      {lesson.mnemonic && (
        <section>
          <h2 className="text-sm font-semibold tracking-wide text-muted mb-3">🧠 MEMORY TRICK</h2>
          <div className="card p-5 bg-accent/10 border-accent/30">
            <p className="font-semibold mb-2">{lesson.mnemonic.label}</p>
            <ul className="space-y-1 text-sm">
              {lesson.mnemonic.breakdown.map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          </div>
        </section>
      )}

      <section>
        <h2 className="text-sm font-semibold tracking-wide text-muted mb-3">⚠️ COMMON MISTAKE</h2>
        <div className="card p-5 bg-warning/10 border-warning/30 text-sm">{lesson.commonMistake}</div>
      </section>

      <LessonInteractive lesson={lesson} />
    </article>
  );
}
