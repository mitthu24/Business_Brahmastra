import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { glossary } from "@/lib/content/glossary";

export function generateStaticParams() {
  return glossary.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const entry = glossary.find((g) => g.slug === slug);
  if (!entry) return {};
  return { title: entry.term, description: entry.definition };
}

export default async function GlossaryTermPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = glossary.find((g) => g.slug === slug);
  if (!entry) notFound();

  const related = glossary.filter((g) => entry.relatedTerms.includes(g.term));

  return (
    <div className="max-w-2xl">
      <Link href="/glossary" className="text-sm text-muted hover:text-foreground">← Back to Glossary</Link>
      <h1 className="text-3xl font-bold mt-3 mb-4">{entry.term}</h1>
      <div className="card p-5 space-y-4">
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
      </div>
      {related.length > 0 && (
        <div className="mt-6">
          <div className="text-xs font-semibold text-muted mb-2">RELATED TERMS</div>
          <div className="flex flex-wrap gap-2">
            {related.map((r) => (
              <Link key={r.slug} href={`/glossary/${r.slug}`} className="text-sm rounded-full border border-border px-3 py-1 hover:bg-bg-elevated transition-colors">
                {r.term}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
