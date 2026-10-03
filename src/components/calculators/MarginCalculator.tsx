"use client";

import { LiveCalculator } from "./LiveCalculator";
import { calcMargin } from "@/lib/calculators";

export function MarginCalculator() {
  return (
    <LiveCalculator
      fields={[
        { id: "revenue", label: "Revenue", defaultValue: 2000000, prefix: "₹", min: 0 },
        { id: "cost", label: "Total Cost", defaultValue: 1200000, prefix: "₹", min: 0 },
      ]}
      resultConfigs={[{ id: "marginPercent", label: "Margin %", format: (v) => `${v.toFixed(1)}%`, highlight: true }]}
      compute={(v) => ({ marginPercent: calcMargin(v.revenue, v.cost) })}
      interpretation={({ results }) => `Out of every ₹100 in revenue, ₹${results.marginPercent.toFixed(0)} remains as profit after costs.`}
    />
  );
}
