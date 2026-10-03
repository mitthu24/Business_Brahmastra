import type { Metadata } from "next";
import { RetentionCalculator } from "@/components/calculators/RetentionCalculator";

export const metadata: Metadata = { title: "Retention Calculator" };

export default function RetentionCalculatorPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-1">Retention Calculator</h1>
      <p className="text-muted mb-6">Retention Rate % = (Remaining Customers ÷ Starting Customers) × 100.</p>
      <RetentionCalculator />
    </div>
  );
}
