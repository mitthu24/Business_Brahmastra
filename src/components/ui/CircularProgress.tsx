/** A small SVG ring - CSS/SVG only, no chart library (docs/PHASE-5.5.md "Progress Page": "Do not
 * add a chart library unnecessarily. CSS/SVG visualizations are preferred where sufficient").
 * Pure presentation: `percent` is always computed by the caller from real progress-store data,
 * never fabricated here. */
export function CircularProgress({
  percent,
  size = 72,
  strokeWidth = 7,
  label,
  sublabel,
}: {
  percent: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-bold leading-none" style={{ fontSize: size * 0.22 }}>{label ?? `${Math.round(clamped)}%`}</span>
        {sublabel && <span className="text-[10px] text-muted mt-0.5">{sublabel}</span>}
      </div>
    </div>
  );
}
