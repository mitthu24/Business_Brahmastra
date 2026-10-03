import { describe, it, expect } from "vitest";
import { updateStreak, isStreakBroken, type StreakState } from "./streak";

describe("updateStreak", () => {
  it("starts a new streak at 1 on first activity", () => {
    const state: StreakState = { currentStreak: 0, lastActiveDate: null };
    const result = updateStreak(state, "2026-01-01");
    expect(result.currentStreak).toBe(1);
    expect(result.lastActiveDate).toBe("2026-01-01");
  });

  it("does not change the streak for repeated activity on the same day", () => {
    const state: StreakState = { currentStreak: 3, lastActiveDate: "2026-01-05" };
    const result = updateStreak(state, "2026-01-05");
    expect(result.currentStreak).toBe(3);
  });

  it("increments the streak for activity on the very next day", () => {
    const state: StreakState = { currentStreak: 3, lastActiveDate: "2026-01-05" };
    const result = updateStreak(state, "2026-01-06");
    expect(result.currentStreak).toBe(4);
    expect(result.lastActiveDate).toBe("2026-01-06");
  });

  it("resets the streak to 1 after a gap of more than one day", () => {
    const state: StreakState = { currentStreak: 10, lastActiveDate: "2026-01-01" };
    const result = updateStreak(state, "2026-01-05");
    expect(result.currentStreak).toBe(1);
    expect(result.lastActiveDate).toBe("2026-01-05");
  });

  it("handles month boundaries correctly", () => {
    const state: StreakState = { currentStreak: 5, lastActiveDate: "2026-01-31" };
    const result = updateStreak(state, "2026-02-01");
    expect(result.currentStreak).toBe(6);
  });
});

describe("isStreakBroken", () => {
  it("returns false when there is no prior activity", () => {
    expect(isStreakBroken({ currentStreak: 0, lastActiveDate: null }, "2026-01-01")).toBe(false);
  });

  it("returns false for same-day or next-day activity", () => {
    expect(isStreakBroken({ currentStreak: 2, lastActiveDate: "2026-01-01" }, "2026-01-01")).toBe(false);
    expect(isStreakBroken({ currentStreak: 2, lastActiveDate: "2026-01-01" }, "2026-01-02")).toBe(false);
  });

  it("returns true when more than one day has passed", () => {
    expect(isStreakBroken({ currentStreak: 2, lastActiveDate: "2026-01-01" }, "2026-01-03")).toBe(true);
  });
});
