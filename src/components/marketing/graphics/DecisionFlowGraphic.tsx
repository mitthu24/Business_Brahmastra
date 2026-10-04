import { Icon } from "@/components/nav/Icon";
import { ScrollReveal } from "@/components/marketing/ScrollReveal";

const steps = [
  { icon: "AlertCircle", label: "Problem" },
  { icon: "Users", label: "Customer" },
  { icon: "Lightbulb", label: "Solution" },
  { icon: "IndianRupee", label: "Revenue" },
  { icon: "Receipt", label: "Cost" },
  { icon: "TrendingUp", label: "Profit" },
  { icon: "Rocket", label: "Scale" },
];

/** The business-thinking chain every lesson ultimately reinforces, as a CSS/SVG graphic rather
 * than a heavy image (docs/PHASE-5.4.md "Business Thinking Visual"). Each node reveals via the
 * existing ScrollReveal primitive with a staggered delay so the chain appears to build left to
 * right (top to bottom on mobile) - no SVG path-drawing animation, which is fragile across
 * browsers for comparatively little visual payoff here. */
export function DecisionFlowGraphic() {
  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-1">
      {steps.map((step, i) => (
        <div key={step.label} className="flex flex-col lg:flex-row items-center gap-1">
          <ScrollReveal delayMs={i * 90}>
            <div className="flex flex-col items-center gap-2 px-4 py-4 rounded-2xl border border-border bg-bg-card w-28">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/15 text-primary">
                <Icon name={step.icon} size={20} />
              </span>
              <span className="text-sm font-medium">{step.label}</span>
            </div>
          </ScrollReveal>
          {i < steps.length - 1 && (
            <Icon
              name="ChevronDown"
              size={18}
              className="text-muted shrink-0 lg:-rotate-90"
              aria-hidden
            />
          )}
        </div>
      ))}
    </div>
  );
}
