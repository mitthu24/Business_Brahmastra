"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { requireFounderForApi } from "@/lib/auth/dal";
import { recordAuditLog } from "@/lib/db/audit-log";
import {
  createAchievementEntry,
  updateAchievementEntry,
  setAchievementEntryStatus,
  getAchievementEntry,
} from "@/lib/db/achievement-queries";
import { achievements as trustedAchievements } from "@/lib/progress/achievements";
import type { ContentStatus } from "@/lib/db/content-queries";

export type FormState = { error?: string; fieldErrors?: Record<string, string[]>; success?: string } | undefined;
type ActionResult = { ok: true } | { ok: false; error: string };

/** Every achievement mutation calls this first. Unlock REQUIREMENTS are never editable here - see
 * docs/PHASE-5.3.md "Achievement CMS": this file only ever touches display metadata for an id the
 * trusted engine (src/lib/progress/achievements.ts) already knows about. */
async function requireFounder(): Promise<{ founderId: string } | { ok: false; error: string }> {
  const founder = await requireFounderForApi();
  if (!founder) return { ok: false, error: "Not authorized." };
  return { founderId: founder.user.id };
}

const achievementSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  description: z.string().trim().min(5, "Description must be at least 5 characters."),
  icon: z.string().trim().min(2, "Icon name is required."),
  category: z.string().trim().min(2, "Category is required."),
  xp: z.coerce.number().int().min(0).max(10000),
});

/** `id` is never free text in the create form - it's a <select> constrained to the trusted
 * engine's own achievement ids (src/lib/progress/achievements.ts), so a row can never be created
 * for an id with no real unlock logic behind it, which would display but never actually unlock. */
export async function createAchievementEntryAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const auth = await requireFounder();
  if ("error" in auth) return { error: auth.error };

  const id = formData.get("id");
  if (typeof id !== "string" || !trustedAchievements.some((a) => a.id === id)) {
    return { fieldErrors: { id: ["Choose one of the engine's known achievement ids."] } };
  }

  const db = getDb();
  if (await getAchievementEntry(db, id)) {
    return { fieldErrors: { id: ["This achievement is already in the CMS."] } };
  }

  const parsed = achievementSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    icon: formData.get("icon"),
    category: formData.get("category"),
    xp: formData.get("xp"),
  });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const status: ContentStatus = formData.get("intent") === "publish" ? "published" : "draft";
  const entry = await createAchievementEntry(db, id, parsed.data, status, auth.founderId);

  await recordAuditLog(db, { founderId: auth.founderId, action: "CONTENT_CREATED", entityType: "achievement", entityId: entry.id, metadata: { status } });
  revalidatePath("/founder/achievements");
  redirect(`/founder/achievements/${entry.id}`);
}

export async function updateAchievementEntryAction(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const auth = await requireFounder();
  if ("error" in auth) return { error: auth.error };

  const db = getDb();
  const existing = await getAchievementEntry(db, id);
  if (!existing) return { error: "Achievement not found." };

  const parsed = achievementSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    icon: formData.get("icon"),
    category: formData.get("category"),
    xp: formData.get("xp"),
  });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  await updateAchievementEntry(db, id, parsed.data, auth.founderId);
  await recordAuditLog(db, { founderId: auth.founderId, action: "CONTENT_UPDATED", entityType: "achievement", entityId: id });
  revalidatePath("/founder/achievements");
  revalidatePath(`/founder/achievements/${id}`);
  revalidatePath("/achievements");
  return { success: "Saved." };
}

export async function setAchievementStatusAction(id: string, status: ContentStatus): Promise<ActionResult> {
  const auth = await requireFounder();
  if ("error" in auth) return auth;
  const db = getDb();
  if (!(await getAchievementEntry(db, id))) return { ok: false, error: "Achievement not found." };

  await setAchievementEntryStatus(db, id, status, auth.founderId);
  await recordAuditLog(db, {
    founderId: auth.founderId,
    action: status === "published" ? "CONTENT_PUBLISHED" : status === "archived" ? "CONTENT_ARCHIVED" : "CONTENT_UNPUBLISHED",
    entityType: "achievement",
    entityId: id,
  });
  revalidatePath("/founder/achievements");
  revalidatePath(`/founder/achievements/${id}`);
  revalidatePath("/achievements");
  return { ok: true };
}
