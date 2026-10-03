import type { Metadata } from "next";
import { ComingSoon } from "@/components/founder/ComingSoon";

export const metadata: Metadata = { title: "Founder · Content" };

export default function FounderContentPage() {
  return <ComingSoon title="Content" description="Manage all founder-controlled content from one place." />;
}
