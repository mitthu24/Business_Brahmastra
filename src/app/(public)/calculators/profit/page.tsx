import type { Metadata } from "next";
import { ProfitCalculator } from "@/components/calculators/ProfitCalculator";

export const metadata: Metadata = { title: "Profit Calculator" };

export default function ProfitCalculatorPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-1">Profit Calculator</h1>
      <p className="text-muted mb-6">Profit = Revenue − Cost. Margin % = (Profit ÷ Revenue) × 100.</p>
      <ProfitCalculator />
    </div>
  );
}
