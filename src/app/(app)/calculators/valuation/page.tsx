import type { Metadata } from "next";
import { ValuationCalculator } from "@/components/calculators/ValuationCalculator";

export const metadata: Metadata = { title: "Valuation Calculator" };

export default function ValuationCalculatorPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-1">Valuation Calculator</h1>
      <p className="text-muted mb-6">Post-money Valuation = Pre-money + Investment. Investor Ownership % = Investment ÷ Post-money × 100.</p>
      <ValuationCalculator />
    </div>
  );
}
