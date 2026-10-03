"use client";

import { LiveCalculator } from "./LiveCalculator";
import { calcConversionRate } from "@/lib/calculators";

export function ConversionCalculator() {
  return (
    <LiveCalculator
      fields={[
        { id: "conversions", label: "Conversions (purchases/sign-ups)", defaultValue: 50 },
        { id: "visitors", label: "Visitors / Leads", defaultValue: 1000 },
      ]}
      resultConfigs={[{ id: "rate", label: "Conversion Rate", format: (v) => `${v.toFixed(1)}%`, highlight: true }]}
      compute={(v) => ({ rate: calcConversionRate(v.conversions, v.visitors) })}
    />
  );
}
