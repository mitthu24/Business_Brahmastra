"use client";

import { LiveCalculator } from "./LiveCalculator";
import { calcChurnRate } from "@/lib/calculators";

export function ChurnCalculator() {
  return (
    <LiveCalculator
      fields={[
        { id: "lost", label: "Customers Lost", defaultValue: 80, min: 0 },
        { id: "starting", label: "Starting Customers", defaultValue: 1000, min: 0 },
      ]}
      resultConfigs={[{ id: "churn", label: "Churn Rate", format: (v) => `${v.toFixed(1)}%`, highlight: true }]}
      compute={(v) => ({ churn: calcChurnRate(v.lost, v.starting) })}
      interpretation={({ results }) => `About ${results.churn.toFixed(1)}% of customers are leaving each period — you need new customers just to replace them before any real growth happens.`}
    />
  );
}
