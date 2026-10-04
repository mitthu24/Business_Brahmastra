import { Counter } from "@/components/marketing/Counter";

const cards = [
  { label: "Revenue", value: 500000, color: "text-foreground" },
  { label: "Costs", value: 320000, color: "text-warning" },
  { label: "Profit", value: 180000, color: "text-success" },
];

/** An illustrative example dashboard for the Calculate section - NOT a real user's data
 * (docs/PHASE-5.4.md "Calculator Visual": "Clearly make it a visual example, not a real user
 * result"). The actual computation engines (src/lib/calculators.ts) are untouched; this is a
 * static marketing visual with animated counters, not a live calculator. */
export function CalculatorShowcase() {
  const margin = Math.round((180000 / 500000) * 100);

  return (
    <div className="card p-6">
      <p className="text-xs text-muted mb-4 uppercase tracking-wide">Illustrative example — not your data</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-bg-elevated p-4">
            <p className="text-xs text-muted mb-1">{c.label}</p>
            <p className={`text-xl font-bold ${c.color}`}>
              <Counter value={c.value} prefix="₹" />
            </p>
          </div>
        ))}
        <div className="rounded-xl border border-border bg-bg-elevated p-4">
          <p className="text-xs text-muted mb-1">Margin</p>
          <p className="text-xl font-bold text-primary">
            <Counter value={margin} suffix="%" />
          </p>
        </div>
      </div>
    </div>
  );
}
