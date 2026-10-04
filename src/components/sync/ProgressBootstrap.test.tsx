// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { ProgressBootstrap, resetBootstrapGuard } from "./ProgressBootstrap";
import { useProgressStore, type ServerProgressSnapshot } from "@/lib/progress/store";

/**
 * Regression coverage for the cross-user safety review of the Phase 5.5.2 performance fix.
 *
 * Phase 5.5.2 replaced ProgressBootstrap's per-mount `useRef` guard with a module-level flag, to
 * stop GET /api/progress from refiring every time AppShell remounts across the (app)/(public)
 * route-group boundary for the SAME logged-in user. That flag surviving remounts is exactly what
 * makes it unsafe on its own: without an explicit reset at logout, a second user logging in on
 * the same browser tab (no hard reload) would see the flag already set and skip their own fetch,
 * leaving the previous user's data in the store. These tests exercise both halves: the guard
 * actually suppresses a same-user remount (the performance property), and resetBootstrapGuard()
 * (wired into LogoutButton.tsx) correctly lifts that suppression for the next user (the safety
 * property) - see also store.test.ts for resetLocalProgress itself.
 */

function snapshotFor(xp: number): ServerProgressSnapshot {
  return {
    completedDays: [1],
    completedExercises: [],
    completedCaseStudies: [],
    quizAttempts: {},
    xp,
    streak: { currentStreak: 1, lastActiveDate: "2026-01-01" },
    unlockedAchievements: [],
    finalProjectCompleted: false,
    reflections: {},
  };
}

function mockProgressFetch(snapshot: ServerProgressSnapshot): typeof fetch {
  return vi.fn(async (input: string | URL | Request) => {
    if (String(input) === "/api/progress") {
      return { ok: true, json: async () => snapshot } as Response;
    }
    return { ok: true, json: async () => ({}) } as Response;
  }) as unknown as typeof fetch;
}

beforeEach(() => {
  resetBootstrapGuard();
  useProgressStore.getState().resetLocalProgress();
  window.localStorage.clear();
  cleanup();
});

describe("ProgressBootstrap cross-session safety", () => {
  it("fetches progress on first mount and hydrates the store", async () => {
    global.fetch = mockProgressFetch(snapshotFor(100));
    render(<ProgressBootstrap />);
    await vi.waitFor(() => expect(useProgressStore.getState().hydrated).toBe(true));

    expect(useProgressStore.getState().xp).toBe(100);
    expect(global.fetch).toHaveBeenCalledWith("/api/progress");
  });

  it("does NOT refetch on a remount for the same session (the Phase 5.5.2 performance property)", async () => {
    global.fetch = mockProgressFetch(snapshotFor(100));
    const first = render(<ProgressBootstrap />);
    await vi.waitFor(() => expect(useProgressStore.getState().hydrated).toBe(true));
    first.unmount();

    // Simulates navigating between the (app) and (public) route groups, which remounts
    // AppShell/ProgressBootstrap while the same user stays logged in.
    render(<ProgressBootstrap />);
    await new Promise((r) => setTimeout(r, 0));

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(useProgressStore.getState().xp).toBe(100); // still the same user's data
  });

  it("logout (resetBootstrapGuard + resetLocalProgress) clears stale data AND forces the next mount to refetch for the new user", async () => {
    global.fetch = mockProgressFetch(snapshotFor(100));
    const userA = render(<ProgressBootstrap />);
    await vi.waitFor(() => expect(useProgressStore.getState().hydrated).toBe(true));
    expect(useProgressStore.getState().xp).toBe(100);
    userA.unmount();

    // This is exactly what LogoutButton.tsx's onClick does before the server logout action runs.
    useProgressStore.getState().resetLocalProgress();
    resetBootstrapGuard();

    // Cross-user assertion: the moment logout resets local state, no trace of user A survives -
    // this must hold even before user B's own fetch has had a chance to resolve.
    expect(useProgressStore.getState().xp).toBe(0);
    expect(useProgressStore.getState().hydrated).toBe(false);
    expect(useProgressStore.getState().completedDays).toEqual([]);

    // User B logs in, in the same browser tab, with their own different progress.
    global.fetch = mockProgressFetch(snapshotFor(250));
    render(<ProgressBootstrap />);
    await vi.waitFor(() => expect(useProgressStore.getState().hydrated).toBe(true));

    expect(global.fetch).toHaveBeenCalledWith("/api/progress");
    expect(useProgressStore.getState().xp).toBe(250); // user B's data, never user A's
  });
});
