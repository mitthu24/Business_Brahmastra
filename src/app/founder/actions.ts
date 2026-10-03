"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db/client";
import { findUserByEmail, createUser } from "@/lib/db/auth-queries";
import {
  activateUserAccess,
  suspendUser,
  reactivateUser,
  extendTrial,
  resetUserPasswordByFounder,
  updateUserProfileByFounder,
} from "@/lib/db/founder-queries";
import { recordAuditLog } from "@/lib/db/audit-log";
import { isUniqueViolation } from "@/lib/db/errors";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { createSessionCookie, clearSessionCookie } from "@/lib/auth/session";
import { loginSchema, emailSchema, passwordSchema } from "@/lib/auth/validation";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { requireFounderForApi } from "@/lib/auth/dal";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { users } from "@/lib/db/schema";

export type FormState = { error?: string; fieldErrors?: Record<string, string[]>; success?: string } | undefined;

/**
 * Deliberately separate from src/app/(auth)/actions.ts#login (docs/PHASE-5.md "Founder
 * authentication"): same password verification and session-issuing mechanism (no second auth
 * system), but it additionally requires role === "founder" read fresh from the DB, and rejects
 * with the exact same generic error whether the email doesn't exist, the password is wrong, or
 * the account simply isn't a founder - so this endpoint can't be used to enumerate founder emails.
 */
export async function founderLogin(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for") ?? "unknown";
  const rate = checkRateLimit(`founder-login:${ip}:${parsed.data.email}`);
  if (!rate.allowed) {
    return { error: "Too many attempts. Please try again in a few minutes." };
  }

  const db = getDb();
  const user = await findUserByEmail(db, parsed.data.email);
  const genericError = "Incorrect email or password.";
  if (!user) return { error: genericError };

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) return { error: genericError };

  if (user.role !== "founder") return { error: genericError };

  await createSessionCookie(user.id);
  redirect("/founder/dashboard");
}

export async function founderLogout(): Promise<void> {
  await clearSessionCookie();
  redirect("/founder/login");
}

type ActionResult = { ok: true } | { ok: false; error: string };

/** Every founder mutation in this file calls this first. Role is read fresh from the DB on every
 * call (never from a cookie, header, or client-supplied value) - see docs/PHASE-5.3.md "Security". */
async function requireFounder(): Promise<{ founderId: string } | { ok: false; error: string }> {
  const founder = await requireFounderForApi();
  if (!founder) return { ok: false, error: "Not authorized." };
  return { founderId: founder.user.id };
}

function revalidateUserPages(userId?: string) {
  revalidatePath("/founder/users");
  revalidatePath("/founder/dashboard");
  if (userId) revalidatePath(`/founder/users/${userId}`);
}

export async function activateUserAction(userId: string): Promise<ActionResult> {
  const auth = await requireFounder();
  if ("error" in auth) return auth;
  await activateUserAccess(getDb(), userId);
  await recordAuditLog(getDb(), { founderId: auth.founderId, action: "ACCESS_GRANTED", entityType: "user", entityId: userId });
  revalidateUserPages(userId);
  return { ok: true };
}

export async function suspendUserAction(userId: string): Promise<ActionResult> {
  const auth = await requireFounder();
  if ("error" in auth) return auth;
  await suspendUser(getDb(), userId);
  await recordAuditLog(getDb(), { founderId: auth.founderId, action: "USER_SUSPENDED", entityType: "user", entityId: userId });
  revalidateUserPages(userId);
  return { ok: true };
}

export async function reactivateUserAction(userId: string): Promise<ActionResult> {
  const auth = await requireFounder();
  if ("error" in auth) return auth;
  await reactivateUser(getDb(), userId);
  await recordAuditLog(getDb(), { founderId: auth.founderId, action: "USER_REACTIVATED", entityType: "user", entityId: userId });
  revalidateUserPages(userId);
  return { ok: true };
}

