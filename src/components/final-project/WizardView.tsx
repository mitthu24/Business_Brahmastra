"use client";

import { useState } from "react";
import { wizardSteps, emptyWizardAnswers, isWizardComplete, completionPercent, type WizardAnswers } from "@/lib/final-project";
import { useLocalStorageState } from "@/lib/use-local-storage-state";
import { useProgressStore } from "@/lib/progress/store";
import { Icon } from "@/components/nav/Icon";

export function WizardView() {
  const [answers, setAnswers] = useLocalStorageState<WizardAnswers>("final-project-answers", emptyWizardAnswers());
  const [currentStep, setCurrentStep] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const completeFinalProject = useProgressStore((s) => s.completeFinalProject);
  const finalProjectCompleted = useProgressStore((s) => s.finalProjectCompleted);

  const step = wizardSteps[currentStep];
  const percent = completionPercent(answers);

  function update(value: string) {
    setAnswers((prev) => ({ ...prev, [step.id]: value }));
  }

  function next() {
    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      setShowSummary(true);
      if (isWizardComplete(answers) && !finalProjectCompleted) {
        completeFinalProject();
      }
    }
  }

  function prev() {
    if (showSummary) {
      setShowSummary(false);
      return;
    }
    setCurrentStep((s) => Math.max(0, s - 1));
  }

  if (showSummary) {
    return <SummaryView answers={answers} onBack={prev} />;
  }

  return (
    <div>
      <div className="h-2 rounded-full bg-bg-elevated overflow-hidden mb-6">
        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${percent}%` }} />
      </div>

      <div className="flex gap-1 mb-6 overflow-x-auto pb-1 scrollbar-thin">
        {wizardSteps.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setCurrentStep(i)}
            className={`shrink-0 w-8 h-8 rounded-full text-xs font-medium flex items-center justify-center transition-colors ${
              i === currentStep
                ? "bg-primary text-primary-foreground"
                : (answers[s.id] ?? "").trim()
                ? "bg-success/20 text-success"
                : "bg-bg-elevated text-muted"
            }`}
            aria-label={`Go to step ${s.stepNumber}: ${s.title}`}
          >
            {s.stepNumber}
          </button>
        ))}
      </div>

      <div className="card p-6 max-w-2xl">
        <div className="text-xs text-muted mb-1">STEP {step.stepNumber} OF {wizardSteps.length}</div>
        <h2 className="text-xl font-semibold mb-3">{step.title}</h2>
        <p className="text-sm text-muted mb-4">{step.prompt}</p>
        <textarea
          value={answers[step.id] ?? ""}
          onChange={(e) => update(e.target.value)}
          rows={6}
          className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary resize-none"
          autoFocus
        />
        <div className="flex items-center justify-between mt-5">
          <button
            onClick={prev}
            disabled={currentStep === 0}
            className="text-sm text-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Back
          </button>
          <button onClick={next} className="rounded-lg bg-primary text-primary-foreground px-5 py-2 text-sm font-medium hover:opacity-90 transition-opacity">
            {currentStep === wizardSteps.length - 1 ? "View My Business Plan →" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SummaryView({ answers, onBack }: { answers: WizardAnswers; onBack: () => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6 print:hidden">
        <button onClick={onBack} className="text-sm text-muted hover:text-foreground">← Back to wizard</button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Icon name="Download" size={16} /> Export as PDF
        </button>
      </div>

      <div id="business-plan-print" className="card p-8 max-w-3xl">
        <h1 className="text-2xl font-bold mb-1">My Business Plan</h1>
        <p className="text-sm text-muted mb-6">Generated from the 90-Day Business School Final Project wizard.</p>
        <div className="space-y-6">
          {wizardSteps.map((s) => (
            <div key={s.id}>
              <h2 className="text-sm font-semibold text-primary mb-1">{s.stepNumber}. {s.title}</h2>
              <p className="text-sm whitespace-pre-wrap">{answers[s.id]?.trim() || <span className="text-muted">Not answered.</span>}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
