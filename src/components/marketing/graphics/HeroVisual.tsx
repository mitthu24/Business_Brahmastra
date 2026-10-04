import { Icon } from "@/components/nav/Icon";

/** The hero's product visualization: a layered composition of small UI cards (day markers, XP,
 * progress, a mini calculator readout) built from CSS/SVG rather than a single stock photo
 * (docs/PHASE-5.4.md "Hero Visual": "Prefer... custom CSS graphics... over a single stock
 * image"). Every number shown is a static illustrative label, never a live or fabricated user
 * metric. The gentle float animation is plain CSS, so the global reduced-motion rule in
 * globals.css silences it for visitors who ask for that. */
export function HeroVisual() {
  return (
    <div className="relative w-full aspect-[4/3] max-w-lg mx-auto">
      <div className="absolute inset-4 rounded-3xl bg-gradient-to-br from-primary/20 via-bg-card to-accent/10 border border-border" />

      <div className="absolute top-6 left-2 sm:left-6 card px-4 py-3 shadow-xl animate-[float_6s_ease-in-out_infinite]">
        <p className="text-[10px] text-muted uppercase tracking-wide">Day</p>
        <p className="text-lg font-bold text-primary">01 → 90</p>
      </div>

      <div className="absolute top-4 right-2 sm:right-4 card px-4 py-3 shadow-xl animate-[float_7s_ease-in-out_infinite_0.5s]">
        <div className="flex items-center gap-2">
          <Icon name="Zap" size={16} className="text-accent" />
          <p className="text-sm font-semibold">+25 XP</p>
        </div>
      </div>

      <div className="absolute bottom-20 left-0 sm:left-2 card px-4 py-3 shadow-xl w-40 animate-[float_8s_ease-in-out_infinite_1s]">
        <p className="text-[10px] text-muted uppercase tracking-wide mb-1.5">Progress</p>
        <div className="h-1.5 rounded-full bg-bg-elevated overflow-hidden">
          <div className="h-full w-2/3 rounded-full bg-primary" />
        </div>
      </div>

      <div className="absolute bottom-6 right-0 sm:right-6 card px-4 py-3 shadow-xl animate-[float_7s_ease-in-out_infinite_1.5s]">
        <div className="flex items-center gap-2">
          <Icon name="Calculator" size={16} className="text-primary" />
          <div>
            <p className="text-[10px] text-muted">Margin</p>
            <p className="text-sm font-semibold">36%</p>
          </div>
        </div>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 card px-5 py-4 shadow-2xl text-center animate-[float_9s_ease-in-out_infinite_0.3s]">
        <Icon name="Trophy" size={22} className="text-accent mx-auto mb-1" />
        <p className="text-xs font-medium">Founder Project</p>
        <p className="text-[10px] text-muted">Day 90</p>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
