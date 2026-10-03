"use client";

import { useState } from "react";

const quadrants = [
  { key: "strengths", label: "STRENGTHS", tone: "success", desc: "Internal advantages you already have.", example: "Unique recipes, loyal customers" },
  { key: "weaknesses", label: "WEAKNESSES", tone: "danger", desc: "Internal limitations you currently have.", example: "Limited capital, small team" },
  { key: "opportunities", label: "OPPORTUNITIES", tone: "primary", desc: "External, favourable trends or gaps.", example: "Growing demand for the category" },
  { key: "threats", label: "THREATS", tone: "warning", desc: "External risks or competitive pressure.", example: "A larger competitor entering the market" },
] as const;

const toneClasses: Record<string, string> = {
  success: "border-success/40 bg-success/10 hover:bg-success/15",
  danger: "border-danger/40 bg-danger/10 hover:bg-danger/15",
  primary: "border-primary/40 bg-primary/10 hover:bg-primary/15",
  warning: "border-warning/40 bg-warning/10 hover:bg-warning/15",
};

export function SwotMatrix() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-2 gap-2 max-w-lg">
      {quadrants.map((q) => (
        <button
          key={q.key}
          onClick={() => setActive(active === q.key ? null : q.key)}
          className={`text-left rounded-xl border p-4 transition-colors ${toneClasses[q.tone]}`}
          aria-expanded={active === q.key}
        >
          <p className="font-semibold text-sm mb-1">{q.label}</p>
          <p className="text-xs text-muted">{q.desc}</p>
          {active === q.key && <p className="text-xs mt-2 border-t border-border pt-2">e.g. {q.example}</p>}
        </button>
      ))}
    </div>
  );
}
