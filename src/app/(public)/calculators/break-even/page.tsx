import type { Metadata } from "next";
import { BreakEvenCalculator } from "@/components/calculators/BreakEvenCalculator";

export const metadata: Metadata = { title: "Break-even Calculator" };

export default function BreakEvenCalculatorPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-1">Break-even Calculator</h1>
      <p className="text-muted mb-6">Break-even Units = Fixed Costs ÷ (Selling Price − Variable Cost per Unit).</p>
      <BreakEvenCalculator />
    </div>
  );
}
