"use client";

import { LiveCalculator } from "./LiveCalculator";
import { calcDilution } from "@/lib/calculators";
import { FundingDilutionDiagram } from "@/components/visuals/FundingDilutionDiagram";

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
      chart={({ values }) => (
        <FundingDilutionDiagram previousOwnershipPercent={values.previousOwnership} newInvestorOwnershipPercent={values.newInvestorPercent} />
      )}
      interpretation={({ results }) =>
        `You'll move from your current stake down to ${results.newOwnershipPercent.toFixed(1)}% — losing ${results.dilutionPoints.toFixed(1)} percentage points of ownership in exchange for the new investor's capital.`
      }
    />
  );
}
