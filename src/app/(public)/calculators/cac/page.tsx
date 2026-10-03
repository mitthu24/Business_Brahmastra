import type { Metadata } from "next";
import { CacCalculator } from "@/components/calculators/CacCalculator";

export const metadata: Metadata = { title: "CAC Calculator" };

export default function CacCalculatorPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-1">CAC Calculator</h1>
      <p className="text-muted mb-6">CAC = Total Sales + Marketing Cost ÷ New Customers.</p>
      <CacCalculator />
    </div>
  );
}
