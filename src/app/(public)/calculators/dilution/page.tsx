import type { Metadata } from "next";
import { DilutionCalculator } from "@/components/calculators/DilutionCalculator";

export const metadata: Metadata = { title: "Dilution Calculator" };

export default function DilutionCalculatorPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-1">Dilution Calculator</h1>
      <p className="text-muted mb-6">See how a new funding round changes your existing ownership percentage.</p>
      <DilutionCalculator />
    </div>
  );
}
