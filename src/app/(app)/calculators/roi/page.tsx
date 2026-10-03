import type { Metadata } from "next";
import { RoiCalculator } from "@/components/calculators/RoiCalculator";

export const metadata: Metadata = { title: "ROI Calculator" };

export default function RoiCalculatorPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-1">ROI Calculator</h1>
      <p className="text-muted mb-6">ROI = (Gain ÷ Investment) × 100.</p>
      <RoiCalculator />
    </div>
  );
}
