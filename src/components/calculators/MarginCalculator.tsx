"use client";

import { LiveCalculator } from "./LiveCalculator";
import { calcMargin } from "@/lib/calculators";

export function MarginCalculator() {
  return (
    <LiveCalculator
      fields={[
        { id: "revenue", label: "Revenue", defaultValue: 2000000, prefix: "₹" },
        { id: "cost", label: "Total Cost", defaultValue: 1200000, prefix: "₹" },
      ]}
      resultConfigs={[{ id: "marginPercent", label: "Margin %", format: (v) => `${v.toFixed(1)}%`, highlight: true }]}
      compute={(v) => ({ marginPercent: calcMargin(v.revenue, v.cost) })}
    />
  );
}
