"use client";

import { LiveCalculator } from "./LiveCalculator";
import { calcBreakEven } from "@/lib/calculators";

export function BreakEvenCalculator() {
  return (
    <LiveCalculator
      fields={[
        { id: "fixedCosts", label: "Fixed Costs", defaultValue: 200000, prefix: "₹" },
        { id: "sellingPrice", label: "Selling Price per Unit", defaultValue: 1000, prefix: "₹" },
        { id: "variableCost", label: "Variable Cost per Unit", defaultValue: 600, prefix: "₹" },
      ]}
      resultConfigs={[
        { id: "contributionPerUnit", label: "Contribution per Unit", format: (v) => `₹${v.toLocaleString("en-IN")}` },
        { id: "breakEvenUnits", label: "Break-even Units", format: (v) => `${Math.ceil(v).toLocaleString("en-IN")} units`, highlight: true },
      ]}
      compute={(v) => {
        const { contributionPerUnit, breakEvenUnits } = calcBreakEven(v.fixedCosts, v.sellingPrice, v.variableCost);
        return { contributionPerUnit, breakEvenUnits };
      }}
    />
  );
}
