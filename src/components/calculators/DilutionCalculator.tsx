"use client";

import { LiveCalculator } from "./LiveCalculator";
import { calcDilution } from "@/lib/calculators";

export function DilutionCalculator() {
  return (
    <LiveCalculator
      fields={[
        { id: "previousOwnership", label: "Your Current Ownership %", defaultValue: 100, suffix: "%" },
        { id: "newInvestorPercent", label: "New Investor's Ownership %", defaultValue: 20, suffix: "%" },
      ]}
      resultConfigs={[
        { id: "newOwnershipPercent", label: "Your Ownership After Round", format: (v) => `${v.toFixed(1)}%`, highlight: true },
        { id: "dilutionPoints", label: "Dilution (percentage points lost)", format: (v) => `${v.toFixed(1)} pts` },
      ]}
      compute={(v) => calcDilution(v.previousOwnership, v.newInvestorPercent)}
    />
  );
}
