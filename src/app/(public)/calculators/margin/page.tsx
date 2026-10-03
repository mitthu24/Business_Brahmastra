import type { Metadata } from "next";
import { MarginCalculator } from "@/components/calculators/MarginCalculator";

export const metadata: Metadata = { title: "Margin Calculator" };

export default function MarginCalculatorPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-1">Margin Calculator</h1>
      <p className="text-muted mb-6">Margin % = (Profit ÷ Revenue) × 100.</p>
      <MarginCalculator />
    </div>
  );
}
