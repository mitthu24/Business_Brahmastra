import "server-only";
import { eq, and, or, ilike, type SQL } from "drizzle-orm";
import type { Database } from "./types";
import { calculatorEntries } from "./schema";
import type { ContentStatus } from "./content-queries";
import { calculatorMeta } from "@/lib/calculator-meta";

export interface CalculatorFilters {
  status?: ContentStatus;
  search?: string;
}

export interface CalculatorEntryRow {
  id: string;
  title: string;
  description: string;
  category: string;
  helpText: string | null;
  ordering: number;
  status: ContentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export async function listCalculatorEntries(db: Database, filters: CalculatorFilters = {}): Promise<CalculatorEntryRow[]> {
  const conditions: SQL[] = [];
  if (filters.status) conditions.push(eq(calculatorEntries.status, filters.status));
  if (filters.search) {
    const needle = `%${filters.search}%`;
    conditions.push(or(ilike(calculatorEntries.title, needle), ilike(calculatorEntries.description, needle))!);
  }
  return db
    .select()
    .from(calculatorEntries)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(calculatorEntries.ordering, calculatorEntries.title);
}

export async function getCalculatorEntry(db: Database, id: string): Promise<CalculatorEntryRow | null> {
  const [row] = await db.select().from(calculatorEntries).where(eq(calculatorEntries.id, id)).limit(1);
  return row ?? null;
}

/** The learner read path (docs/PHASE-5.3.md "Calculator CMS"): the public /calculators directory
 * lists only published entries, ordered by `ordering`, falling back to the hardcoded
 * calculatorMeta entry for any slug not yet migrated - never hiding a calculator whose compute
 * code and page already exist just because its CMS row doesn't exist yet. The individual
 * calculator pages themselves are unaffected (see docs/PHASE-5.3.md "Known limitations") - this
 * only governs the directory listing. */
export async function listPublishedCalculatorsForLearner(
  db: Database
): Promise<{ slug: string; title: string; description: string; icon: string }[]> {
  const rows = await db.select().from(calculatorEntries);
  const byId = new Map(rows.map((r) => [r.id, r]));
  return calculatorMeta
    .map((m) => {
      const row = byId.get(m.slug);
      if (row) return row.status === "published" ? { slug: m.slug, title: row.title, description: row.description, icon: m.icon } : null;
      return { slug: m.slug, title: m.title, description: m.description, icon: m.icon };
    })
    .filter((c): c is { slug: string; title: string; description: string; icon: string } => c !== null)
    .sort((a, b) => {
      const orderA = byId.get(a.slug)?.ordering ?? 0;
      const orderB = byId.get(b.slug)?.ordering ?? 0;
      return orderA - orderB;
    });
}

export interface CalculatorEntryInput {
  title: string;
  description: string;
  category: string;
  helpText?: string;
  ordering: number;
}

export async function updateCalculatorEntry(db: Database, id: string, input: CalculatorEntryInput, founderId: string): Promise<void> {
  await db
    .update(calculatorEntries)
    .set({ ...input, helpText: input.helpText ?? null, updatedBy: founderId, updatedAt: new Date() })
    .where(eq(calculatorEntries.id, id));
}

export async function setCalculatorEntryStatus(db: Database, id: string, status: ContentStatus, founderId: string): Promise<void> {
  await db
    .update(calculatorEntries)
    .set({ status, updatedBy: founderId, updatedAt: new Date() })
    .where(eq(calculatorEntries.id, id));
}
