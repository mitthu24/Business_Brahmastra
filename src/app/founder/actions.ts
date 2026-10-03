"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getDb } from "@/lib/db/client";
import { findUserByEmail } from "@/lib/db/auth-queries";
import { activateUserAccess, suspendUser, reactivateUser } from "@/lib/db/founder-queries";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionCookie, clearSessionCookie } from "@/lib/auth/session";
import { loginSchema } from "@/lib/auth/validation";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { requireFounderForApi } from "@/lib/auth/dal";
import { revalidatePath } from "next/cache";

export type FormState = { error?: string; fieldErrors?: Record<string, string[]> } | undefined;

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

async function requireFounder(): Promise<ActionResult | null> {
  const founder = await requireFounderForApi();
  if (!founder) return { ok: false, error: "Not authorized." };
  return null;
}

export async function activateUserAction(userId: string): Promise<ActionResult> {
  const denied = await requireFounder();
  if (denied) return denied;
  await activateUserAccess(getDb(), userId);
  revalidatePath("/founder/users");
  revalidatePath("/founder/dashboard");
  return { ok: true };
}

export async function suspendUserAction(userId: string): Promise<ActionResult> {
  const denied = await requireFounder();
  if (denied) return denied;
  await suspendUser(getDb(), userId);
  revalidatePath("/founder/users");
  revalidatePath("/founder/dashboard");
  return { ok: true };
}

export async function reactivateUserAction(userId: string): Promise<ActionResult> {
  const denied = await requireFounder();
  if (denied) return denied;
  await reactivateUser(getDb(), userId);
  revalidatePath("/founder/users");
  revalidatePath("/founder/dashboard");
  return { ok: true };
}
