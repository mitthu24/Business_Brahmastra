// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { useProgressStore, type ServerProgressSnapshot } from "./store";

const snapshot: ServerProgressSnapshot = {
  completedDays: [1, 2, 3],
  completedExercises: [1, 2],
  completedCaseStudies: [1],
  quizAttempts: { 1: { accuracyPercent: 100, completedAt: "2026-01-01" } },
  xp: 500,
  streak: { currentStreak: 3, lastActiveDate: "2026-01-03" },
  unlockedAchievements: ["first-step"],
  finalProjectCompleted: true,
  reflections: { "day-1": { learned: "x", application: "y" } },
};

beforeEach(() => {
  window.localStorage.clear();
  useProgressStore.getState().resetLocalProgress();
});

describe("resetLocalProgress (Phase 5.5.2 cross-user safety fix)", () => {
  it("zeroes every field back to its initial value, including `hydrated`", () => {
    useProgressStore.getState().hydrateFromServer(snapshot);
    expect(useProgressStore.getState().xp).toBe(500);
    expect(useProgressStore.getState().hydrated).toBe(true);

    useProgressStore.getState().resetLocalProgress();

    const state = useProgressStore.getState();
    expect(state.completedDays).toEqual([]);
    expect(state.completedExercises).toEqual([]);
    expect(state.completedCaseStudies).toEqual([]);
    expect(state.quizAttempts).toEqual({});
    expect(state.xp).toBe(0);
    expect(state.streak).toEqual({ currentStreak: 0, lastActiveDate: null });
    expect(state.unlockedAchievements).toEqual([]);
    expect(state.finalProjectCompleted).toBe(false);
    expect(state.reflections).toEqual({});
    expect(state.hydrated).toBe(false);
    expect(state.syncStatus).toBe("idle");
  });

  it("the reset is actually persisted - a fresh read of localStorage shows no trace of the previous user's data", () => {
    useProgressStore.getState().hydrateFromServer(snapshot);
    useProgressStore.getState().resetLocalProgress();

    const raw = window.localStorage.getItem("business-school-progress");
    expect(raw).toBeTruthy();
    const persisted = JSON.parse(raw!);
    expect(persisted.state.xp).toBe(0);
    expect(persisted.state.completedDays).toEqual([]);
    expect(persisted.state.unlockedAchievements).toEqual([]);
  });
});
