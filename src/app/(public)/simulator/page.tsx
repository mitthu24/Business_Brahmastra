import type { Metadata } from "next";
import { SimulatorView } from "@/components/simulator/SimulatorView";

export const metadata: Metadata = { title: "Business Simulator" };

export default function SimulatorPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Business Simulator</h1>
      <p className="text-muted mb-6">Pick a business type, set your numbers, and see your finances update live — then react to real scenarios.</p>
      <SimulatorView />
    </div>
  );
}
