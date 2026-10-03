import type { GlossaryEntryRow } from "@/lib/db/content-queries";

/** Mirrors the learner-facing layout at src/app/(public)/glossary/[slug]/page.tsx, so the founder
 * sees exactly what a learner would see once this entry is published - without reading from the
 * CMS tables on the actual public route (deferred; see docs/PHASE-5.3.md "Known limitations"). */
export function GlossaryPreview({ entry }: { entry: GlossaryEntryRow }) {
  return (
    <div className="card p-5 space-y-4 max-w-xl">
      <h2 className="text-xl font-bold">{entry.term}</h2>
      <p>{entry.definition}</p>
      <div>
        <div className="text-xs font-semibold text-muted mb-1">EXAMPLE</div>
        <p className="text-sm">{entry.example}</p>
      </div>
      {entry.formula && (
        <div>
          <div className="text-xs font-semibold text-muted mb-1">FORMULA</div>
          <pre className="font-mono text-sm text-primary bg-primary/10 rounded-lg p-3 whitespace-pre-wrap">{entry.formula}</pre>
        </div>
      )}
      {entry.mnemonic && (
        <div>
          <div className="text-xs font-semibold text-muted mb-1">MEMORY TRICK</div>
          <p className="text-sm">{entry.mnemonic}</p>
        </div>
      )}
      {entry.relatedTerms.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-muted mb-2">RELATED TERMS</div>
          <div className="flex flex-wrap gap-2">
            {entry.relatedTerms.map((t) => (
              <span key={t} className="text-sm rounded-full border border-border px-3 py-1">{t}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
