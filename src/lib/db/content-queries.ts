import "server-only";
import { eq, and, or, ilike, type SQL } from "drizzle-orm";
import type { Database } from "./types";
import { glossaryEntries, formulaEntries, caseStudyEntries } from "./schema";

export type ContentStatus = "draft" | "published" | "archived";

export interface ContentFilters {
  status?: ContentStatus;
  search?: string;
}

function parseStringArray(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

// ---------- Glossary ----------

export interface GlossaryEntryRow {
  id: string;
  term: string;
  slug: string;
  definition: string;
  example: string;
  formula: string | null;
  mnemonic: string | null;
  relatedTerms: string[];
  status: ContentStatus;
  createdAt: Date;
  updatedAt: Date;
}

function toGlossaryRow(r: typeof glossaryEntries.$inferSelect): GlossaryEntryRow {
  return { ...r, relatedTerms: parseStringArray(r.relatedTerms) };
}

export async function listGlossaryEntries(db: Database, filters: ContentFilters = {}): Promise<GlossaryEntryRow[]> {
  const conditions: SQL[] = [];
  if (filters.status) conditions.push(eq(glossaryEntries.status, filters.status));
  if (filters.search) {
    const needle = `%${filters.search}%`;
    conditions.push(or(ilike(glossaryEntries.term, needle), ilike(glossaryEntries.definition, needle))!);
  }
  const rows = await db
    .select()
    .from(glossaryEntries)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(glossaryEntries.term);
  return rows.map(toGlossaryRow);
}

export async function getGlossaryEntry(db: Database, id: string): Promise<GlossaryEntryRow | null> {
  const [row] = await db.select().from(glossaryEntries).where(eq(glossaryEntries.id, id)).limit(1);
  return row ? toGlossaryRow(row) : null;
}

export interface GlossaryEntryInput {
  term: string;
  slug: string;
  definition: string;
  example: string;
  formula?: string;
  mnemonic?: string;
  relatedTerms: string[];
}

export async function createGlossaryEntry(
  db: Database,
  input: GlossaryEntryInput,
  status: ContentStatus,
  founderId: string
): Promise<GlossaryEntryRow> {
  const [row] = await db
    .insert(glossaryEntries)
    .values({
      id: input.slug,
      term: input.term,
      slug: input.slug,
      definition: input.definition,
      example: input.example,
      formula: input.formula ?? null,
      mnemonic: input.mnemonic ?? null,
      relatedTerms: JSON.stringify(input.relatedTerms),
      status,
      createdBy: founderId,
      updatedBy: founderId,
    })
    .returning();
  return toGlossaryRow(row);
}

export async function updateGlossaryEntry(
  db: Database,
  id: string,
  input: GlossaryEntryInput,
  founderId: string
): Promise<void> {
  await db
    .update(glossaryEntries)
    .set({
      term: input.term,
      definition: input.definition,
      example: input.example,
      formula: input.formula ?? null,
      mnemonic: input.mnemonic ?? null,
      relatedTerms: JSON.stringify(input.relatedTerms),
      updatedBy: founderId,
      updatedAt: new Date(),
    })
    .where(eq(glossaryEntries.id, id));
}

export async function setGlossaryEntryStatus(db: Database, id: string, status: ContentStatus, founderId: string): Promise<void> {
  await db.update(glossaryEntries).set({ status, updatedBy: founderId, updatedAt: new Date() }).where(eq(glossaryEntries.id, id));
}

// ---------- Formula library ----------

export interface FormulaEntryRow {
  id: string;
  name: string;
  category: string;
  expression: string;
  explanation: string;
  example: string;
  status: ContentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export async function listFormulaEntries(db: Database, filters: ContentFilters = {}): Promise<FormulaEntryRow[]> {
  const conditions: SQL[] = [];
  if (filters.status) conditions.push(eq(formulaEntries.status, filters.status));
  if (filters.search) {
    const needle = `%${filters.search}%`;
    conditions.push(or(ilike(formulaEntries.name, needle), ilike(formulaEntries.explanation, needle))!);
  }
  return db
    .select()
    .from(formulaEntries)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(formulaEntries.category, formulaEntries.name);
}

export async function getFormulaEntry(db: Database, id: string): Promise<FormulaEntryRow | null> {
  const [row] = await db.select().from(formulaEntries).where(eq(formulaEntries.id, id)).limit(1);
  return row ?? null;
}

export interface FormulaEntryInput {
  id: string;
  name: string;
  category: string;
  expression: string;
  explanation: string;
  example: string;
}

export async function createFormulaEntry(
  db: Database,
  input: FormulaEntryInput,
  status: ContentStatus,
  founderId: string
): Promise<FormulaEntryRow> {
  const [row] = await db
    .insert(formulaEntries)
    .values({ ...input, status, createdBy: founderId, updatedBy: founderId })
    .returning();
  return row;
}

export async function updateFormulaEntry(
  db: Database,
  id: string,
  input: Omit<FormulaEntryInput, "id">,
  founderId: string
): Promise<void> {
  await db
    .update(formulaEntries)
    .set({ ...input, updatedBy: founderId, updatedAt: new Date() })
    .where(eq(formulaEntries.id, id));
}

export async function setFormulaEntryStatus(db: Database, id: string, status: ContentStatus, founderId: string): Promise<void> {
  await db.update(formulaEntries).set({ status, updatedBy: founderId, updatedAt: new Date() }).where(eq(formulaEntries.id, id));
}

// ---------- Case studies ----------

export interface CaseStudyEntryRow {
  id: string;
  company: string;
  category: string;
  industry: string;
  factType: string;
  problem: string;
  solution: string;
  customer: string;
  businessModel: string;
  revenueModel: string;
  growth: string;
  competition: string;
  challenges: string;
  lessons: string[];
  status: ContentStatus;
  createdAt: Date;
  updatedAt: Date;
}

function toCaseStudyRow(r: typeof caseStudyEntries.$inferSelect): CaseStudyEntryRow {
  return { ...r, lessons: parseStringArray(r.lessons) };
}

export async function listCaseStudyEntries(db: Database, filters: ContentFilters = {}): Promise<CaseStudyEntryRow[]> {
  const conditions: SQL[] = [];
  if (filters.status) conditions.push(eq(caseStudyEntries.status, filters.status));
  if (filters.search) {
    const needle = `%${filters.search}%`;
    conditions.push(or(ilike(caseStudyEntries.company, needle), ilike(caseStudyEntries.industry, needle))!);
  }
  const rows = await db
    .select()
    .from(caseStudyEntries)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(caseStudyEntries.company);
  return rows.map(toCaseStudyRow);
}

export async function getCaseStudyEntry(db: Database, id: string): Promise<CaseStudyEntryRow | null> {
  const [row] = await db.select().from(caseStudyEntries).where(eq(caseStudyEntries.id, id)).limit(1);
  return row ? toCaseStudyRow(row) : null;
}

export interface CaseStudyEntryInput {
  id: string;
  company: string;
  category: string;
  industry: string;
  factType: string;
  problem: string;
  solution: string;
  customer: string;
  businessModel: string;
  revenueModel: string;
  growth: string;
  competition: string;
  challenges: string;
  lessons: string[];
}

export async function createCaseStudyEntry(
  db: Database,
  input: CaseStudyEntryInput,
  status: ContentStatus,
  founderId: string
): Promise<CaseStudyEntryRow> {
  const [row] = await db
    .insert(caseStudyEntries)
    .values({ ...input, lessons: JSON.stringify(input.lessons), status, createdBy: founderId, updatedBy: founderId })
    .returning();
  return toCaseStudyRow(row);
}

export async function updateCaseStudyEntry(
  db: Database,
  id: string,
  input: Omit<CaseStudyEntryInput, "id">,
  founderId: string
): Promise<void> {
  await db
    .update(caseStudyEntries)
    .set({ ...input, lessons: JSON.stringify(input.lessons), updatedBy: founderId, updatedAt: new Date() })
    .where(eq(caseStudyEntries.id, id));
}

export async function setCaseStudyEntryStatus(db: Database, id: string, status: ContentStatus, founderId: string): Promise<void> {
  await db.update(caseStudyEntries).set({ status, updatedBy: founderId, updatedAt: new Date() }).where(eq(caseStudyEntries.id, id));
}
