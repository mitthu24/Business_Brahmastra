import type { Metadata } from "next";
import Link from "next/link";
import { getDb } from "@/lib/db/client";
import { listPublishedCalculatorsForLearner } from "@/lib/db/calculator-queries";
import { Icon } from "@/components/nav/Icon";

export const metadata: Metadata = { title: "Business Calculators" };
export const dynamic = "force-dynamic";

export default async function CalculatorsPage() {
  const calculators = await listPublishedCalculatorsForLearner(getDb());
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Business Calculators</h1>
      <p className="text-muted mb-6">Live, interactive calculators for the formulas you&apos;re learning.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {calculators.map((c) => (
          <Link key={c.slug} href={`/calculators/${c.slug}`} className="card p-5 hover:border-primary/50 transition-colors">
            <Icon name={c.icon} size={22} className="text-primary mb-3" />
            <h2 className="font-medium text-sm mb-1">{c.title}</h2>
            <p className="text-xs text-muted">{c.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
