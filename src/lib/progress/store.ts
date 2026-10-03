"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { xpForEvent, scoreQuiz, type QuizAnswer } from "./xp";
import { updateStreak, type StreakState } from "./streak";
import { computeUnlockedAchievements } from "./achievements";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

interface QuizAttemptRecord {
  accuracyPercent: number;
  completedAt: string;
}

interface ProgressState {
  completedDays: number[]; // serializable array (Set isn't JSON-safe)
  completedExercises: string[]; // lesson ids
  completedCaseStudies: string[]; // lesson ids
  quizAttempts: Record<string, QuizAttemptRecord>; // lessonId -> result
  xp: number;
  streak: StreakState;
  unlockedAchievements: string[];
  finalProjectCompleted: boolean;
  reflections: Record<string, { learned: string; application: string }>;

  completeDay: (day: number) => void;
  completeExercise: (lessonId: string) => void;
  completeCaseStudy: (lessonId: string) => void;
  submitQuiz: (lessonId: string, answers: QuizAnswer[]) => ReturnType<typeof scoreQuiz>;
  completeFinalProject: () => void;
  saveReflection: (lessonId: string, learned: string, application: string) => void;
  isDayCompleted: (day: number) => boolean;
  isDayUnlocked: (day: number) => boolean;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      completedDays: [],
      completedExercises: [],
      completedCaseStudies: [],
      quizAttempts: {},
      xp: 0,
      streak: { currentStreak: 0, lastActiveDate: null },
      unlockedAchievements: [],
      finalProjectCompleted: false,
      reflections: {},

      completeDay: (day: number) => {
        const state = get();
        if (state.completedDays.includes(day)) return;
        const newCompletedDays = [...state.completedDays, day];
        const newStreak = updateStreak(state.streak, todayISO());
        const newXp = state.xp + xpForEvent("lessonComplete");
        const unlocked = computeUnlockedAchievements({ completedDays: new Set(newCompletedDays) });
        set({
          completedDays: newCompletedDays,
          streak: newStreak,
          xp: newXp,
          unlockedAchievements: Array.from(new Set([...state.unlockedAchievements, ...unlocked])),
        });
      },

      completeExercise: (lessonId: string) => {
        const state = get();
        if (state.completedExercises.includes(lessonId)) return;
        set({
          completedExercises: [...state.completedExercises, lessonId],
          xp: state.xp + xpForEvent("exercise"),
        });
      },

      completeCaseStudy: (lessonId: string) => {
        const state = get();
        if (state.completedCaseStudies.includes(lessonId)) return;
        set({
          completedCaseStudies: [...state.completedCaseStudies, lessonId],
          xp: state.xp + xpForEvent("caseStudy"),
        });
      },

      submitQuiz: (lessonId: string, answers: QuizAnswer[]) => {
        const state = get();
        const result = scoreQuiz(answers);
        const alreadyAttempted = Boolean(state.quizAttempts[lessonId]);
        set({
          quizAttempts: {
            ...state.quizAttempts,
            [lessonId]: { accuracyPercent: result.accuracyPercent, completedAt: todayISO() },
          },
          xp: alreadyAttempted ? state.xp : state.xp + result.xpEarned,
        });
        return result;
      },

      completeFinalProject: () => {
        const state = get();
        if (state.finalProjectCompleted) return;
        set({ finalProjectCompleted: true, xp: state.xp + xpForEvent("finalProject") });
      },

      saveReflection: (lessonId: string, learned: string, application: string) => {
        const state = get();
        set({ reflections: { ...state.reflections, [lessonId]: { learned, application } } });
      },

      isDayCompleted: (day: number) => get().completedDays.includes(day),

      isDayUnlocked: (day: number) => {
        if (day <= 1) return true;
        return get().completedDays.includes(day - 1) || get().completedDays.includes(day);
      },
    }),
    { name: "business-school-progress" }
  )
);
