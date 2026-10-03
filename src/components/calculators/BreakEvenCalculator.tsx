"use client";

import { LiveCalculator } from "./LiveCalculator";
import { calcBreakEven } from "@/lib/calculators";
import { BreakEvenChart } from "@/components/visuals/BreakEvenChart";

export function BreakEvenCalculator() {
  return (
    <LiveCalculator
      fields={[
        { id: "fixedCosts", label: "Fixed Costs", defaultValue: 200000, prefix: "₹", min: 0 },
        { id: "sellingPrice", label: "Selling Price per Unit", defaultValue: 1000, prefix: "₹", min: 0 },
        { id: "variableCost", label: "Variable Cost per Unit", defaultValue: 600, prefix: "₹", min: 0 },
      ]}
      resultConfigs={[
        { id: "contributionPerUnit", label: "Contribution per Unit", format: (v) => `₹${v.toLocaleString("en-IN")}` },
        { id: "breakEvenUnits", label: "Break-even Units", format: (v) => `${Math.ceil(v).toLocaleString("en-IN")} units`, highlight: true },
      ]}
      compute={(v) => {
        const { contributionPerUnit, breakEvenUnits } = calcBreakEven(v.fixedCosts, v.sellingPrice, v.variableCost);
        return { contributionPerUnit, breakEvenUnits };
      }}
      chart={({ values }) => (
        <BreakEvenChart fixedCosts={values.fixedCosts} sellingPrice={values.sellingPrice} variableCost={values.variableCost} />
      )}
      interpretation={({ results }) =>
        Number.isFinite(results.breakEvenUnits)
          ? `You need to sell about ${Math.ceil(results.breakEvenUnits).toLocaleString("en-IN")} units before this business starts making a profit. Every unit sold beyond that point adds ₹${results.contributionPerUnit.toLocaleString("en-IN")} of pure profit.`
          : "At this price and cost combination, you can never cover your fixed costs — the selling price needs to be higher than the variable cost per unit."
      }
    />
  );
}
