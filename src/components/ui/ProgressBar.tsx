export function ProgressBar({
  percent,
  label,
  size = "md",
}: {
  percent: number;
  label?: string;
  size?: "sm" | "md";
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  const height = size === "sm" ? "h-1.5" : "h-2.5";
  return (
    <div role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100} aria-label={label ?? "Progress"}>
      <div className={`${height} rounded-full bg-bg-elevated overflow-hidden`}>
        <div
          className="h-full bg-primary rounded-full transition-[width] duration-500 motion-reduce:transition-none"
          style={{ width: `${clamped}%` }}
        />
      </div>
      {label && <p className="text-xs text-muted mt-1.5">{label}</p>}
    </div>
  );
}
