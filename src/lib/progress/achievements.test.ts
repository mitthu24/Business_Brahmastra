import { describe, it, expect } from "vitest";
import { computeUnlockedAchievements } from "./achievements";

describe("computeUnlockedAchievements", () => {
  it("unlocks 'First Step' after completing day 1", () => {
    const unlocked = computeUnlockedAchievements({ completedDays: new Set([1]) });
    expect(unlocked).toContain("first-step");
  });

  it("does not unlock 'First Step' if day 1 isn't completed", () => {
    const unlocked = computeUnlockedAchievements({ completedDays: new Set([2, 3]) });
    expect(unlocked).not.toContain("first-step");
  });

  it("unlocks '7-Day Founder' after 7 total completed days, regardless of which ones", () => {
    const unlocked = computeUnlockedAchievements({ completedDays: new Set([1, 2, 3, 4, 5, 6, 7]) });
    expect(unlocked).toContain("seven-day-founder");
  });

  it("does not unlock '7-Day Founder' with only 6 completed days", () => {
    const unlocked = computeUnlockedAchievements({ completedDays: new Set([1, 2, 3, 4, 5, 6]) });
    expect(unlocked).not.toContain("seven-day-founder");
  });

  it("unlocks 'Business Thinker' only when all of days 1-7 (the Business Foundation phase) are complete", () => {
    const partial = computeUnlockedAchievements({ completedDays: new Set([1, 2, 3, 4, 5, 6]) });
    expect(partial).not.toContain("business-thinker");

    const full = computeUnlockedAchievements({ completedDays: new Set([1, 2, 3, 4, 5, 6, 7]) });
    expect(full).toContain("business-thinker");
  });

  it("unlocks 'Money Minded' only when the full Finance phase (days 50-58) is complete", () => {
    const days = new Set(Array.from({ length: 8 }, (_, i) => 50 + i)); // 50..57, missing 58
    expect(computeUnlockedAchievements({ completedDays: days })).not.toContain("money-minded");

    days.add(58);
    expect(computeUnlockedAchievements({ completedDays: days })).toContain("money-minded");
  });

  it("unlocks 'Founder' only once all 90 days are complete", () => {
    const days89 = new Set(Array.from({ length: 89 }, (_, i) => i + 1));
    expect(computeUnlockedAchievements({ completedDays: days89 })).not.toContain("founder");

    const days90 = new Set(Array.from({ length: 90 }, (_, i) => i + 1));
    expect(computeUnlockedAchievements({ completedDays: days90 })).toContain("founder");
  });
});
