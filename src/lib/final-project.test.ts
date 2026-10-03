import { describe, it, expect } from "vitest";
import { wizardSteps, emptyWizardAnswers, isWizardComplete, completionPercent } from "./final-project";

describe("final project wizard", () => {
  it("has exactly 17 steps", () => {
    expect(wizardSteps).toHaveLength(17);
  });

  it("numbers steps sequentially from 1 to 17", () => {
    wizardSteps.forEach((step, i) => expect(step.stepNumber).toBe(i + 1));
  });

  it("reports 0% completion for empty answers", () => {
    expect(completionPercent(emptyWizardAnswers())).toBe(0);
    expect(isWizardComplete(emptyWizardAnswers())).toBe(false);
  });

  it("reports partial completion correctly", () => {
    const answers = emptyWizardAnswers();
    answers.idea = "A tutoring marketplace";
    answers.problem = "Parents struggle to find reliable tutors";
    const percent = completionPercent(answers);
    expect(percent).toBeCloseTo(Math.round((2 / 17) * 100), 0);
    expect(isWizardComplete(answers)).toBe(false);
  });

  it("reports 100% completion only when every step has an answer", () => {
    const answers = emptyWizardAnswers();
    wizardSteps.forEach((s) => (answers[s.id] = "answer"));
    expect(completionPercent(answers)).toBe(100);
    expect(isWizardComplete(answers)).toBe(true);
  });
});
