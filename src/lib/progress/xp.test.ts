import { describe, it, expect } from "vitest";
import { xpForEvent, scoreQuiz, XP_REWARDS } from "./xp";

describe("xpForEvent", () => {
  it("returns the correct XP for each event type", () => {
    expect(xpForEvent("lessonComplete")).toBe(50);
    expect(xpForEvent("exercise")).toBe(25);
    expect(xpForEvent("quiz")).toBe(25);
    expect(xpForEvent("caseStudy")).toBe(50);
    expect(xpForEvent("finalProject")).toBe(500);
  });

  it("matches the XP_REWARDS map exactly", () => {
    (Object.keys(XP_REWARDS) as Array<keyof typeof XP_REWARDS>).forEach((key) => {
      expect(xpForEvent(key)).toBe(XP_REWARDS[key]);
    });
  });
});

describe("scoreQuiz", () => {
  it("scores all-correct answers as 100% accuracy", () => {
    const result = scoreQuiz([
      { questionId: "q1", selectedIndex: 1, correctIndex: 1 },
      { questionId: "q2", selectedIndex: 0, correctIndex: 0 },
    ]);
    expect(result.correctCount).toBe(2);
    expect(result.total).toBe(2);
    expect(result.accuracyPercent).toBe(100);
    expect(result.xpEarned).toBe(25);
  });

  it("scores partially correct answers accurately", () => {
    const result = scoreQuiz([
      { questionId: "q1", selectedIndex: 1, correctIndex: 1 },
      { questionId: "q2", selectedIndex: 2, correctIndex: 0 },
      { questionId: "q3", selectedIndex: 3, correctIndex: 3 },
    ]);
    expect(result.correctCount).toBe(2);
    expect(result.total).toBe(3);
    expect(result.accuracyPercent).toBe(67);
  });

  it("scores all-wrong answers as 0% accuracy", () => {
    const result = scoreQuiz([{ questionId: "q1", selectedIndex: 2, correctIndex: 0 }]);
    expect(result.correctCount).toBe(0);
    expect(result.accuracyPercent).toBe(0);
  });

  it("handles an empty quiz with zero XP and zero accuracy", () => {
    const result = scoreQuiz([]);
    expect(result.total).toBe(0);
    expect(result.accuracyPercent).toBe(0);
    expect(result.xpEarned).toBe(0);
  });
});
