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

/** Server-authoritative snapshot shape returned by /api/progress - see src/lib/db/progress-queries.ts. */
export interface ServerProgressSnapshot {
  completedDays: number[];
  completedExercises: number[];
  completedCaseStudies: number[];
  quizAttempts: Record<number, QuizAttemptRecord>;
  xp: number;
  streak: StreakState;
  unlockedAchievements: string[];
  finalProjectCompleted: boolean;
  reflections: Record<string, { learned: string; application: string }>;
}

export type SyncStatus = "idle" | "saving" | "saved" | "error" | "offline";

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

  syncStatus: SyncStatus;
  hydrated: boolean;

  completeDay: (day: number) => void;
  completeExercise: (lessonId: string) => void;
  completeCaseStudy: (lessonId: string) => void;
  submitQuiz: (lessonId: string, answers: QuizAnswer[]) => ReturnType<typeof scoreQuiz>;
  completeFinalProject: () => void;
  saveReflection: (lessonId: string, learned: string, application: string) => void;
  isDayCompleted: (day: number) => boolean;
  isDayUnlocked: (day: number) => boolean;

  hydrateFromServer: (snapshot: ServerProgressSnapshot) => void;
  retrySync: () => void;
  resetLocalProgress: () => void;
}

/** The store's own initial values, factored out so resetLocalProgress (below) can restore them
 * exactly - including `hydrated: false`, which is what tells ProgressBootstrap a fresh fetch is
 * needed again. Deliberately excludes the action functions - callers get those from the existing
 * store instance, this only ever resets data fields. */
const initialProgressData = {
  completedDays: [] as number[],
  completedExercises: [] as string[],
  completedCaseStudies: [] as string[],
  quizAttempts: {} as Record<string, QuizAttemptRecord>,
  xp: 0,
  streak: { currentStreak: 0, lastActiveDate: null } as StreakState,
  unlockedAchievements: [] as string[],
  finalProjectCompleted: false,
  reflections: {} as Record<string, { learned: string; application: string }>,
  syncStatus: "idle" as SyncStatus,
  hydrated: false,
};

function dayToLessonId(day: number): string {
  return `day-${day}`;
}

function lessonIdToDay(lessonId: string): number | null {
  const m = lessonId.match(/day-(\d+)/);
  return m ? Number(m[1]) : null;
}

function applySnapshot(snapshot: ServerProgressSnapshot) {
  const quizAttempts: Record<string, QuizAttemptRecord> = {};
  for (const [day, attempt] of Object.entries(snapshot.quizAttempts)) {
    quizAttempts[dayToLessonId(Number(day))] = attempt;
  }
  return {
    completedDays: snapshot.completedDays,
    completedExercises: snapshot.completedExercises.map(dayToLessonId),
    completedCaseStudies: snapshot.completedCaseStudies.map(dayToLessonId),
    quizAttempts,
    xp: snapshot.xp,
    streak: snapshot.streak,
    unlockedAchievements: snapshot.unlockedAchievements,
    finalProjectCompleted: snapshot.finalProjectCompleted,
    reflections: snapshot.reflections,
  };
}

/** POSTs a progress mutation to the server and reconciles local state with the authoritative
 * response. Network/DB failures are caught and surfaced as `syncStatus: "error"` rather than
 * thrown, so one failed request never crashes the app - the optimistic local update (already
 * applied by the caller) stands until the next successful sync. */
async function syncToServer(
  set: (partial: Partial<ProgressState>) => void,
  body: Record<string, unknown>
) {
  set({ syncStatus: "saving" });
  try {
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Sync failed (${res.status})`);
    const snapshot: ServerProgressSnapshot = await res.json();
    set({ ...applySnapshot(snapshot), syncStatus: "saved" });
  } catch {
    set({ syncStatus: typeof navigator !== "undefined" && !navigator.onLine ? "offline" : "error" });
  }
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      ...initialProgressData,

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
        void syncToServer(set, { action: "completeDay", day });
      },

      completeExercise: (lessonId: string) => {
        const state = get();
        if (state.completedExercises.includes(lessonId)) return;
        set({
          completedExercises: [...state.completedExercises, lessonId],
          xp: state.xp + xpForEvent("exercise"),
        });
        const day = lessonIdToDay(lessonId);
        if (day !== null) void syncToServer(set, { action: "completeExercise", day });
      },

      completeCaseStudy: (lessonId: string) => {
        const state = get();
        if (state.completedCaseStudies.includes(lessonId)) return;
        set({
          completedCaseStudies: [...state.completedCaseStudies, lessonId],
          xp: state.xp + xpForEvent("caseStudy"),
        });
        const day = lessonIdToDay(lessonId);
        if (day !== null) void syncToServer(set, { action: "completeCaseStudy", day });
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
        const day = lessonIdToDay(lessonId);
        if (day !== null) void syncToServer(set, { action: "submitQuiz", day, answers });
        return result;
      },

      completeFinalProject: () => {
        const state = get();
        if (state.finalProjectCompleted) return;
        set({ finalProjectCompleted: true, xp: state.xp + xpForEvent("finalProject") });
        void syncToServer(set, { action: "completeFinalProject" });
      },

      saveReflection: (lessonId: string, learned: string, application: string) => {
        const state = get();
        set({ reflections: { ...state.reflections, [lessonId]: { learned, application } } });
        void syncToServer(set, { action: "saveReflection", lessonId, learned, application });
      },

      isDayCompleted: (day: number) => get().completedDays.includes(day),

      isDayUnlocked: (day: number) => {
        if (day <= 1) return true;
        return get().completedDays.includes(day - 1) || get().completedDays.includes(day);
      },

      hydrateFromServer: (snapshot: ServerProgressSnapshot) => {
        set({ ...applySnapshot(snapshot), hydrated: true, syncStatus: "saved" });
      },

      retrySync: () => {
        set({ syncStatus: "saving" });
        void fetch("/api/progress")
          .then(async (res) => {
            if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
            const snapshot: ServerProgressSnapshot = await res.json();
            set({ ...applySnapshot(snapshot), syncStatus: "saved" });
          })
          .catch(() => {
            set({ syncStatus: typeof navigator !== "undefined" && !navigator.onLine ? "offline" : "error" });
          });
      },

      /** Called on logout (see LogoutButton.tsx) - clears every field back to its initial value,
       * including `hydrated: false`, and the overwrite is persisted to localStorage exactly like
       * any other `set()` call here. Without this, the next user to log in on the same browser
       * tab (no hard reload) would see whichever user logged out's progress still sitting in the
       * store - a real cross-user data leak this action exists specifically to prevent. */
      resetLocalProgress: () => set({ ...initialProgressData }),
    }),
    { name: "business-school-progress" }
  )
);
