import type { FormulaEntryRow } from "@/lib/db/content-queries";

/** Mirrors the learner-facing card layout at src/app/(public)/formulas/page.tsx. */
export function FormulaPreview({ entry }: { entry: FormulaEntryRow }) {
  return (
    <div className="card p-5 max-w-xl">
      <h3 className="font-medium mb-2">{entry.name}</h3>
      <pre className="whitespace-pre-wrap font-mono text-sm text-primary bg-primary/10 rounded-lg p-3 mb-3">{entry.expression}</pre>
      <p className="text-sm text-muted mb-2">{entry.explanation}</p>
      <p className="text-xs text-muted border-t border-border pt-2 mt-2">{entry.example}</p>
    </div>
  );
}
