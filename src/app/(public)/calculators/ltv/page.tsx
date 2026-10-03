import type { Metadata } from "next";
import { LtvCalculator } from "@/components/calculators/LtvCalculator";

export const metadata: Metadata = { title: "LTV Calculator" };

export default function LtvCalculatorPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-1">LTV Calculator</h1>
      <p className="text-muted mb-6">LTV = Average Revenue per Customer × Customer Lifetime (months). Also compares against CAC.</p>
      <LtvCalculator />
    </div>
  );
}
