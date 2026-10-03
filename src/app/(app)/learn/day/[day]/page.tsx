import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireLearnerOrRedirect } from "@/lib/auth/dal";
import { hasProtectedAccess } from "@/lib/access/status";
import { AccessExpiredNotice } from "@/components/access/AccessExpiredNotice";
import { allLessons, getLessonByDay, TOTAL_DAYS } from "@/lib/content/lessons";
import { getPhaseForDay } from "@/lib/content/phases";
import { LessonInteractive } from "@/components/lesson/LessonInteractive";
import { LessonSection } from "@/components/ui/LessonSection";
import { FormulaCard } from "@/components/ui/FormulaCard";
import { MnemonicCard } from "@/components/ui/MnemonicCard";
import { BusinessExampleCard } from "@/components/ui/BusinessExampleCard";
import { Callout } from "@/components/ui/Callout";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getLessonDiagram } from "@/lib/lesson-diagrams";

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

  // Server-side lesson access check (docs/PHASE-5.md "Lesson access"): authentication is already
  // enforced by the (app) layout, but lesson *content* additionally requires live access status -
  // never just a frontend route guard.
  const { status } = await requireLearnerOrRedirect();
  if (!hasProtectedAccess(status)) {
    return (
      <div className="max-w-3xl">
        <AccessExpiredNotice status={status as "EXPIRED" | "SUSPENDED"} />
      </div>
    );
  }

  const phase = getPhaseForDay(lesson.day);
  const diagram = getLessonDiagram(lesson.day);

  return (
    <article className="space-y-8 max-w-3xl">
      <header>
        <div className="flex items-center gap-2 text-sm text-muted mb-2">
          <span>Phase {phase.number}: {phase.title}</span>
          <span>·</span>
          <span>Day {lesson.day} of {TOTAL_DAYS}</span>
        </div>
        <h1 className="text-3xl font-bold mb-3">{lesson.title}</h1>
        <ProgressBar percent={(lesson.day / TOTAL_DAYS) * 100} size="sm" label={`${Math.round((lesson.day / TOTAL_DAYS) * 100)}% through the 90-day journey`} />
      </header>

      <LessonSection icon="🎯" title="TODAY'S MISSION">
        <div className="card p-5 text-lg">{lesson.objective}</div>
      </LessonSection>

      <LessonSection icon="🧠" title="CORE CONCEPT">
        <div className="card p-5 space-y-3">
          <p>{lesson.concept}</p>
          <p className="text-muted text-sm">{lesson.simpleExplanation}</p>
        </div>
      </LessonSection>

      <LessonSection icon="💡" title="EASY ANALOGY">
        <div className="card p-5">{lesson.analogy}</div>
      </LessonSection>

      <LessonSection icon="🏢" title="REAL BUSINESS EXAMPLES">
        <div className="grid sm:grid-cols-2 gap-3">
          <BusinessExampleCard label="Global" icon="🌍" text={lesson.businessExample} />
          {lesson.indiaExample && <BusinessExampleCard label="India" icon="🇮🇳" text={lesson.indiaExample} />}
          {lesson.startupExample && <BusinessExampleCard label="Startup" icon="🚀" text={lesson.startupExample} />}
        </div>
      </LessonSection>

      {diagram && <LessonSection icon="📊" title="SEE IT VISUALLY">{diagram}</LessonSection>}

      {lesson.formula && (
        <LessonSection icon="📐" title="FORMULA">
          <FormulaCard name={lesson.formula.name} expression={lesson.formula.expression} example={lesson.formula.workedExample} />
        </LessonSection>
      )}

      {lesson.mnemonic && (
        <LessonSection icon="🧠" title="MEMORY TRICK">
          <MnemonicCard label={lesson.mnemonic.label} breakdown={lesson.mnemonic.breakdown} remember={lesson.rememberThis} />
        </LessonSection>
      )}

      <LessonSection icon="⚠️" title="COMMON MISTAKE">
        <Callout tone="warning">{lesson.commonMistake}</Callout>
      </LessonSection>

      <LessonInteractive lesson={lesson} />
    </article>
  );
}
