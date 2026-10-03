import type { Metadata } from "next";
import { ComingSoon } from "@/components/founder/ComingSoon";

export const metadata: Metadata = { title: "Founder · Exercises" };

export default function FounderExercisesPage() {
  return <ComingSoon title="Exercises" description="Manage lesson exercises." />;
}
