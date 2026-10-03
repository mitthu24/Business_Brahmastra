import type { CaseStudyEntryRow } from "@/lib/db/content-queries";

/** Summarized preview of the fields the learner-facing CaseStudyBrowser renders
 * (src/components/case-studies/CaseStudyBrowser.tsx). */
export function CaseStudyPreview({ entry }: { entry: CaseStudyEntryRow }) {
  return (
    <div className="card p-5 max-w-xl space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{entry.company}</h3>
        <span className="text-xs text-muted">{entry.category} · {entry.factType}</span>
      </div>
      <p className="text-xs text-muted">{entry.industry}</p>
      <div>
        <div className="text-xs font-semibold text-muted mb-1">PROBLEM</div>
        <p className="text-sm">{entry.problem}</p>
      </div>
      <div>
        <div className="text-xs font-semibold text-muted mb-1">SOLUTION</div>
        <p className="text-sm">{entry.solution}</p>
      </div>
      {entry.lessons.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-muted mb-1">LESSONS</div>
          <ul className="text-sm list-disc list-inside space-y-1">
            {entry.lessons.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
