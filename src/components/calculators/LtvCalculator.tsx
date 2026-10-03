"use client";

import { LiveCalculator } from "./LiveCalculator";
import { calcLTV, calcLtvCacRatio } from "@/lib/calculators";
import { UnitEconomicsDiagram } from "@/components/visuals/UnitEconomicsDiagram";

export function LtvCalculator() {
  return (
    <LiveCalculator
      fields={[
        { id: "arpu", label: "Average Monthly Revenue per Customer", defaultValue: 500, prefix: "₹", min: 0 },
        { id: "lifetime", label: "Customer Lifetime (months)", defaultValue: 20, min: 0 },
        { id: "cac", label: "CAC (for comparison)", defaultValue: 2500, prefix: "₹", min: 0 },
      ]}
      resultConfigs={[
        { id: "ltv", label: "LTV", format: (v) => `₹${v.toLocaleString("en-IN")}`, highlight: true },
        { id: "ratio", label: "LTV : CAC Ratio", format: (v) => `${v.toFixed(1)} : 1` },
      ]}
      compute={(v) => {
        const ltv = calcLTV(v.arpu, v.lifetime);
        return { ltv, ratio: calcLtvCacRatio(ltv, v.cac) };
      }}
      chart={({ values }) => <UnitEconomicsDiagram arpu={values.arpu} lifetimeMonths={values.lifetime} cac={values.cac} />}
      interpretation={({ results }) =>
        Number.isFinite(results.ratio) && results.ratio >= 3
          ? `A customer is worth about ${results.ratio.toFixed(1)}x what you spend to acquire them — generally considered healthy unit economics.`
          : `A customer is only worth about ${Number.isFinite(results.ratio) ? results.ratio.toFixed(1) : "∞"}x what you spend to acquire them — below the commonly cited 3:1 healthy benchmark, worth investigating.`
      }
    />
  );
}
