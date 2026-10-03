"use client";

import { achievements } from "@/lib/progress/achievements";
import { useProgressStore } from "@/lib/progress/store";
import { Icon } from "@/components/nav/Icon";

export function AchievementsView() {
  const unlocked = useProgressStore((s) => s.unlockedAchievements);
  const unlockedSet = new Set(unlocked);

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {achievements.map((a) => {
        const isUnlocked = unlockedSet.has(a.id);
        return (
          <div
            key={a.id}
            className={`card p-5 text-center transition-transform duration-300 motion-reduce:transition-none ${
              isUnlocked ? "hover:scale-[1.03]" : "opacity-50"
            }`}
          >
            <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-3 transition-colors ${isUnlocked ? "bg-accent/20 text-accent" : "bg-bg-elevated text-muted"}`}>
              <Icon name={a.icon} size={26} />
            </div>
            <h3 className="font-medium text-sm">{a.title}</h3>
            <p className="text-xs text-muted mt-1">{a.description}</p>
            {isUnlocked && <p className="text-xs text-success mt-2">Unlocked</p>}
          </div>
        );
      })}
    </div>
  );
}
