import type { Metadata } from "next";
import { ComingSoon } from "@/components/founder/ComingSoon";

export const metadata: Metadata = { title: "Founder · Analytics" };

export default function FounderAnalyticsPage() {
  return <ComingSoon title="Analytics" description="Deeper learner analytics and reporting." />;
}
