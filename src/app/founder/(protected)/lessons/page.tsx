import type { Metadata } from "next";
import { ComingSoon } from "@/components/founder/ComingSoon";

export const metadata: Metadata = { title: "Founder · Lessons" };

export default function FounderLessonsPage() {
  return <ComingSoon title="Lessons" description="Create, edit, and publish individual lessons." />;
}
