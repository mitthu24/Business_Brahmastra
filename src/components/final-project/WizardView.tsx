"use client";

import { useEffect, useRef, useState } from "react";
import { wizardSteps, emptyWizardAnswers, isWizardComplete, completionPercent, type WizardAnswers } from "@/lib/final-project";
import { useProgressStore } from "@/lib/progress/store";
import { Icon } from "@/components/nav/Icon";

type LoadState = "loading" | "ready" | "error";
type SaveState = "idle" | "saving" | "saved" | "error";

async function saveStep(stepNumber: number, content: string, complete: boolean): Promise<boolean> {
  try {
    const res = await fetch("/api/final-project", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stepNumber, content, complete }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function WizardView() {
  const [answers, setAnswers] = useState<WizardAnswers>(emptyWizardAnswers());
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [currentStep, setCurrentStep] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const completeFinalProject = useProgressStore((s) => s.completeFinalProject);
  const finalProjectCompleted = useProgressStore((s) => s.finalProjectCompleted);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function load() {
    setLoadState("loading");
    try {
      const res = await fetch("/api/final-project");
      if (!res.ok) throw new Error();
      const data: { answers: WizardAnswers } = await res.json();
      setAnswers({ ...emptyWizardAnswers(), ...data.answers });
      setLoadState("ready");
    } catch {
      setLoadState("error");
    }
  }

  useEffect(() => {
    // One-time fetch on mount from an external source (the API) - not a React state sync.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  const step = wizardSteps[currentStep];
  const percent = completionPercent(answers);

  function update(value: string) {
    setAnswers((prev) => ({ ...prev, [step.id]: value }));
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveState("saving");
    saveTimer.current = setTimeout(async () => {
      const ok = await saveStep(step.stepNumber, value, false);
      setSaveState(ok ? "saved" : "error");
    }, 600);
  }

  async function flushCurrentStep() {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveState("saving");
    const ok = await saveStep(step.stepNumber, answers[step.id] ?? "", false);
    setSaveState(ok ? "saved" : "error");
  }

  async function next() {
    await flushCurrentStep();
    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      setShowSummary(true);
      if (isWizardComplete(answers) && !finalProjectCompleted) {
        completeFinalProject(); // updates XP/achievement state (already idempotent server-side)
        await saveStep(step.stepNumber, answers[step.id] ?? "", true);
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

  if (loadState === "loading") {
    return <p className="text-sm text-muted">Loading your business plan…</p>;
  }
  if (loadState === "error") {
    return (
      <div className="card p-4 flex items-center justify-between gap-3 max-w-2xl">
        <p className="text-sm text-danger">Couldn&apos;t load your final project.</p>
        <button onClick={load} className="text-xs rounded-lg border border-border px-3 py-1.5 hover:text-foreground">
          Retry
        </button>
      </div>
    );
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
        <div className="flex items-center justify-between mb-1">
          <div className="text-xs text-muted">STEP {step.stepNumber} OF {wizardSteps.length}</div>
          <SaveIndicator state={saveState} />
        </div>
        <h2 id={`wizard-step-${step.id}`} className="text-xl font-semibold mb-3">{step.title}</h2>
        <p id={`wizard-prompt-${step.id}`} className="text-sm text-muted mb-4">{step.prompt}</p>
        <textarea
          aria-labelledby={`wizard-step-${step.id} wizard-prompt-${step.id}`}
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

function SaveIndicator({ state }: { state: SaveState }) {
  if (state === "saving") return <span className="text-xs text-muted">Saving…</span>;
  if (state === "saved") return <span className="text-xs text-success">Saved</span>;
  if (state === "error") return <span className="text-xs text-danger">Save failed, will retry</span>;
  return null;
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
        <p className="text-xs font-semibold text-primary tracking-wide mb-1">MY BUSINESS PLAN</p>
        <h1 className="text-2xl font-bold mb-1">{answers.idea?.trim() || "Untitled Business"}</h1>
        <p className="text-sm text-muted mb-6">Generated from the 90-Day Business School Final Project wizard · {completionPercent(answers)}% complete.</p>

        {answers.finalPitch?.trim() && (
          <div className="card bg-accent/10 border-accent/30 p-4 mb-6">
            <p className="text-xs font-semibold text-accent mb-1">VISION / ELEVATOR PITCH</p>
            <p className="text-sm whitespace-pre-wrap">{answers.finalPitch}</p>
          </div>
        )}

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
