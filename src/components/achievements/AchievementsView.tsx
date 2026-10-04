"use client";

import { useProgressStore } from "@/lib/progress/store";
import { Icon } from "@/components/nav/Icon";

export interface AchievementDisplay {
  id: string;
  name: string;
  description: string;
  icon: string;
}

/** Display metadata (name/description/icon) is passed in from a server parent, sourced from the
 * founder-editable CMS with a hardcoded fallback (docs/PHASE-5.3.md "Achievement CMS") - this
 * component never reads it directly, keeping the server as the sole source for CMS content.
 * Unlock state is untouched: still the client progress store, still the trusted engine. Only
 * locked/unlocked states are real here (docs/PHASE-5.5.md "Achievements" also lists
 * "in progress", but unlock conditions are boolean/all-or-nothing in the trusted engine - see
 * src/lib/progress/achievements.ts - so a fabricated partial-progress bar would show a number
 * nothing actually tracks; omitted rather than invented, per the earlier "do not fabricate data"
 * rule this phase explicitly repeats). */
export function AchievementsView({ achievements }: { achievements: AchievementDisplay[] }) {
  const unlocked = useProgressStore((s) => s.unlockedAchievements);
  const unlockedSet = new Set(unlocked);

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {achievements.map((a) => {
        const isUnlocked = unlockedSet.has(a.id);
        return (
          <div
            key={a.id}
            className={`relative card p-5 text-center transition-all duration-300 motion-reduce:transition-none ${
              isUnlocked
                ? "border-accent/30 hover:scale-[1.03] hover:shadow-lg hover:shadow-accent/10"
                : "opacity-60"
            }`}
          >
            {isUnlocked && (
              <div className="absolute inset-0 rounded-[1rem] bg-gradient-to-b from-accent/10 to-transparent pointer-events-none" aria-hidden />
            )}
            <div
              className={`relative w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-3 transition-colors ${
                isUnlocked ? "bg-accent/20 text-accent ring-2 ring-accent/30" : "bg-bg-elevated text-muted"
              }`}
            >
              <Icon name={isUnlocked ? a.icon : "Lock"} size={isUnlocked ? 26 : 20} />
            </div>
            <h3 className="relative font-medium text-sm">{a.name}</h3>
            <p className="relative text-xs text-muted mt-1">{a.description}</p>
            {isUnlocked ? (
              <p className="relative flex items-center justify-center gap-1 text-xs text-accent mt-2 font-medium">
                <Icon name="Sparkles" size={12} />
                Unlocked
              </p>
            ) : (
              <p className="relative text-xs text-muted/70 mt-2">Locked</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
