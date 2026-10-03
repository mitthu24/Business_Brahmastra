"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { requireFounderForApi } from "@/lib/auth/dal";
import { recordAuditLog } from "@/lib/db/audit-log";
import {
  createGlossaryEntry,
  updateGlossaryEntry,
  setGlossaryEntryStatus,
  getGlossaryEntry,
  createFormulaEntry,
  updateFormulaEntry,
  setFormulaEntryStatus,
  getFormulaEntry,
  createCaseStudyEntry,
  updateCaseStudyEntry,
  setCaseStudyEntryStatus,
  getCaseStudyEntry,
  type ContentStatus,
} from "@/lib/db/content-queries";
import { isUniqueViolation } from "@/lib/db/errors";
import { FORMULA_CATEGORIES as formulaCategories, CASE_STUDY_CATEGORIES as caseStudyCategories } from "@/lib/content/cms-categories";

export type FormState = { error?: string; fieldErrors?: Record<string, string[]>; success?: string } | undefined;
type ActionResult = { ok: true } | { ok: false; error: string };

/** Every content mutation in this file calls this first - role read fresh from the DB on every
 * call, never trusted from the client (docs/PHASE-5.3.md "Reference content CMS" > "Security"). */
async function requireFounder(): Promise<{ founderId: string } | { ok: false; error: string }> {
  const founder = await requireFounderForApi();
  if (!founder) return { ok: false, error: "Not authorized." };
  return { founderId: founder.user.id };
}

function parseRelatedList(raw: FormDataEntryValue | null): string[] {
  if (typeof raw !== "string") return [];
  return raw
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const slugSchema = z
  .string()
  .trim()
  .min(2, "Must be at least 2 characters.")
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only.");

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ---------- Glossary ----------

const glossarySchema = z.object({
  term: z.string().trim().min(2, "Term must be at least 2 characters."),
  slug: slugSchema,
  definition: z.string().trim().min(10, "Definition must be at least 10 characters."),
  example: z.string().trim().min(5, "Example must be at least 5 characters."),
  formula: z.string().trim().optional(),
  mnemonic: z.string().trim().optional(),
});

export async function createGlossaryEntryAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const auth = await requireFounder();
  if ("error" in auth) return { error: auth.error };

  const termRaw = formData.get("term");
  const slugRaw = formData.get("slug");
  const parsed = glossarySchema.safeParse({
    term: termRaw,
    slug: typeof slugRaw === "string" && slugRaw.trim() ? slugRaw : slugify(typeof termRaw === "string" ? termRaw : ""),
    definition: formData.get("definition"),
    example: formData.get("example"),
    formula: formData.get("formula") || undefined,
    mnemonic: formData.get("mnemonic") || undefined,
  });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const status: ContentStatus = formData.get("intent") === "publish" ? "published" : "draft";
  const db = getDb();
  if (await getGlossaryEntry(db, parsed.data.slug)) {
    return { fieldErrors: { slug: ["A glossary entry with this slug already exists."] } };
  }

  let entry;
  try {
    entry = await createGlossaryEntry(db, { ...parsed.data, relatedTerms: parseRelatedList(formData.get("relatedTerms")) }, status, auth.founderId);
  } catch (err) {
    if (isUniqueViolation(err)) return { fieldErrors: { slug: ["A glossary entry with this slug already exists."] } };
    throw err;
  }

  await recordAuditLog(db, {
    founderId: auth.founderId,
    action: "CONTENT_CREATED",
    entityType: "glossary_entry",
    entityId: entry.id,
    metadata: { term: entry.term, status },
  });
  revalidatePath("/founder/glossary");
  redirect(`/founder/glossary/${entry.id}`);
}

export async function updateGlossaryEntryAction(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const auth = await requireFounder();
  if ("error" in auth) return { error: auth.error };

  const parsed = glossarySchema.omit({ slug: true }).safeParse({
    term: formData.get("term"),
    definition: formData.get("definition"),
    example: formData.get("example"),
    formula: formData.get("formula") || undefined,
    mnemonic: formData.get("mnemonic") || undefined,
  });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const db = getDb();
  const existing = await getGlossaryEntry(db, id);
  if (!existing) return { error: "Glossary entry not found." };

  await updateGlossaryEntry(db, id, { ...parsed.data, slug: existing.slug, relatedTerms: parseRelatedList(formData.get("relatedTerms")) }, auth.founderId);
  await recordAuditLog(db, { founderId: auth.founderId, action: "CONTENT_UPDATED", entityType: "glossary_entry", entityId: id });
  revalidatePath("/founder/glossary");
  revalidatePath(`/founder/glossary/${id}`);
  return { success: "Saved." };
}

