import type { Metadata } from "next";
import { ChurnCalculator } from "@/components/calculators/ChurnCalculator";

export const metadata: Metadata = { title: "Churn Calculator" };

export default function ChurnCalculatorPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-1">Churn Calculator</h1>
      <p className="text-muted mb-6">Churn Rate % = (Lost Customers ÷ Starting Customers) × 100.</p>
      <ChurnCalculator />
    </div>
  );
}
