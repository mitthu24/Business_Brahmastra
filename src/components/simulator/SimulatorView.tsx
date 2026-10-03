"use client";

import { useMemo, useState } from "react";
import { businessTypes, runSimulation, scenarios, type SimulatorInputs } from "@/lib/simulator";
import { Icon } from "@/components/nav/Icon";

const fieldLabels: Record<keyof SimulatorInputs, string> = {
  price: "Price per Customer/Unit (₹)",
  customers: "Customers per Month",
  marketingCost: "Monthly Marketing Cost (₹)",
  employeeCost: "Monthly Employee Cost (₹)",
  rent: "Monthly Rent (₹)",
  otherCostPerUnit: "Material/Other Cost per Customer (₹)",
};

export function SimulatorView() {
  const [typeId, setTypeId] = useState(businessTypes[0].id);
  const activeType = businessTypes.find((t) => t.id === typeId) ?? businessTypes[0];
  const [inputs, setInputs] = useState<SimulatorInputs>(activeType.defaults);
  const [selectedScenario, setSelectedScenario] = useState<Record<string, string>>({});

  const results = useMemo(() => runSimulation(inputs), [inputs]);

  function selectType(id: string) {
    const type = businessTypes.find((t) => t.id === id);
    if (!type) return;
    setTypeId(id);
    setInputs(type.defaults);
  }

  function fmt(n: number) {
    return Number.isFinite(n) ? `₹${Math.round(n).toLocaleString("en-IN")}` : "∞";
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-sm font-semibold text-muted mb-3">1. CHOOSE A BUSINESS TYPE</h2>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {businessTypes.map((t) => (
            <button
              key={t.id}
              onClick={() => selectType(t.id)}
              className={`shrink-0 flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-colors ${
                typeId === t.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted hover:text-foreground"
              }`}
            >
              <Icon name={t.icon} size={16} /> {t.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-muted mb-3">2. SET YOUR NUMBERS</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            {(Object.keys(fieldLabels) as Array<keyof SimulatorInputs>).map((key) => (
              <div key={key}>
                <label className="text-sm font-medium block mb-1">{fieldLabels[key]}</label>
                <input
                  type="number"
                  value={inputs[key]}
                  onChange={(e) => setInputs((prev) => ({ ...prev, [key]: Number(e.target.value) || 0 }))}
                  className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary"
                />
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <ResultRow label="Revenue" value={fmt(results.revenue)} />
            <ResultRow label="COGS" value={fmt(results.cogs)} />
            <ResultRow label="Gross Profit" value={fmt(results.grossProfit)} />
            <ResultRow label="Operating Expenses" value={fmt(results.operatingExpenses)} />
            <ResultRow label="Net Profit" value={fmt(results.netProfit)} highlight />
            <ResultRow label="Margin" value={`${results.marginPercent.toFixed(1)}%`} />
            <ResultRow label="Break-even (customers/units)" value={Number.isFinite(results.breakEvenUnits) ? results.breakEvenUnits.toLocaleString("en-IN") : "Not reachable at this price"} />
            <ResultRow label="Monthly Cash Burn" value={results.cashBurn > 0 ? fmt(results.cashBurn) : "None — profitable"} warn={results.cashBurn > 0} />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-muted mb-3">3. REACT TO BUSINESS SCENARIOS</h2>
        <div className="space-y-6">
          {scenarios.map((s) => (
            <div key={s.id} className="card p-5">
              <p className="font-medium mb-3">{s.prompt}</p>
              <div className="space-y-2">
                {s.options.map((o) => {
                  const selected = selectedScenario[s.id] === o.id;
                  return (
                    <button
                      key={o.id}
                      onClick={() => setSelectedScenario((prev) => ({ ...prev, [s.id]: o.id }))}
                      className={`w-full text-left rounded-lg border px-3 py-2 text-sm transition-colors ${
                        selected ? "border-primary bg-primary/10" : "border-border hover:bg-bg-elevated"
                      }`}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
              {selectedScenario[s.id] && (
                <p className="text-sm text-muted mt-3 border-t border-border pt-3">
                  {s.options.find((o) => o.id === selectedScenario[s.id])?.consequence}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ResultRow({ label, value, highlight, warn }: { label: string; value: string; highlight?: boolean; warn?: boolean }) {
  return (
    <div className={`card p-3.5 flex items-center justify-between ${highlight ? "bg-primary/10 border-primary/30" : ""}`}>
      <span className="text-sm text-muted">{label}</span>
      <span className={`font-semibold ${warn ? "text-warning" : highlight ? "text-primary" : ""}`}>{value}</span>
    </div>
  );
}
