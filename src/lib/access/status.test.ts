import { describe, it, expect } from "vitest";
import { computeAccessStatus, getAccessInfo, hasProtectedAccess, TRIAL_DURATION_MS } from "./status";

const BASE_NOW = new Date("2026-10-10T10:00:00Z");

function subject(overrides: Partial<Parameters<typeof computeAccessStatus>[0]> = {}) {
  return {
    role: "user" as const,
    trialEndsAt: new Date(BASE_NOW.getTime() + TRIAL_DURATION_MS),
    accessActivatedAt: null,
    suspendedAt: null,
    ...overrides,
  };
}

describe("computeAccessStatus", () => {
  it("is TRIAL while now < trialEndsAt", () => {
    expect(computeAccessStatus(subject(), BASE_NOW)).toBe("TRIAL");
  });

  it("is EXPIRED once now >= trialEndsAt, with no client input involved", () => {
    const afterExpiry = new Date(BASE_NOW.getTime() + TRIAL_DURATION_MS + 1000);
    expect(computeAccessStatus(subject(), afterExpiry)).toBe("EXPIRED");
  });

  it("is EXPIRED exactly at the trialEndsAt instant (boundary is exclusive)", () => {
    const exactly = new Date(BASE_NOW.getTime() + TRIAL_DURATION_MS);
    expect(computeAccessStatus(subject(), exactly)).toBe("EXPIRED");
  });

  it("is ACTIVE when accessActivatedAt is set, even if the trial already expired", () => {
    const afterExpiry = new Date(BASE_NOW.getTime() + TRIAL_DURATION_MS + 1000);
    expect(computeAccessStatus(subject({ accessActivatedAt: BASE_NOW }), afterExpiry)).toBe("ACTIVE");
  });

  it("SUSPENDED always wins, even over an activated account or an unexpired trial", () => {
    expect(computeAccessStatus(subject({ suspendedAt: BASE_NOW, accessActivatedAt: BASE_NOW }), BASE_NOW)).toBe(
      "SUSPENDED"
    );
    expect(computeAccessStatus(subject({ suspendedAt: BASE_NOW }), BASE_NOW)).toBe("SUSPENDED");
  });

  it("founders are always ACTIVE, regardless of trial/suspension fields - role is the sole gate", () => {
    const afterExpiry = new Date(BASE_NOW.getTime() + TRIAL_DURATION_MS + 1000);
    expect(computeAccessStatus(subject({ role: "founder", suspendedAt: BASE_NOW }), afterExpiry)).toBe("ACTIVE");
  });
});

describe("hasProtectedAccess", () => {
  it("allows ACTIVE and TRIAL, denies EXPIRED and SUSPENDED", () => {
    expect(hasProtectedAccess("ACTIVE")).toBe(true);
    expect(hasProtectedAccess("TRIAL")).toBe(true);
    expect(hasProtectedAccess("EXPIRED")).toBe(false);
    expect(hasProtectedAccess("SUSPENDED")).toBe(false);
  });
});

describe("getAccessInfo", () => {
  it("reports whole days remaining during an active trial", () => {
    const oneDayIn = new Date(BASE_NOW.getTime() + 24 * 60 * 60 * 1000);
    const info = getAccessInfo(subject(), oneDayIn);
    expect(info.status).toBe("TRIAL");
    expect(info.daysRemaining).toBe(2);
  });

  it("never reports negative remaining time once expired", () => {
    const longAfter = new Date(BASE_NOW.getTime() + TRIAL_DURATION_MS * 10);
    const info = getAccessInfo(subject(), longAfter);
    expect(info.msRemaining).toBe(0);
    expect(info.daysRemaining).toBe(0);
  });
});
