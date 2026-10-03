"use client";

import { LiveCalculator } from "./LiveCalculator";
import { calcChurnRate } from "@/lib/calculators";

export function ChurnCalculator() {
  return (
    <LiveCalculator
      fields={[
        { id: "lost", label: "Customers Lost", defaultValue: 80 },
        { id: "starting", label: "Starting Customers", defaultValue: 1000 },
      ]}
      resultConfigs={[{ id: "churn", label: "Churn Rate", format: (v) => `${v.toFixed(1)}%`, highlight: true }]}
      compute={(v) => ({ churn: calcChurnRate(v.lost, v.starting) })}
    />
  );
}
