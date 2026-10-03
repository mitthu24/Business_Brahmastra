"use client";

import { LiveCalculator } from "./LiveCalculator";
import { calcROI } from "@/lib/calculators";

export function RoiCalculator() {
  return (
    <LiveCalculator
      fields={[
        { id: "gain", label: "Gain (net profit from investment)", defaultValue: 20000, prefix: "₹" },
        { id: "investment", label: "Investment", defaultValue: 100000, prefix: "₹" },
      ]}
      resultConfigs={[{ id: "roi", label: "ROI", format: (v) => `${v.toFixed(1)}%`, highlight: true }]}
      compute={(v) => ({ roi: calcROI(v.gain, v.investment) })}
    />
  );
}
