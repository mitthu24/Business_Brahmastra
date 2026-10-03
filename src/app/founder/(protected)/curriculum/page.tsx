import type { Metadata } from "next";
import { ComingSoon } from "@/components/founder/ComingSoon";

export const metadata: Metadata = { title: "Founder · Curriculum" };

export default function FounderCurriculumPage() {
  return <ComingSoon title="Curriculum" description="Manage the 90-day curriculum, grouped by phase." />;
}
