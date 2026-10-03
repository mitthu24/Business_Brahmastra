import { describe, it, expect } from "vitest";
import { sanitizeNextPath } from "./safe-redirect";

describe("sanitizeNextPath", () => {
  it("accepts a plain relative path", () => {
    expect(sanitizeNextPath("/dashboard")).toBe("/dashboard");
  });

  it("preserves a query string on the path", () => {
    expect(sanitizeNextPath("/learn/day/5?foo=bar")).toBe("/learn/day/5?foo=bar");
  });

  it("rejects protocol-relative URLs (open redirect vector)", () => {
    expect(sanitizeNextPath("//evil.com")).toBeNull();
    expect(sanitizeNextPath("/\\evil.com")).toBeNull();
  });

  it("rejects an absolute URL to another host", () => {
    expect(sanitizeNextPath("https://evil.com/phish")).toBeNull();
    expect(sanitizeNextPath("http://evil.com")).toBeNull();
  });

  it("rejects a value that doesn't start with /", () => {
    expect(sanitizeNextPath("dashboard")).toBeNull();
  });

  it("rejects null, undefined and empty values", () => {
    expect(sanitizeNextPath(null)).toBeNull();
    expect(sanitizeNextPath(undefined)).toBeNull();
    expect(sanitizeNextPath("")).toBeNull();
  });

  it("rejects a non-string FormData value (e.g. a File)", () => {
    const file = new File(["x"], "x.txt");
    expect(sanitizeNextPath(file)).toBeNull();
  });
});
