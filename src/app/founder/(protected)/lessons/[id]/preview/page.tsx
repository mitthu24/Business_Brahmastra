import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getDb } from "@/lib/db/client";
import { getLessonById } from "@/lib/db/lesson-queries";
import { getPhaseForDay } from "@/lib/content/phases";
import { TOTAL_DAYS } from "@/lib/content/lessons";
import { LessonSection } from "@/components/ui/LessonSection";
import { FormulaCard } from "@/components/ui/FormulaCard";
import { MnemonicCard } from "@/components/ui/MnemonicCard";
import { BusinessExampleCard } from "@/components/ui/BusinessExampleCard";
import { Callout } from "@/components/ui/Callout";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { LessonPreviewInteractive } from "../LessonPreviewInteractive";

export const metadata: Metadata = { title: "Founder · Lesson preview" };
export const dynamic = "force-dynamic";

/**
 * Founder-only preview (Phase 5.3 slice 3, docs/PHASE-5.3.md "Lesson preview"). Reuses the same
 * presentational section components as the real learner page
 * (src/app/(app)/learn/day/[day]/page.tsx) so the founder sees an accurate rendering of ANY
 * status - draft, published, or archived - never only published content. Never calls
 * getPublishedLessonByDayForLearner (that would hide drafts, defeating the point of a preview) and
 * never renders the real LessonInteractive (which would record completion/XP/streak on the
 * founder's own account) - see LessonPreviewInteractive for the inert replacement.
 */
export default async function FounderLessonPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = await getLessonById(getDb(), id);
  if (!lesson) notFound();

  const phase = getPhaseForDay(lesson.day);

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <Link href={`/founder/lessons/${lesson.id}`} className="text-sm text-muted hover:text-foreground">← Back to editor</Link>
        <span className="inline-flex items-center rounded-full bg-warning/15 text-warning px-3 py-1 text-xs font-semibold tracking-wide">
          DRAFT PREVIEW — status: {lesson.status} — not visible to learners unless published
        </span>
      </div>

      <article className="space-y-8">
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

        <LessonPreviewInteractive
          exercise={{ prompt: lesson.exercisePrompt, answer: lesson.exerciseAnswer }}
          caseStudy={lesson.caseStudy}
          founderQuestion={lesson.founderQuestion}
          quiz={lesson.quiz}
          takeaways={lesson.takeaways}
          rememberThis={lesson.rememberThis}
        />
      </article>
    </div>
  );
}
