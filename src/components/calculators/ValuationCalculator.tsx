"use client";

import { LiveCalculator } from "./LiveCalculator";
import { calcPostMoneyValuation, calcInvestorOwnership } from "@/lib/calculators";
import { FundingDilutionDiagram } from "@/components/visuals/FundingDilutionDiagram";

export function ValuationCalculator() {
  return (
    <LiveCalculator
      fields={[
        { id: "preMoney", label: "Pre-money Valuation", defaultValue: 90000000, prefix: "₹" },
        { id: "investment", label: "Investment Amount", defaultValue: 10000000, prefix: "₹" },
      ]}
      resultConfigs={[
        { id: "postMoney", label: "Post-money Valuation", format: (v) => `₹${v.toLocaleString("en-IN")}`, highlight: true },
        { id: "ownership", label: "Investor Ownership", format: (v) => `${v.toFixed(1)}%` },
      ]}
      compute={(v) => {
        const postMoney = calcPostMoneyValuation(v.preMoney, v.investment);
        return { postMoney, ownership: calcInvestorOwnership(v.investment, postMoney) };
      }}
      chart={({ results }) => (
        <FundingDilutionDiagram previousOwnershipPercent={100} newInvestorOwnershipPercent={results.ownership} />
      )}
      interpretation={({ results }) =>
        `By accepting this investment, the founder's ownership moves from 100% to ${(100 - results.ownership).toFixed(1)}% — the new investor takes ${results.ownership.toFixed(1)}% of a now larger, better-funded company.`
      }
    />
  );
}
