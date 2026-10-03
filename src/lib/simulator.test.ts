import { describe, it, expect } from "vitest";
import { runSimulation, deriveSimulationOutlook } from "./simulator";

describe("runSimulation", () => {
  it("computes revenue, COGS, gross profit, OPEX, net profit, and margin correctly", () => {
    const result = runSimulation({
      price: 200,
      customers: 1000,
      marketingCost: 30000,
      employeeCost: 100000,
      rent: 50000,
      otherCostPerUnit: 70,
    });
    expect(result.revenue).toBe(200000);
    expect(result.cogs).toBe(70000);
    expect(result.grossProfit).toBe(130000);
    expect(result.operatingExpenses).toBe(180000);
    expect(result.netProfit).toBe(-50000);
    expect(result.cashBurn).toBe(50000);
  });

  it("reports zero cash burn when net profit is positive", () => {
    const result = runSimulation({
      price: 1000,
      customers: 1000,
      marketingCost: 50000,
      employeeCost: 100000,
      rent: 50000,
      otherCostPerUnit: 300,
    });
    expect(result.netProfit).toBeGreaterThan(0);
    expect(result.cashBurn).toBe(0);
  });

  it("computes break-even units using the contribution margin", () => {
    const result = runSimulation({
      price: 1000,
      customers: 500,
      marketingCost: 100000,
      employeeCost: 100000,
      rent: 0,
      otherCostPerUnit: 600,
    });
    // contribution per unit = 400, OPEX = 200000 -> break-even = 500 units
    expect(result.breakEvenUnits).toBe(500);
  });

  it("returns Infinity break-even when contribution per unit is zero or negative", () => {
    const result = runSimulation({
      price: 100,
      customers: 10,
      marketingCost: 1000,
      employeeCost: 1000,
      rent: 1000,
      otherCostPerUnit: 150,
    });
    expect(result.breakEvenUnits).toBe(Infinity);
  });
});

describe("deriveSimulationOutlook", () => {
  it("rates a healthy, profitable simulation as strong with low risk", () => {
    const results = runSimulation({
      price: 1000,
      customers: 1000,
      marketingCost: 50000,
      employeeCost: 100000,
      rent: 50000,
      otherCostPerUnit: 300,
    });
    const outlook = deriveSimulationOutlook(results);
    expect(outlook.risk).toBe("Low");
    expect(outlook.growth).toBe("Strong");
  });

  it("rates a cash-burning simulation as weak growth with elevated risk", () => {
    const results = runSimulation({
      price: 200,
      customers: 500,
      marketingCost: 100000,
      employeeCost: 150000,
      rent: 80000,
      otherCostPerUnit: 150,
    });
    const outlook = deriveSimulationOutlook(results);
    expect(results.netProfit).toBeLessThan(0);
    expect(outlook.growth).toBe("Weak");
    expect(["Medium", "High"]).toContain(outlook.risk);
  });
});
