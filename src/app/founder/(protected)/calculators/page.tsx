import type { Metadata } from "next";
import { ComingSoon } from "@/components/founder/ComingSoon";

export const metadata: Metadata = { title: "Founder · Calculators" };

export default function FounderCalculatorsPage() {
  return <ComingSoon title="Calculators" description="Manage calculator metadata and descriptions." />;
}
