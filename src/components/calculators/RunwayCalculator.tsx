"use client";

import { LiveCalculator } from "./LiveCalculator";
import { calcRunway } from "@/lib/calculators";

export function RunwayCalculator() {
  return (
    <LiveCalculator
      fields={[
        { id: "cash", label: "Cash Available", defaultValue: 5000000, prefix: "₹" },
        { id: "burn", label: "Monthly Net Burn", defaultValue: 1000000, prefix: "₹" },
      ]}
      resultConfigs={[{ id: "runway", label: "Runway (months)", format: (v) => `${v.toFixed(1)} months`, highlight: true }]}
      compute={(v) => ({ runway: calcRunway(v.cash, v.burn) })}
    />
  );
}
