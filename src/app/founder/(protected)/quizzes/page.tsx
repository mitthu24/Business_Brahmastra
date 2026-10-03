import type { Metadata } from "next";
import { ComingSoon } from "@/components/founder/ComingSoon";

export const metadata: Metadata = { title: "Founder · Quizzes" };

export default function FounderQuizzesPage() {
  return <ComingSoon title="Quizzes" description="Manage lesson quiz questions." />;
}