export async function extendTrialAction(userId: string, days: number): Promise<ActionResult> {
  const auth = await requireFounder();
  if ("error" in auth) return auth;
  if (!Number.isInteger(days) || days <= 0 || days > 365) {
    return { ok: false, error: "Enter a number of days between 1 and 365." };
  }
  const db = getDb();
  const rows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const current = rows[0];
  if (!current) return { ok: false, error: "User not found." };
  const base = current.trialEndsAt.getTime() > Date.now() ? current.trialEndsAt.getTime() : Date.now();
  const newTrialEndsAt = new Date(base + days * 24 * 60 * 60 * 1000);
  await extendTrial(db, userId, newTrialEndsAt);
  await recordAuditLog(db, { founderId: auth.founderId, action: "TRIAL_EXTENDED", entityType: "user", entityId: userId, metadata: { days, newTrialEndsAt: newTrialEndsAt.toISOString() } });
  revalidateUserPages(userId);
  return { ok: true };
}

const createUserSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters."),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    role: z.enum(["user", "founder"]).default("user"),
    confirmFounder: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, { message: "Passwords do not match.", path: ["confirmPassword"] })
  .refine((data) => data.role !== "founder" || data.confirmFounder === "on", {
    message: "Check the confirmation box to create another founder account.",
    path: ["confirmFounder"],
  });

/** Founder-initiated account creation (docs/PHASE-5.3.md "User management"). Defaults to role
 * "user"; creating another founder requires an explicit confirmation checkbox so it can never
 * happen by an accidental form submission. Reuses the exact same createUser/hashPassword path as
 * self-service signup - no parallel account-creation system. */
export async function createUserAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const auth = await requireFounder();
  if ("error" in auth) return { error: auth.error };

  const parsed = createUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    role: formData.get("role") || "user",
    confirmFounder: formData.get("confirmFounder"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const db = getDb();
  const existing = await findUserByEmail(db, parsed.data.email);
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  let user;
  try {
    user = await createUser(db, { email: parsed.data.email, passwordHash, name: parsed.data.name, role: parsed.data.role });
  } catch (err) {
    if (isUniqueViolation(err)) return { error: "An account with this email already exists." };
    throw err;
  }

  await recordAuditLog(db, {
    founderId: auth.founderId,
    action: "USER_CREATED",
    entityType: "user",
    entityId: user.id,
    metadata: { email: user.email, role: parsed.data.role },
  });
  revalidateUserPages();
  redirect(`/founder/users/${user.id}`);
}

export async function resetPasswordAction(userId: string, newPassword: string): Promise<ActionResult> {
  const auth = await requireFounder();
  if ("error" in auth) return auth;
  const parsed = passwordSchema.safeParse(newPassword);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid password." };

  const passwordHash = await hashPassword(newPassword);
  await resetUserPasswordByFounder(getDb(), userId, passwordHash);
  await recordAuditLog(getDb(), { founderId: auth.founderId, action: "PASSWORD_RESET", entityType: "user", entityId: userId });
  revalidateUserPages(userId);
  return { ok: true };
}

export async function updateUserProfileAction(
  userId: string,
  updates: { name?: string; email?: string }
): Promise<ActionResult> {
  const auth = await requireFounder();
  if ("error" in auth) return auth;

  if (updates.email) {
    const parsedEmail = emailSchema.safeParse(updates.email);
    if (!parsedEmail.success) return { ok: false, error: "Invalid email address." };
    updates.email = parsedEmail.data;
  }
  if (updates.name !== undefined && updates.name.trim().length < 2) {
    return { ok: false, error: "Name must be at least 2 characters." };
  }

  try {
    await updateUserProfileByFounder(getDb(), userId, updates);
  } catch (err) {
    if (isUniqueViolation(err)) return { ok: false, error: "An account with this email already exists." };
    throw err;
  }
  await recordAuditLog(getDb(), { founderId: auth.founderId, action: "USER_UPDATED", entityType: "user", entityId: userId, metadata: updates });
  revalidateUserPages(userId);
  return { ok: true };
}
