"use client";

import { useMemo, useState } from "react";
import type { CaseStudyEntry } from "@/lib/content/types";

const allCategories = [
  "All",
  "SaaS",
  "E-commerce",
  "Fintech",
  "Food",
  "Retail",
  "Manufacturing",
  "Marketplace",
  "Consumer",
  "Indian Startups",
  "Global Companies",
] as const;

export function CaseStudyBrowser({ items }: { items: CaseStudyEntry[] }) {
  const [category, setCategory] = useState<string>("All");

  const filtered = useMemo(
    () => (category === "All" ? items : items.filter((i) => i.category === category)),
    [items, category]
  );

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-thin">
        {allCategories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm transition-colors ${
              category === c ? "bg-primary text-primary-foreground" : "border border-border text-muted hover:text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {filtered.map((cs) => (
          <article key={cs.id} id={cs.id} className="card p-6 scroll-mt-20">
            <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
              <div>
                <h2 className="text-lg font-semibold">{cs.company}</h2>
                <p className="text-xs text-muted">{cs.industry} · {cs.category}</p>
              </div>
              <span
                className={`text-xs rounded-full px-2.5 py-1 shrink-0 ${
                  cs.factType === "documented" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
                }`}
              >
                {cs.factType === "documented" ? "Documented fact" : "Illustrative analysis"}
              </span>
            </div>
            <dl className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <Field label="Problem" value={cs.problem} />
              <Field label="Solution" value={cs.solution} />
              <Field label="Customer" value={cs.customer} />
              <Field label="Business Model" value={cs.businessModel} />
              <Field label="Revenue Model" value={cs.revenueModel} />
              <Field label="Growth" value={cs.growth} />
              <Field label="Competition" value={cs.competition} />
              <Field label="Challenges" value={cs.challenges} />
            </dl>
            <div className="mt-4 pt-4 border-t border-border">
              <div className="text-xs font-semibold text-muted mb-2">LESSONS</div>
              <ul className="list-disc list-inside text-sm space-y-1">
                {cs.lessons.map((l, i) => <li key={i}>{l}</li>)}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-muted mb-0.5">{label.toUpperCase()}</dt>
      <dd className="text-muted">{value}</dd>
    </div>
  );
}
