const rings = [
  { key: "tam", label: "TAM", sub: "Total Addressable Market", example: "All fitness-app users in India", radius: 140, color: "var(--color-primary)", opacity: 0.12 },
  { key: "sam", label: "SAM", sub: "Serviceable Available Market", example: "Urban, smartphone, willing to pay", radius: 95, color: "var(--color-primary)", opacity: 0.22 },
  { key: "som", label: "SOM", sub: "Serviceable Obtainable Market", example: "Realistic 2-year capture target", radius: 50, color: "var(--color-primary)", opacity: 0.45 },
];

export function TamSamSom() {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <svg viewBox="0 0 320 320" role="img" aria-label="Concentric circles showing TAM, SAM, and SOM, each smaller than the last" className="w-64 h-64 shrink-0">
        {rings.map((r) => (
          <circle key={r.key} cx={160} cy={160} r={r.radius} fill={r.color} fillOpacity={r.opacity} stroke={r.color} strokeOpacity={0.5} />
        ))}
        <text x={160} y={40} textAnchor="middle" className="fill-current text-xs font-semibold" style={{ fill: "var(--color-foreground)" }}>TAM</text>
        <text x={160} y={85} textAnchor="middle" className="fill-current text-xs font-semibold" style={{ fill: "var(--color-foreground)" }}>SAM</text>
        <text x={160} y={160} textAnchor="middle" className="fill-current text-xs font-bold" style={{ fill: "var(--color-foreground)" }}>SOM</text>
      </svg>
      <ul className="space-y-3 text-sm">
        {rings.map((r) => (
          <li key={r.key}>
            <span className="font-semibold text-primary">{r.label}</span> — {r.sub}
            <p className="text-xs text-muted">{r.example}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
