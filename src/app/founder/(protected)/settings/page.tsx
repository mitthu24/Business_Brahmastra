import type { Metadata } from "next";
import { ComingSoon } from "@/components/founder/ComingSoon";

export const metadata: Metadata = { title: "Founder · Settings" };

export default function FounderSettingsPage() {
  return <ComingSoon title="Settings" description="Product-wide settings." />;
}
