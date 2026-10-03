"use client";

import { useState } from "react";
import { Icon } from "@/components/nav/Icon";

const layers = [
  { key: "revenue", label: "Revenue", explanation: "All money received from sales, before any costs." },
  { key: "cogs", label: "− COGS", explanation: "Direct costs of producing what was sold (materials, direct labour)." },
  { key: "grossProfit", label: "= Gross Profit", explanation: "Revenue minus COGS — core production efficiency." },
  { key: "opex", label: "− Operating Expenses", explanation: "Running costs: rent, salaries, marketing, software." },
  { key: "operatingProfit", label: "= Operating Profit", explanation: "Profit from core operations, before interest and tax." },
  { key: "interestTax", label: "− Interest + Tax", explanation: "Financing costs and taxes owed." },
  { key: "netProfit", label: "= Net Profit", explanation: "What's left after absolutely everything — the bottom line." },
];

export function PnLDiagram() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="max-w-md">
      <div className="space-y-1.5">
        {layers.map((l) => {
          const isTotal = l.label.startsWith("=");
          return (
            <div key={l.key}>
              <button
                onClick={() => setActive(active === l.key ? null : l.key)}
                className={`w-full flex items-center justify-between text-left rounded-lg border px-4 py-2.5 transition-colors ${
                  isTotal ? "border-primary/40 bg-primary/10 font-semibold" : "border-border hover:bg-bg-elevated"
                }`}
                aria-expanded={active === l.key}
              >
                <span className="text-sm">{l.label}</span>
                <Icon name="ChevronDown" size={14} className={`text-muted transition-transform ${active === l.key ? "rotate-180" : ""}`} />
              </button>
              {active === l.key && (
                <p className="text-xs text-muted px-4 py-2">{l.explanation}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
