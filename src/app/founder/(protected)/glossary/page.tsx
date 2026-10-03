import type { Metadata } from "next";
import { ComingSoon } from "@/components/founder/ComingSoon";

export const metadata: Metadata = { title: "Founder · Glossary" };

export default function FounderGlossaryPage() {
  return <ComingSoon title="Glossary" description="Manage business glossary terms." />;
}
