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
      interpretation={({ results }) =>
        results.profit >= 0
          ? `For every ₹100 of revenue, this business keeps about ₹${results.marginPercent.toFixed(0)} as profit after costs.`
          : `This business is currently losing ₹${Math.abs(results.profit).toLocaleString("en-IN")} — costs exceed revenue.`
      }
    />
  );
}
