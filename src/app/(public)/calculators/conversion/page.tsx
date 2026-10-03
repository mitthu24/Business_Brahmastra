import type { Metadata } from "next";
import { ConversionCalculator } from "@/components/calculators/ConversionCalculator";

export const metadata: Metadata = { title: "Conversion Calculator" };

export default function ConversionCalculatorPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-1">Conversion Calculator</h1>
      <p className="text-muted mb-6">Conversion Rate % = (Conversions ÷ Visitors/Leads) × 100.</p>
      <ConversionCalculator />
    </div>
  );
}
