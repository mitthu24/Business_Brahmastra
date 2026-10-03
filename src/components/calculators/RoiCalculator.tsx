"use client";

import { LiveCalculator } from "./LiveCalculator";
import { calcROI } from "@/lib/calculators";

export function RoiCalculator() {
  return (
    <LiveCalculator
      fields={[
        { id: "gain", label: "Gain (net profit from investment — enter negative for a loss)", defaultValue: 20000, prefix: "₹" },
        { id: "investment", label: "Investment", defaultValue: 100000, prefix: "₹", min: 0 },
      ]}
      resultConfigs={[{ id: "roi", label: "ROI", format: (v) => `${v.toFixed(1)}%`, highlight: true }]}
      compute={(v) => ({ roi: calcROI(v.gain, v.investment) })}
      interpretation={({ results }) => `For every ₹100 invested, you gained about ₹${results.roi.toFixed(0)} in return.`}
    />
  );
}
