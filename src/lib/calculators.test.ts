import { describe, it, expect } from "vitest";
import {
  calcProfit,
  calcBreakEven,
  calcROI,
  calcCAC,
  calcLTV,
  calcLtvCacRatio,
  calcConversionRate,
  calcChurnRate,
  calcRetentionRate,
  calcRunway,
  calcPostMoneyValuation,
  calcInvestorOwnership,
  calcPaybackPeriodMonths,
} from "./calculators";

describe("calcProfit", () => {
  it("matches the restaurant example from the curriculum", () => {
    const { profit, marginPercent } = calcProfit(10_00_000, 7_00_000);
    expect(profit).toBe(3_00_000);
    expect(marginPercent).toBeCloseTo(30, 5);
  });

  it("returns 0% margin when revenue is 0", () => {
    expect(calcProfit(0, 0).marginPercent).toBe(0);
  });
});

describe("calcBreakEven", () => {
  it("matches the worked example (Fixed 2,00,000 / Contribution 400 = 500 units)", () => {
    const { contributionPerUnit, breakEvenUnits } = calcBreakEven(2_00_000, 1000, 600);
    expect(contributionPerUnit).toBe(400);
    expect(breakEvenUnits).toBe(500);
  });

  it("rounds up fractional break-even units (can't sell a fraction of a unit)", () => {
    const { breakEvenUnits } = calcBreakEven(5_00_000, 2000, 200);
    expect(breakEvenUnits).toBe(278); // 5,00,000 / 1,800 = 277.77 -> 278
  });

  it("returns Infinity when contribution per unit is zero or negative", () => {
    expect(calcBreakEven(1000, 100, 100).breakEvenUnits).toBe(Infinity);
    expect(calcBreakEven(1000, 100, 150).breakEvenUnits).toBe(Infinity);
  });
});

describe("calcROI", () => {
  it("computes ROI as gain divided by investment", () => {
    expect(calcROI(20_000, 1_00_000)).toBeCloseTo(20, 5);
  });

  it("returns 0 when investment is 0", () => {
    expect(calcROI(1000, 0)).toBe(0);
  });
});

describe("calcCAC", () => {
  it("matches the worked example (5,00,000 / 50 = 10,000)", () => {
    expect(calcCAC(5_00_000, 50)).toBe(10_000);
  });

  it("returns 0 when there are no new customers", () => {
    expect(calcCAC(5000, 0)).toBe(0);
  });
});

describe("calcLTV and calcLtvCacRatio", () => {
  it("matches the worked example (500 x 20 = 10,000 LTV)", () => {
    expect(calcLTV(500, 20)).toBe(10_000);
  });

  it("computes a healthy 4:1 LTV:CAC ratio", () => {
    expect(calcLtvCacRatio(10_000, 2500)).toBe(4);
  });
});

describe("calcConversionRate", () => {
  it("matches the worked example (50/1000 = 5%)", () => {
    expect(calcConversionRate(50, 1000)).toBe(5);
  });
});

describe("calcChurnRate and calcRetentionRate", () => {
  it("computes churn and retention as complementary percentages", () => {
    expect(calcChurnRate(80, 1000)).toBe(8);
    expect(calcRetentionRate(920, 1000)).toBe(92);
  });
});

describe("calcRunway", () => {
  it("matches the worked example (50,00,000 / 10,00,000 = 5 months)", () => {
    expect(calcRunway(50_00_000, 10_00_000)).toBe(5);
  });

  it("returns Infinity when there is no net burn", () => {
    expect(calcRunway(50_00_000, 0)).toBe(Infinity);
  });
});

describe("calcPostMoneyValuation and calcInvestorOwnership", () => {
  it("matches the worked example (9 crore pre-money + 1 crore = 10 crore post-money, 10% ownership)", () => {
    const postMoney = calcPostMoneyValuation(9_00_00_000, 1_00_00_000);
    expect(postMoney).toBe(10_00_00_000);
    expect(calcInvestorOwnership(1_00_00_000, postMoney)).toBe(10);
  });
});

describe("calcPaybackPeriodMonths", () => {
  it("matches the worked example (2500 / 500 = 5 months)", () => {
    expect(calcPaybackPeriodMonths(2500, 500)).toBe(5);
  });
});
