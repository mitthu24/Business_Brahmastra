import type { Metadata } from "next";
import { RunwayCalculator } from "@/components/calculators/RunwayCalculator";

export const metadata: Metadata = { title: "Startup Runway Calculator" };

export default function RunwayCalculatorPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-1">Startup Runway Calculator</h1>
      <p className="text-muted mb-6">Runway = Cash Available ÷ Monthly Net Burn.</p>
      <RunwayCalculator />
    </div>
  );
}
