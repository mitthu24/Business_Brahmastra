"use client";

import { LiveCalculator } from "./LiveCalculator";
import { calcCAC } from "@/lib/calculators";

export function CacCalculator() {
  return (
    <LiveCalculator
      fields={[
        { id: "spend", label: "Total Sales + Marketing Spend", defaultValue: 500000, prefix: "₹", min: 0 },
        { id: "customers", label: "New Customers Acquired", defaultValue: 50, min: 0 },
      ]}
      resultConfigs={[{ id: "cac", label: "CAC (per customer)", format: (v) => `₹${v.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, highlight: true }]}
      compute={(v) => ({ cac: calcCAC(v.spend, v.customers) })}
      interpretation={({ results }) => `It costs about ₹${Math.round(results.cac).toLocaleString("en-IN")} in sales and marketing spend to win one new customer.`}
    />
  );
}
