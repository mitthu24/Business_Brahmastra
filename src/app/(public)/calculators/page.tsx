import type { Metadata } from "next";
import Link from "next/link";
import { getDb } from "@/lib/db/client";
import { listPublishedCalculatorsForLearner } from "@/lib/db/calculator-queries";
import { Icon } from "@/components/nav/Icon";

export const metadata: Metadata = { title: "Business Calculators" };
/**
 * Phase 5.5.2 performance pass considered removing `force-dynamic` here, since this page has no
 * per-user data (just a published-only read of founder CMS metadata) and
 * src/app/founder/calculator-actions.ts already calls revalidatePath("/calculators") on every
 * publish - a safe, correct caching story on paper. It was reverted: without it, `next build`
 * tries to statically prerender this page, which means actually calling getDb() and hitting
 * Postgres AT BUILD TIME - this breaks the build wherever the database isn't reachable from the
 * build environment (confirmed by running `pnpm build` locally, which failed with
 * `getaddrinfo ENOTFOUND postgres.railway.internal`), which per src/lib/db/client.ts's own
 * documented design is an invariant this app deliberately relies on ("the app's protected routes
 * are all dynamic and only call getDb() at request time... so next build can statically analyze
 * routes without a DATABASE_URL present"). Caching this route safely would need a build-time-safe
 * mechanism (e.g. unstable_cache with an explicit revalidate tag, wired to the same
 * revalidatePath calls) rather than relying on static generation - left as a follow-up rather
 * than risking this app's build-without-a-database guarantee for a page that, being behind the
 * (public) AppShell with no auth gate, was already one of the cheapest routes in the app.
 */
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
