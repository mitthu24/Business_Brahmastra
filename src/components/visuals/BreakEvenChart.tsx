import { calcBreakEven } from "@/lib/calculators";

const WIDTH = 400;
const HEIGHT = 240;
const PAD = 36;

export function BreakEvenChart({
  fixedCosts,
  sellingPrice,
  variableCost,
}: {
  fixedCosts: number;
  sellingPrice: number;
  variableCost: number;
}) {
  const { breakEvenUnits } = calcBreakEven(fixedCosts, sellingPrice, variableCost);
  const finiteBreakEven = Number.isFinite(breakEvenUnits) ? breakEvenUnits : 0;
  const maxUnits = Math.max(finiteBreakEven * 1.6, sellingPrice > 0 ? (fixedCosts / sellingPrice) * 2 : 10, 10);

  const revenueAt = (units: number) => sellingPrice * units;
  const costAt = (units: number) => fixedCosts + variableCost * units;
  const maxY = Math.max(revenueAt(maxUnits), costAt(maxUnits), 1);

  const toX = (units: number) => PAD + (units / maxUnits) * (WIDTH - PAD * 1.5);
  const toY = (rupees: number) => HEIGHT - PAD - (rupees / maxY) * (HEIGHT - PAD * 1.5);

  const revenueLine = `M ${toX(0)},${toY(0)} L ${toX(maxUnits)},${toY(revenueAt(maxUnits))}`;
  const costLine = `M ${toX(0)},${toY(costAt(0))} L ${toX(maxUnits)},${toY(costAt(maxUnits))}`;
  const showBreakEven = Number.isFinite(breakEvenUnits) && breakEvenUnits <= maxUnits;

  return (
    <div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`Break-even chart: revenue and total cost lines versus units sold.${
          showBreakEven ? ` Break-even at approximately ${Math.round(breakEvenUnits)} units.` : " No break-even reachable at this price."
        }`}
        className="w-full max-w-md"
      >
        {/* axes */}
        <line x1={PAD} y1={HEIGHT - PAD} x2={WIDTH - PAD / 2} y2={HEIGHT - PAD} stroke="var(--color-border)" strokeWidth={1} />
        <line x1={PAD} y1={PAD / 2} x2={PAD} y2={HEIGHT - PAD} stroke="var(--color-border)" strokeWidth={1} />
        <text x={WIDTH / 2} y={HEIGHT - 6} textAnchor="middle" fontSize="10" fill="var(--color-muted)">Units Sold</text>
        <text x={10} y={PAD / 2} fontSize="10" fill="var(--color-muted)">₹</text>

        {/* cost + revenue lines */}
        <path d={costLine} fill="none" stroke="var(--color-warning)" strokeWidth={2} />
        <path d={revenueLine} fill="none" stroke="var(--color-primary)" strokeWidth={2} />

        {/* break-even marker */}
        {showBreakEven && (
          <>
            <line
              x1={toX(breakEvenUnits)}
              y1={toY(0)}
              x2={toX(breakEvenUnits)}
              y2={toY(revenueAt(breakEvenUnits))}
              stroke="var(--color-success)"
              strokeDasharray="4 3"
              strokeWidth={1.5}
            />
            <circle cx={toX(breakEvenUnits)} cy={toY(revenueAt(breakEvenUnits))} r={4} fill="var(--color-success)" />
          </>
        )}
      </svg>
      <div className="flex flex-wrap gap-4 text-xs mt-2">
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-primary inline-block" /> Revenue</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-warning inline-block" /> Total Cost</span>
        {showBreakEven && <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-success inline-block" /> Break-even: {Math.round(breakEvenUnits).toLocaleString("en-IN")} units</span>}
        {!showBreakEven && <span className="text-danger">Break-even not reachable at this price/cost combination.</span>}
      </div>
    </div>
  );
}
