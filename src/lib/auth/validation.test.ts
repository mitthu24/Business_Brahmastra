import { describe, it, expect } from "vitest";
import { signupSchema, loginSchema, emailSchema } from "./validation";

describe("emailSchema normalization", () => {
  it("trims and lowercases so User@Email.com and user@email.com are the same identity", () => {
    expect(emailSchema.parse("  User@Email.com  ")).toBe("user@email.com");
  });

  it("rejects an invalid email format", () => {
    expect(emailSchema.safeParse("not-an-email").success).toBe(false);
  });
});

describe("signupSchema", () => {
  const valid = { name: "Jane Doe", email: "jane@example.com", password: "password123", confirmPassword: "password123" };

  it("accepts valid input", () => {
    expect(signupSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an empty name", () => {
    const result = signupSchema.safeParse({ ...valid, name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a password under the minimum length", () => {
    const result = signupSchema.safeParse({ ...valid, password: "short1", confirmPassword: "short1" });
    expect(result.success).toBe(false);
  });

  it("rejects a mismatched confirmation password", () => {
    const result = signupSchema.safeParse({ ...valid, confirmPassword: "different123" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.confirmPassword).toBeTruthy();
    }
  });

  it("normalizes the email the same way emailSchema does", () => {
    const result = signupSchema.safeParse({ ...valid, email: "  Jane@Example.com  " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("jane@example.com");
  });
});

describe("loginSchema", () => {
  it("requires a non-empty password but does not enforce the signup minimum length", () => {
    expect(loginSchema.safeParse({ email: "a@example.com", password: "x" }).success).toBe(true);
    expect(loginSchema.safeParse({ email: "a@example.com", password: "" }).success).toBe(false);
  });
});
