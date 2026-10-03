import type { Metadata } from "next";
import { ComingSoon } from "@/components/founder/ComingSoon";

export const metadata: Metadata = { title: "Founder · Achievements" };

export default function FounderAchievementsPage() {
  return <ComingSoon title="Achievements" description="Manage achievement metadata." />;
}
