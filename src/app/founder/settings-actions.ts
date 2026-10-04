"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { requireFounderForApi } from "@/lib/auth/dal";
import { recordAuditLog } from "@/lib/db/audit-log";
import { updateProductSettings, updatePhaseOverride } from "@/lib/db/settings-queries";

export type FormState = { error?: string; fieldErrors?: Record<string, string[]>; success?: string } | undefined;

async function requireFounder(): Promise<{ founderId: string } | { ok: false; error: string }> {
  const founder = await requireFounderForApi();
  if (!founder) return { ok: false, error: "Not authorized." };
  return { founderId: founder.user.id };
}

const settingsSchema = z.object({
  productName: z.string().trim().min(2, "Product name must be at least 2 characters.").max(100),
  productDescription: z.string().trim().max(500),
  logoUrl: z.string().trim().max(500).optional().or(z.literal("")),
  defaultTrialDays: z.coerce.number().int().min(0, "Must be 0 or more.").max(365, "Must be 365 or fewer."),
  defaultNewUserAccess: z.enum(["trial", "active"]),
  defaultContentStatus: z.enum(["draft", "published", "archived"]),
});

/** Founder-only, server-validated. Never reads or exposes DATABASE_URL, session secrets, or any
 * payment credential - this form has no field that could even carry one (see
 * docs/PHASE-5.3.md "Global product settings"). Changing defaultTrialDays never touches existing
 * users - see src/lib/db/settings-queries.ts. */
export async function updateSettingsAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const auth = await requireFounder();
  if ("error" in auth) return { error: auth.error };

  const parsed = settingsSchema.safeParse({
    productName: formData.get("productName"),
    productDescription: formData.get("productDescription"),
    logoUrl: formData.get("logoUrl"),
    defaultTrialDays: formData.get("defaultTrialDays"),
    defaultNewUserAccess: formData.get("defaultNewUserAccess"),
    defaultContentStatus: formData.get("defaultContentStatus"),
  });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const db = getDb();
  await updateProductSettings(
    db,
    { ...parsed.data, logoUrl: parsed.data.logoUrl || null },
    auth.founderId
  );
  await recordAuditLog(db, { founderId: auth.founderId, action: "SETTINGS_UPDATED", entityType: "settings", entityId: "singleton" });
  revalidatePath("/founder/settings");
  return { success: "Settings saved." };
}

const phaseSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(100),
  description: z.string().trim().min(5, "Description must be at least 5 characters.").max(500),
});

/** Phase name/description only - day ranges (which days belong to which phase) are never
 * editable from here, since that is the canonical lesson identity every progress table depends
 * on (docs/PHASE-5.3.md "Curriculum CMS": "Never change the identity of an existing lesson"). */
export async function updatePhaseAction(phaseNumber: number, _prev: FormState, formData: FormData): Promise<FormState> {
  const auth = await requireFounder();
  if ("error" in auth) return { error: auth.error };

  const parsed = phaseSchema.safeParse({ name: formData.get("name"), description: formData.get("description") });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const db = getDb();
  await updatePhaseOverride(db, phaseNumber, parsed.data, auth.founderId);
  await recordAuditLog(db, { founderId: auth.founderId, action: "SETTINGS_UPDATED", entityType: "phase", entityId: String(phaseNumber) });
  revalidatePath("/founder/curriculum");
  return { success: "Phase saved." };
}
