import type { Metadata } from "next";
import { ComingSoon } from "@/components/founder/ComingSoon";

export const metadata: Metadata = { title: "Founder · Formulas" };

export default function FounderFormulasPage() {
  return <ComingSoon title="Formulas" description="Manage the formula library." />;
}
