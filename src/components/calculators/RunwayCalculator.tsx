"use client";

import { LiveCalculator } from "./LiveCalculator";
import { calcRunway } from "@/lib/calculators";

export function RunwayCalculator() {
  return (
    <LiveCalculator
      fields={[
        { id: "cash", label: "Cash Available", defaultValue: 5000000, prefix: "₹", min: 0 },
        { id: "burn", label: "Monthly Net Burn (negative = cash growing)", defaultValue: 1000000, prefix: "₹" },
      ]}
      resultConfigs={[{ id: "runway", label: "Runway (months)", format: (v) => `${v.toFixed(1)} months`, highlight: true }]}
      compute={(v) => ({ runway: calcRunway(v.cash, v.burn) })}
      interpretation={({ results }) =>
        Number.isFinite(results.runway)
          ? `At the current burn rate, this business can keep operating for about ${results.runway.toFixed(1)} months before running out of cash.`
          : "With zero or negative net burn, this business isn't spending down its cash reserves."
      }
    />
  );
}
