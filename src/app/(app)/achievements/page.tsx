import type { Metadata } from "next";
import { AchievementsView } from "@/components/achievements/AchievementsView";

export const metadata: Metadata = { title: "Achievements" };

export default function AchievementsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Achievements</h1>
      <p className="text-muted mb-6">Milestones you unlock as you progress through the course.</p>
      <AchievementsView />
    </div>
  );
}
