import { calcLTV, calcLtvCacRatio, calcPaybackPeriodMonths } from "@/lib/calculators";

export function UnitEconomicsDiagram({
  arpu,
  lifetimeMonths,
  cac,
}: {
  arpu: number;
  lifetimeMonths: number;
  cac: number;
}) {
  const ltv = calcLTV(arpu, lifetimeMonths);
  const ratio = calcLtvCacRatio(ltv, cac);
  const payback = calcPaybackPeriodMonths(cac, arpu);
  const maxBar = Math.max(ltv, cac, 1);
  const healthy = Number.isFinite(ratio) && ratio >= 3;

  return (
    <div>
      <div className="flex items-center gap-3 text-sm mb-4">
        <span className="rounded-full bg-primary/15 text-primary px-3 py-1">CUSTOMER</span>
        <span className="text-muted">generates</span>
        <span className="rounded-full bg-accent/15 text-accent px-3 py-1">REVENUE</span>
        <span className="text-muted">over lifetime →</span>
        <span className="rounded-full bg-success/15 text-success px-3 py-1">LTV</span>
      </div>

      <div className="space-y-3 max-w-sm">
        <BarRow label="LTV" value={ltv} max={maxBar} color="var(--color-success)" formatted={`₹${Math.round(ltv).toLocaleString("en-IN")}`} />
        <BarRow label="CAC" value={cac} max={maxBar} color="var(--color-warning)" formatted={`₹${Math.round(cac).toLocaleString("en-IN")}`} />
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4 max-w-sm">
        <div className="card p-3">
          <p className="text-xs text-muted">LTV : CAC Ratio</p>
          <p className={`text-lg font-bold ${healthy ? "text-success" : "text-warning"}`}>
            {Number.isFinite(ratio) ? `${ratio.toFixed(1)} : 1` : "∞"}
          </p>
        </div>
        <div className="card p-3">
          <p className="text-xs text-muted">Payback Period</p>
          <p className="text-lg font-bold">{Number.isFinite(payback) ? `${payback.toFixed(1)} mo` : "∞"}</p>
        </div>
      </div>
      <p className="text-xs text-muted mt-3">
        {healthy
          ? "A ratio of 3:1 or higher is often considered a healthy sign of sustainable unit economics."
          : "A ratio below 3:1 suggests the cost of acquiring a customer may be too high relative to their value — worth investigating."}
      </p>
    </div>
  );
}

function BarRow({ label, value, max, color, formatted }: { label: string; value: number; max: number; color: string; formatted: string }) {
  const pct = max === 0 ? 0 : Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="font-medium">{label}</span>
        <span>{formatted}</span>
      </div>
      <div className="h-3 rounded-full bg-bg-elevated overflow-hidden">
        <div className="h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}
