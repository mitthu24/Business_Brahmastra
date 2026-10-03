const forces = [
  { label: "Competitive Rivalry", desc: "How intense is competition among existing players?", area: "top" },
  { label: "Threat of New Entrants", desc: "How easily could a new competitor enter?", area: "right" },
  { label: "Supplier Power", desc: "How much leverage do your suppliers have?", area: "bottomRight" },
  { label: "Buyer Power", desc: "How much leverage do your customers have?", area: "bottomLeft" },
  { label: "Threat of Substitutes", desc: "Could customers solve this differently?", area: "left" },
] as const;

const forceByArea = Object.fromEntries(forces.map((f) => [f.area, f]));

function ForceCard({ force }: { force: (typeof forces)[number] }) {
  return (
    <div className="card p-3 text-center h-full flex flex-col justify-center">
      <p className="text-xs font-semibold">{force.label}</p>
    </div>
  );
}

export function PortersFiveForces() {
  return (
    <div>
      {/* Mobile & tablet: clean stacked list — no radial shape to sacrifice readability for. */}
      <div className="lg:hidden space-y-2 max-w-md mx-auto">
        <div className="card bg-primary/15 border-primary/40 p-3 text-center font-bold text-sm">YOUR INDUSTRY</div>
        {forces.map((f) => (
          <div key={f.label} className="card p-3">
            <p className="text-xs font-semibold">{f.label}</p>
          </div>
        ))}
      </div>

      {/* Desktop: a balanced 5-point layout via CSS grid (no absolute-position dead space, no overlap). */}
      <div
        className="hidden lg:grid gap-3 max-w-xl mx-auto"
        style={{
          gridTemplateAreas: `"left top top right" "left center center right" "bottomLeft bottomLeft bottomRight bottomRight"`,
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gridTemplateRows: "auto auto auto",
        }}
      >
        <div style={{ gridArea: "top" }}><ForceCard force={forceByArea.top} /></div>
        <div style={{ gridArea: "left" }} className="flex items-center"><ForceCard force={forceByArea.left} /></div>
        <div style={{ gridArea: "right" }} className="flex items-center"><ForceCard force={forceByArea.right} /></div>
        <div style={{ gridArea: "center" }} className="card bg-primary/15 border-primary/40 flex items-center justify-center text-center p-4">
          <p className="text-xs font-bold">YOUR INDUSTRY</p>
        </div>
        <div style={{ gridArea: "bottomLeft" }}><ForceCard force={forceByArea.bottomLeft} /></div>
        <div style={{ gridArea: "bottomRight" }}><ForceCard force={forceByArea.bottomRight} /></div>
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
