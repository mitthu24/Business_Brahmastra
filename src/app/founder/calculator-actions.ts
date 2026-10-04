"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { requireFounderForApi } from "@/lib/auth/dal";
import { recordAuditLog } from "@/lib/db/audit-log";
import { getCalculatorEntry, updateCalculatorEntry, setCalculatorEntryStatus } from "@/lib/db/calculator-queries";
import type { ContentStatus } from "@/lib/db/content-queries";

export type FormState = { error?: string; fieldErrors?: Record<string, string[]>; success?: string } | undefined;
type ActionResult = { ok: true } | { ok: false; error: string };

/** The calculator engine (src/lib/calculators.ts) and its 12 React forms are trusted application
 * code, untouched by this file - see docs/PHASE-5.3.md "Calculator CMS". This only ever edits
 * directory metadata for an existing calculator slug; there is no create, since a new calculator
 * needs real compute code, not data. */
async function requireFounder(): Promise<{ founderId: string } | { ok: false; error: string }> {
  const founder = await requireFounderForApi();
  if (!founder) return { ok: false, error: "Not authorized." };
  return { founderId: founder.user.id };
}

const calculatorSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters."),
  description: z.string().trim().min(5, "Description must be at least 5 characters."),
  category: z.string().trim().min(2, "Category is required."),
  helpText: z.string().trim().optional(),
  ordering: z.coerce.number().int().min(0).max(1000),
});

export async function updateCalculatorEntryAction(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const auth = await requireFounder();
  if ("error" in auth) return { error: auth.error };

  const db = getDb();
  if (!(await getCalculatorEntry(db, id))) return { error: "Calculator not found." };

  const parsed = calculatorSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    helpText: formData.get("helpText") || undefined,
    ordering: formData.get("ordering"),
  });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  await updateCalculatorEntry(db, id, parsed.data, auth.founderId);
  await recordAuditLog(db, { founderId: auth.founderId, action: "CONTENT_UPDATED", entityType: "calculator", entityId: id });
  revalidatePath("/founder/calculators");
  revalidatePath(`/founder/calculators/${id}`);
  revalidatePath("/calculators");
  return { success: "Saved." };
}

export async function setCalculatorStatusAction(id: string, status: ContentStatus): Promise<ActionResult> {
  const auth = await requireFounder();
  if ("error" in auth) return auth;
  const db = getDb();
  if (!(await getCalculatorEntry(db, id))) return { ok: false, error: "Calculator not found." };

  await setCalculatorEntryStatus(db, id, status, auth.founderId);
  await recordAuditLog(db, {
    founderId: auth.founderId,
    action: status === "published" ? "CONTENT_PUBLISHED" : status === "archived" ? "CONTENT_ARCHIVED" : "CONTENT_UNPUBLISHED",
    entityType: "calculator",
    entityId: id,
  });
  revalidatePath("/founder/calculators");
  revalidatePath(`/founder/calculators/${id}`);
  revalidatePath("/calculators");
  return { ok: true };
}
