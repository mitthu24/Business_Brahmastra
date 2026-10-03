const forces = [
  { label: "Competitive Rivalry", desc: "How intense is competition among existing players?", pos: "top-0 left-1/2 -translate-x-1/2" },
  { label: "Threat of New Entrants", desc: "How easily could a new competitor enter?", pos: "top-1/4 right-0" },
  { label: "Supplier Power", desc: "How much leverage do your suppliers have?", pos: "bottom-1/4 right-0" },
  { label: "Buyer Power", desc: "How much leverage do your customers have?", pos: "bottom-0 left-1/2 -translate-x-1/2" },
  { label: "Threat of Substitutes", desc: "Could customers solve this differently?", pos: "top-1/4 left-0" },
];

export function PortersFiveForces() {
  return (
    <div>
      <div className="relative w-full max-w-xl mx-auto aspect-square sm:aspect-[4/3]">
        <div className="absolute inset-0 hidden sm:block">
          {forces.map((f) => (
            <div key={f.label} className={`absolute ${f.pos} w-36 sm:w-44`}>
              <div className="card p-3 text-center">
                <p className="text-xs font-semibold">{f.label}</p>
              </div>
            </div>
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="card bg-primary/15 border-primary/40 w-28 h-28 rounded-full flex items-center justify-center text-center p-2">
              <p className="text-xs font-bold">YOUR INDUSTRY</p>
            </div>
          </div>
        </div>
        {/* mobile fallback: simple stacked list, same content as the desktop radial layout */}
        <div className="sm:hidden space-y-2">
          <div className="card bg-primary/15 border-primary/40 p-3 text-center font-bold text-sm">YOUR INDUSTRY</div>
          {forces.map((f) => (
            <div key={f.label} className="card p-3">
              <p className="text-xs font-semibold">{f.label}</p>
            </div>
          ))}
        </div>
      </div>
      <ul className="mt-4 space-y-1.5 text-sm">
        {forces.map((f) => (
          <li key={f.label}><span className="font-medium">{f.label}:</span> <span className="text-muted">{f.desc}</span></li>
        ))}
      </ul>
      <p className="text-xs text-muted mt-3">No single force is automatically good or bad — each simply describes a pressure on the industry&apos;s profit potential.</p>
    </div>
  );
}
