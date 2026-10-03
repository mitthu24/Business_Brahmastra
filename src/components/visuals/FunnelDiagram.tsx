import { FadeIn } from "@/components/ui/FadeIn";
import { Icon } from "@/components/nav/Icon";

export interface FunnelStage {
  name: string;
  explanation: string;
  example: string;
  metric: string;
}

/** Generic vertical funnel visual shared by Marketing/Sales/AARRR funnels — each narrower than the last. */
export function FunnelDiagram({ stages, illustrative }: { stages: FunnelStage[]; illustrative?: boolean }) {
  return (
    <div>
      {illustrative && (
        <p className="text-xs text-warning mb-3">Numbers below are illustrative examples, not universal benchmarks.</p>
      )}
      <div className="flex flex-col items-stretch gap-0 max-w-xl mx-auto">
        {stages.map((stage, i) => {
          const widthPercent = 100 - i * (40 / Math.max(stages.length - 1, 1));
          return (
            <FadeIn key={stage.name}>
              <div className="flex flex-col items-center">
                <div
                  className="card border-primary/30 bg-primary/10 px-4 py-3 text-center"
                  style={{ width: `${widthPercent}%`, minWidth: "60%" }}
                >
                  <p className="font-semibold text-sm">{stage.name}</p>
                  <p className="text-xs text-muted mt-1">{stage.explanation}</p>
                  <p className="text-xs mt-1.5"><span className="text-muted">e.g. </span>{stage.example}</p>
                  <p className="text-xs font-medium text-primary mt-1">{stage.metric}</p>
                </div>
                {i < stages.length - 1 && <Icon name="ChevronDown" size={18} className="text-muted my-1" aria-hidden />}
              </div>
            </FadeIn>
          );
        })}
      </div>
    </div>
  );
}
