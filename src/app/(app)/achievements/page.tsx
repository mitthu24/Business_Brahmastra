import type { Metadata } from "next";
import { getDb } from "@/lib/db/client";
import { listPublishedAchievementsForLearner } from "@/lib/db/achievement-queries";
import { AchievementsView } from "@/components/achievements/AchievementsView";

export const metadata: Metadata = { title: "Achievements" };
export const dynamic = "force-dynamic";

export default async function AchievementsPage() {
  const achievements = await listPublishedAchievementsForLearner(getDb());
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Achievements</h1>
      <p className="text-muted mb-6">Milestones you unlock as you progress through the course.</p>
      <AchievementsView achievements={achievements} />
    </div>
  );
}
