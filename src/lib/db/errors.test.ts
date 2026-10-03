import { describe, it, expect } from "vitest";
import { isUniqueViolation } from "./errors";

describe("isUniqueViolation", () => {
  it("detects a bare top-level code 23505", () => {
    expect(isUniqueViolation({ code: "23505" })).toBe(true);
  });

  it("detects code 23505 nested under .cause (Drizzle's DrizzleQueryError wrapping)", () => {
    expect(isUniqueViolation({ message: "query failed", cause: { code: "23505" } })).toBe(true);
  });

  it("returns false for an unrelated error code", () => {
    expect(isUniqueViolation({ code: "23502" })).toBe(false); // not_null_violation
    expect(isUniqueViolation({ cause: { code: "08006" } })).toBe(false); // connection_failure
  });

  it("returns false for a plain Error with no code", () => {
    expect(isUniqueViolation(new Error("boom"))).toBe(false);
  });

  it("returns false for non-object input", () => {
    expect(isUniqueViolation(null)).toBe(false);
    expect(isUniqueViolation(undefined)).toBe(false);
    expect(isUniqueViolation("string error")).toBe(false);
  });
});
