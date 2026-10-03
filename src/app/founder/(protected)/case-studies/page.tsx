import type { Metadata } from "next";
import { ComingSoon } from "@/components/founder/ComingSoon";

export const metadata: Metadata = { title: "Founder · Case Studies" };

export default function FounderCaseStudiesPage() {
  return <ComingSoon title="Case Studies" description="Manage business case studies." />;
}