export async function setGlossaryStatusAction(id: string, status: ContentStatus): Promise<ActionResult> {
  const auth = await requireFounder();
  if ("error" in auth) return auth;
  await setGlossaryEntryStatus(getDb(), id, status, auth.founderId);
  await recordAuditLog(getDb(), {
    founderId: auth.founderId,
    action: status === "published" ? "CONTENT_PUBLISHED" : status === "archived" ? "CONTENT_ARCHIVED" : "CONTENT_UNPUBLISHED",
    entityType: "glossary_entry",
    entityId: id,
  });
  revalidatePath("/founder/glossary");
  revalidatePath(`/founder/glossary/${id}`);
  return { ok: true };
}

// ---------- Formula library ----------

const formulaSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  category: z.enum(formulaCategories),
  expression: z.string().trim().min(3, "Expression must be at least 3 characters."),
  explanation: z.string().trim().min(10, "Explanation must be at least 10 characters."),
  example: z.string().trim().min(5, "Example must be at least 5 characters."),
});

export async function createFormulaEntryAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const auth = await requireFounder();
  if ("error" in auth) return { error: auth.error };

  const idRaw = formData.get("id");
  const nameRaw = formData.get("name");
  const id = typeof idRaw === "string" && idRaw.trim() ? slugify(idRaw) : slugify(typeof nameRaw === "string" ? nameRaw : "");
  const idCheck = slugSchema.safeParse(id);
  if (!idCheck.success) return { fieldErrors: { id: ["Enter a valid id, or a name to derive one from."] } };

  const parsed = formulaSchema.safeParse({
    name: nameRaw,
    category: formData.get("category"),
    expression: formData.get("expression"),
    explanation: formData.get("explanation"),
    example: formData.get("example"),
  });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const status: ContentStatus = formData.get("intent") === "publish" ? "published" : "draft";
  const db = getDb();
  if (await getFormulaEntry(db, id)) return { fieldErrors: { id: ["A formula with this id already exists."] } };

  let entry;
  try {
    entry = await createFormulaEntry(db, { id, ...parsed.data }, status, auth.founderId);
  } catch (err) {
    if (isUniqueViolation(err)) return { fieldErrors: { id: ["A formula with this id already exists."] } };
    throw err;
  }

  await recordAuditLog(db, { founderId: auth.founderId, action: "CONTENT_CREATED", entityType: "formula_entry", entityId: entry.id, metadata: { name: entry.name, status } });
  revalidatePath("/founder/formulas");
  redirect(`/founder/formulas/${entry.id}`);
}

export async function updateFormulaEntryAction(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const auth = await requireFounder();
  if ("error" in auth) return { error: auth.error };

  const parsed = formulaSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    expression: formData.get("expression"),
    explanation: formData.get("explanation"),
    example: formData.get("example"),
  });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const db = getDb();
  const existing = await getFormulaEntry(db, id);
  if (!existing) return { error: "Formula not found." };

  await updateFormulaEntry(db, id, parsed.data, auth.founderId);
  await recordAuditLog(db, { founderId: auth.founderId, action: "CONTENT_UPDATED", entityType: "formula_entry", entityId: id });
  revalidatePath("/founder/formulas");
  revalidatePath(`/founder/formulas/${id}`);
  return { success: "Saved." };
}

export async function setFormulaStatusAction(id: string, status: ContentStatus): Promise<ActionResult> {
  const auth = await requireFounder();
  if ("error" in auth) return auth;
  await setFormulaEntryStatus(getDb(), id, status, auth.founderId);
  await recordAuditLog(getDb(), {
    founderId: auth.founderId,
    action: status === "published" ? "CONTENT_PUBLISHED" : status === "archived" ? "CONTENT_ARCHIVED" : "CONTENT_UNPUBLISHED",
    entityType: "formula_entry",
    entityId: id,
  });
  revalidatePath("/founder/formulas");
  revalidatePath(`/founder/formulas/${id}`);
  return { ok: true };
}

// ---------- Case studies ----------

