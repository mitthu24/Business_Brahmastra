"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getDb } from "@/lib/db/client";
import {
  findUserByEmail,
  createUser,
  updateUserPassword,
  createPasswordResetToken,
  consumePasswordResetToken,
  findUserById,
  deleteAllSessionsForUser,
} from "@/lib/db/auth-queries";
import { isUniqueViolation } from "@/lib/db/errors";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSessionCookie, clearSessionCookie } from "@/lib/auth/session";
import { signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } from "@/lib/auth/validation";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { sanitizeNextPath } from "@/lib/auth/safe-redirect";
import { requireUserForApi } from "@/lib/auth/dal";

export type FormState = { error?: string; fieldErrors?: Record<string, string[]>; success?: string } | undefined;

async function clientKey(prefix: string) {
  const h = await headers();
  const ip = h.get("x-forwarded-for") ?? "unknown";
  return `${prefix}:${ip}`;
}

const DUPLICATE_EMAIL_ERROR = "An account with this email already exists.";

export async function signup(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  // Keyed by normalized email (not IP) so repeated signup attempts against one address are
  // limited regardless of source, matching the same pattern already used for login/forgot-password
  // - see docs/PHASE-5.2.md "Rate limiting".
  const rate = checkRateLimit(`signup:${parsed.data.email}`);
  if (!rate.allowed) {
    return { error: "Too many attempts. Please try again in a few minutes." };
  }

  const db = getDb();
  const existing = await findUserByEmail(db, parsed.data.email);
  if (existing) {
    return { error: DUPLICATE_EMAIL_ERROR };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  let user;
  try {
    user = await createUser(db, { email: parsed.data.email, passwordHash, name: parsed.data.name });
  } catch (err) {
    // The findUserByEmail check above is an optimization, not the real guarantee - two concurrent
    // signups for the same email can both pass it before either INSERT commits. The DB's own
    // unique index (users_email_unique) is the actual source of truth and rejects the second
    // insert; we surface that as the same generic duplicate-email message, never a raw DB error.
    if (isUniqueViolation(err)) {
      return { error: DUPLICATE_EMAIL_ERROR };
    }
    throw err;
  }
  await createSessionCookie(user.id);
  redirect("/dashboard");
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const key = await clientKey(`login:${parsed.data.email}`);
  const rate = checkRateLimit(key);
  if (!rate.allowed) {
    return { error: "Too many attempts. Please try again in a few minutes." };
  }

  const db = getDb();
  const user = await findUserByEmail(db, parsed.data.email);
  // Same generic message whether the account doesn't exist or the password is wrong, so a caller
  // can't use the error text to enumerate registered emails.
  const genericError = "Incorrect email or password.";
  if (!user) return { error: genericError };

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) return { error: genericError };

  await createSessionCookie(user.id);
  // src/proxy.ts sets ?next=<original path> when it redirects an unauthenticated visitor here -
  // honor it so they land back where they were headed, but only ever a validated, same-app
  // relative path (see src/lib/auth/safe-redirect.ts). Never trust this enough to redirect
  // off-site - docs/PHASE-5.2.md "Login redirect".
  const next = sanitizeNextPath(formData.get("next"));
  redirect(next ?? "/dashboard");
}

export async function logout(): Promise<void> {
  await clearSessionCookie();
  redirect("/login");
}

export async function forgotPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const key = await clientKey(`forgot:${parsed.data.email}`);
  const rate = checkRateLimit(key);
  if (!rate.allowed) {
    return { error: "Too many attempts. Please try again in a few minutes." };
  }

  const db = getDb();
  const user = await findUserByEmail(db, parsed.data.email);
  // Always return the same success message, whether or not the account exists, so this endpoint
  // cannot be used to enumerate registered emails.
  if (user) {
    const token = await createPasswordResetToken(db, user.id);
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/reset-password/${token}`;
    // No email provider is configured in this phase (see docs/PHASE-4.md) - the reset link is
    // logged server-side only, and is never returned to the client response.
    console.log(`[password reset] ${user.email}: ${resetUrl}`);
  }
  return { success: "If an account exists for that email, a reset link has been sent." };
}

export async function resetPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const db = getDb();
  const userId = await consumePasswordResetToken(db, parsed.data.token);
  if (!userId) {
    return { error: "This reset link is invalid or has expired. Please request a new one." };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await updateUserPassword(db, userId, passwordHash);
  await createSessionCookie(userId);
  redirect("/dashboard");
}

export async function changePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requireUserForApi();
  if (!session) return { error: "You must be signed in." };

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const db = getDb();
  const user = await findUserById(db, session.userId);
  if (!user) return { error: "You must be signed in." };

  const valid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
  if (!valid) return { error: "Current password is incorrect." };

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await updateUserPassword(db, session.userId, passwordHash);
  // Revoke every session (including this one) then issue a fresh one for the current browser, so
  // a session token leaked elsewhere stops working the instant the password changes.
  await deleteAllSessionsForUser(db, session.userId);
  await createSessionCookie(session.userId);
  return { success: "Password updated. You've been signed out of other devices." };
}
