import { calcDilution } from "@/lib/calculators";

export function FundingDilutionDiagram({
  previousOwnershipPercent,
  newInvestorOwnershipPercent,
}: {
  previousOwnershipPercent: number;
  newInvestorOwnershipPercent: number;
}) {
  const { newOwnershipPercent, dilutionPoints } = calcDilution(previousOwnershipPercent, newInvestorOwnershipPercent);

  return (
    <div className="max-w-sm">
      <p className="text-xs text-muted mb-2">BEFORE</p>
      <OwnershipBar segments={[{ label: "Founder", percent: previousOwnershipPercent, color: "var(--color-primary)" }]} />

      <p className="text-xs text-muted mb-2 mt-5">AFTER INVESTMENT</p>
      <OwnershipBar
        segments={[
          { label: "Founder", percent: newOwnershipPercent, color: "var(--color-primary)" },
          { label: "Investor", percent: newInvestorOwnershipPercent, color: "var(--color-accent)" },
        ]}
      />

      <p className="text-sm mt-4">
        Founder ownership moves from <span className="font-semibold">{previousOwnershipPercent.toFixed(1)}%</span> to{" "}
        <span className="font-semibold text-primary">{newOwnershipPercent.toFixed(1)}%</span> — a dilution of{" "}
        <span className="font-semibold text-warning">{dilutionPoints.toFixed(1)} percentage points</span>.
      </p>
    </div>
  );
}

function OwnershipBar({ segments }: { segments: { label: string; percent: number; color: string }[] }) {
  return (
    <div>
      <div className="h-8 rounded-lg overflow-hidden flex border border-border">
        {segments.map((s) => (
          <div
            key={s.label}
            style={{ width: `${Math.max(0, Math.min(100, s.percent))}%`, background: s.color }}
            className="flex items-center justify-center text-xs font-medium text-white transition-[width] duration-500 motion-reduce:transition-none"
          >
            {s.percent >= 12 ? `${s.percent.toFixed(0)}%` : ""}
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-1.5 text-xs text-muted">
        {segments.map((s) => (
          <span key={s.label}>{s.label}: {s.percent.toFixed(1)}%</span>
        ))}
      </div>
    </div>
  );
}
