"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { GlossaryEntry } from "@/lib/content/types";

export function GlossarySearch({ terms }: { terms: GlossaryEntry[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return terms;
    return terms.filter((t) => t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q));
  }, [terms, query]);

  const grouped = useMemo(() => {
    const groups: Record<string, GlossaryEntry[]> = {};
    for (const t of filtered) {
      const letter = t.term[0].toUpperCase();
      groups[letter] = groups[letter] || [];
      groups[letter].push(t);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`Search ${terms.length}+ terms...`}
        className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-2.5 text-sm outline-none focus-visible:border-primary mb-6"
        aria-label="Search glossary"
      />
      {filtered.length === 0 && <p className="text-muted text-sm">No terms match &ldquo;{query}&rdquo;.</p>}
      <div className="space-y-8">
        {grouped.map(([letter, items]) => (
          <section key={letter}>
            <h2 className="text-sm font-semibold text-muted mb-2">{letter}</h2>
            <div className="grid sm:grid-cols-2 gap-2">
              {items.map((t) => (
                <Link key={t.slug} href={`/glossary/${t.slug}`} className="card p-3 hover:border-primary/50 transition-colors">
                  <div className="font-medium text-sm">{t.term}</div>
                  <div className="text-xs text-muted line-clamp-1 mt-0.5">{t.definition}</div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
