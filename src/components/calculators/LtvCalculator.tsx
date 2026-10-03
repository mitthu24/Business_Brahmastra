"use client";

import { LiveCalculator } from "./LiveCalculator";
import { calcLTV, calcLtvCacRatio } from "@/lib/calculators";

export function LtvCalculator() {
  return (
    <LiveCalculator
      fields={[
        { id: "arpu", label: "Average Monthly Revenue per Customer", defaultValue: 500, prefix: "₹" },
        { id: "lifetime", label: "Customer Lifetime (months)", defaultValue: 20 },
        { id: "cac", label: "CAC (for comparison)", defaultValue: 2500, prefix: "₹" },
      ]}
      resultConfigs={[
        { id: "ltv", label: "LTV", format: (v) => `₹${v.toLocaleString("en-IN")}`, highlight: true },
        { id: "ratio", label: "LTV : CAC Ratio", format: (v) => `${v.toFixed(1)} : 1` },
      ]}
      compute={(v) => {
        const ltv = calcLTV(v.arpu, v.lifetime);
        return { ltv, ratio: calcLtvCacRatio(ltv, v.cac) };
      }}
    />
  );
}
