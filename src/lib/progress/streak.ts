/** Dates are compared as YYYY-MM-DD strings (local calendar days), ignoring time of day. */

function daysBetween(fromISO: string, toISO: string): number {
  const from = new Date(fromISO + "T00:00:00Z").getTime();
  const to = new Date(toISO + "T00:00:00Z").getTime();
  return Math.round((to - from) / (1000 * 60 * 60 * 24));
}

export interface StreakState {
  currentStreak: number;
  lastActiveDate: string | null; // YYYY-MM-DD
}

/**
 * Updates a streak given today's date.
 * - First ever activity: streak becomes 1.
 * - Same day as last activity: streak unchanged.
 * - Exactly one day after last activity: streak increments.
 * - More than one day gap: streak resets to 1.
 */
export function updateStreak(state: StreakState, todayISO: string): StreakState {
  if (!state.lastActiveDate) {
    return { currentStreak: 1, lastActiveDate: todayISO };
  }
  const gap = daysBetween(state.lastActiveDate, todayISO);
  if (gap === 0) {
    return state;
  }
  if (gap === 1) {
    return { currentStreak: state.currentStreak + 1, lastActiveDate: todayISO };
  }
  return { currentStreak: 1, lastActiveDate: todayISO };
}

/** Returns true if the streak would be broken (lapsed) as of todayISO, without mutating state. */
export function isStreakBroken(state: StreakState, todayISO: string): boolean {
  if (!state.lastActiveDate) return false;
  return daysBetween(state.lastActiveDate, todayISO) > 1;
}
