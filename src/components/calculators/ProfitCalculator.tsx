"use client";

import { LiveCalculator } from "./LiveCalculator";
import { calcProfit } from "@/lib/calculators";

export function ProfitCalculator() {
  return (
    <LiveCalculator
      fields={[
        { id: "revenue", label: "Revenue", defaultValue: 1000000, prefix: "₹" },
        { id: "cost", label: "Total Cost", defaultValue: 700000, prefix: "₹" },
      ]}
      resultConfigs={[
        { id: "profit", label: "Profit", format: (v) => `₹${v.toLocaleString("en-IN")}`, highlight: true },
        { id: "marginPercent", label: "Margin %", format: (v) => `${v.toFixed(1)}%` },
      ]}
      compute={(v) => {
        const { profit, marginPercent } = calcProfit(v.revenue, v.cost);
        return { profit, marginPercent };
      }}
    />
  );
}
