"use client";

import { LiveCalculator } from "./LiveCalculator";
import { calcRetentionRate } from "@/lib/calculators";

export function RetentionCalculator() {
  return (
    <LiveCalculator
      fields={[
        { id: "remaining", label: "Remaining Customers", defaultValue: 920 },
        { id: "starting", label: "Starting Customers", defaultValue: 1000 },
      ]}
      resultConfigs={[{ id: "retention", label: "Retention Rate", format: (v) => `${v.toFixed(1)}%`, highlight: true }]}
      compute={(v) => ({ retention: calcRetentionRate(v.remaining, v.starting) })}
    />
  );
}