const caseStudySchema = z.object({
  company: z.string().trim().min(2, "Company must be at least 2 characters."),
  category: z.enum(caseStudyCategories),
  industry: z.string().trim().min(2, "Industry must be at least 2 characters."),
  factType: z.enum(["documented", "illustrative"]),
  problem: z.string().trim().min(10, "Problem must be at least 10 characters."),
  solution: z.string().trim().min(10, "Solution must be at least 10 characters."),
  customer: z.string().trim().min(5, "Customer must be at least 5 characters."),
  businessModel: z.string().trim().min(5, "Business model must be at least 5 characters."),
  revenueModel: z.string().trim().min(5, "Revenue model must be at least 5 characters."),
  growth: z.string().trim().min(5, "Growth must be at least 5 characters."),
  competition: z.string().trim().min(5, "Competition must be at least 5 characters."),
  challenges: z.string().trim().min(5, "Challenges must be at least 5 characters."),
});

export async function createCaseStudyEntryAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const auth = await requireFounder();
  if ("error" in auth) return { error: auth.error };

  const idRaw = formData.get("id");
  const companyRaw = formData.get("company");
  const id = typeof idRaw === "string" && idRaw.trim() ? slugify(idRaw) : slugify(typeof companyRaw === "string" ? companyRaw : "");
  const idCheck = slugSchema.safeParse(id);
  if (!idCheck.success) return { fieldErrors: { id: ["Enter a valid id, or a company name to derive one from."] } };

  const parsed = caseStudySchema.safeParse({
    company: companyRaw,
    category: formData.get("category"),
    industry: formData.get("industry"),
    factType: formData.get("factType"),
    problem: formData.get("problem"),
    solution: formData.get("solution"),
    customer: formData.get("customer"),
    businessModel: formData.get("businessModel"),
    revenueModel: formData.get("revenueModel"),
    growth: formData.get("growth"),
    competition: formData.get("competition"),
    challenges: formData.get("challenges"),
  });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const status: ContentStatus = formData.get("intent") === "publish" ? "published" : "draft";
  const db = getDb();
  if (await getCaseStudyEntry(db, id)) return { fieldErrors: { id: ["A case study with this id already exists."] } };

  let entry;
  try {
    entry = await createCaseStudyEntry(db, { id, ...parsed.data, lessons: parseRelatedList(formData.get("lessons")) }, status, auth.founderId);
  } catch (err) {
    if (isUniqueViolation(err)) return { fieldErrors: { id: ["A case study with this id already exists."] } };
    throw err;
  }

  await recordAuditLog(db, { founderId: auth.founderId, action: "CONTENT_CREATED", entityType: "case_study_entry", entityId: entry.id, metadata: { company: entry.company, status } });
  revalidatePath("/founder/case-studies");
  redirect(`/founder/case-studies/${entry.id}`);
}

export async function updateCaseStudyEntryAction(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const auth = await requireFounder();
  if ("error" in auth) return { error: auth.error };

  const parsed = caseStudySchema.safeParse({
    company: formData.get("company"),
    category: formData.get("category"),
    industry: formData.get("industry"),
    factType: formData.get("factType"),
    problem: formData.get("problem"),
    solution: formData.get("solution"),
    customer: formData.get("customer"),
    businessModel: formData.get("businessModel"),
    revenueModel: formData.get("revenueModel"),
    growth: formData.get("growth"),
    competition: formData.get("competition"),
    challenges: formData.get("challenges"),
  });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const db = getDb();
  const existing = await getCaseStudyEntry(db, id);
  if (!existing) return { error: "Case study not found." };

  await updateCaseStudyEntry(db, id, { ...parsed.data, lessons: parseRelatedList(formData.get("lessons")) }, auth.founderId);
  await recordAuditLog(db, { founderId: auth.founderId, action: "CONTENT_UPDATED", entityType: "case_study_entry", entityId: id });
  revalidatePath("/founder/case-studies");
  revalidatePath(`/founder/case-studies/${id}`);
  return { success: "Saved." };
}

export async function setCaseStudyStatusAction(id: string, status: ContentStatus): Promise<ActionResult> {
  const auth = await requireFounder();
  if ("error" in auth) return auth;
  await setCaseStudyEntryStatus(getDb(), id, status, auth.founderId);
  await recordAuditLog(getDb(), {
    founderId: auth.founderId,
    action: status === "published" ? "CONTENT_PUBLISHED" : status === "archived" ? "CONTENT_ARCHIVED" : "CONTENT_UNPUBLISHED",
    entityType: "case_study_entry",
    entityId: id,
  });
  revalidatePath("/founder/case-studies");
  revalidatePath(`/founder/case-studies/${id}`);
  return { ok: true };
}

