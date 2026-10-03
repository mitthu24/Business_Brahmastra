"use client";

import { useState } from "react";
import { buildReadinessChecklist, type ValidatorInput, type ChecklistItem } from "@/lib/startup-validator";
import { Icon } from "@/components/nav/Icon";

const initialInput: ValidatorInput = { idea: "", targetCustomer: "", problem: "", solution: "", price: "", competitors: "" };

const statusConfig: Record<ChecklistItem["status"], { icon: string; color: string; label: string }> = {
  strong: { icon: "CheckCircle2", color: "text-success", label: "Looks solid" },
  "needs-work": { icon: "AlertCircle", color: "text-warning", label: "Needs work" },
  missing: { icon: "XCircle", color: "text-danger", label: "Missing" },
};

export function ValidatorView() {
  const [input, setInput] = useState<ValidatorInput>(initialInput);
  const [checklist, setChecklist] = useState<ChecklistItem[] | null>(null);

  function update(key: keyof ValidatorInput, value: string) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  function generate() {
    setChecklist(buildReadinessChecklist(input));
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <Field label="Business idea" value={input.idea} onChange={(v) => update("idea", v)} placeholder="A one-line description of your idea" />
        <Field label="Target customer" value={input.targetCustomer} onChange={(v) => update("targetCustomer", v)} placeholder="Who specifically is this for?" />
        <Field label="Problem" value={input.problem} onChange={(v) => update("problem", v)} placeholder="What painful problem does this solve, and for whom?" textarea />
        <Field label="Solution" value={input.solution} onChange={(v) => update("solution", v)} placeholder="How does your idea solve that problem?" textarea />
        <Field label="Price" value={input.price} onChange={(v) => update("price", v)} placeholder="e.g. ₹499/month, or ₹200 per order" />
        <Field label="Competitors / alternatives" value={input.competitors} onChange={(v) => update("competitors", v)} placeholder="Who or what do customers use today instead?" textarea />
        <button onClick={generate} className="rounded-lg bg-primary text-primary-foreground px-5 py-2.5 font-medium hover:opacity-90 transition-opacity">
          Generate Startup Readiness Checklist
        </button>
      </div>

      <div>
        <div className="card p-4 mb-4 bg-accent/10 border-accent/30 text-sm">
          <strong>This checklist helps identify areas that need more validation. It does not predict startup success.</strong>{" "}
          No tool can objectively predict whether a startup will succeed — this only reflects how clearly you&apos;ve
          defined the basics, based on what you typed above.
        </div>
        {!checklist && <p className="text-muted text-sm">Fill in the form and generate your checklist.</p>}
        {checklist && (
          <div className="space-y-3">
            {checklist.map((item) => {
              const cfg = statusConfig[item.status];
              return (
                <div key={item.id} className="card p-4 flex gap-3">
                  <Icon name={cfg.icon} size={20} className={`${cfg.color} shrink-0 mt-0.5`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{item.title}</span>
                      <span className={`text-xs ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <p className="text-xs text-muted mt-1">{item.note}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  textarea?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-medium block mb-1">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary resize-none placeholder:text-muted/70"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary placeholder:text-muted/70"
        />
      )}
    </div>
  );
}
