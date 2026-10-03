// Pure calculation functions backing the Business Calculator pages.
// Kept framework-free so they can be unit tested in isolation from React.

export function calcProfit(revenue: number, cost: number) {
  const profit = revenue - cost;
  const marginPercent = revenue === 0 ? 0 : (profit / revenue) * 100;
  return { profit, marginPercent };
}

export function calcMargin(revenue: number, cost: number) {
  return calcProfit(revenue, cost).marginPercent;
}

export function calcBreakEven(fixedCosts: number, sellingPrice: number, variableCostPerUnit: number) {
  const contributionPerUnit = sellingPrice - variableCostPerUnit;
  if (contributionPerUnit <= 0) {
    return { contributionPerUnit, breakEvenUnits: Infinity };
  }
  const breakEvenUnits = Math.ceil(fixedCosts / contributionPerUnit);
  return { contributionPerUnit, breakEvenUnits };
}

/** `gain` is the net profit/gain from the investment (not the total return). ROI = Gain ÷ Investment × 100. */
export function calcROI(gain: number, investment: number) {
  if (investment === 0) return 0;
  return (gain / investment) * 100;
}

export function calcCAC(totalSalesAndMarketingCost: number, newCustomers: number) {
  if (newCustomers === 0) return 0;
  return totalSalesAndMarketingCost / newCustomers;
}

export function calcLTV(avgRevenuePerCustomer: number, customerLifetimeMonths: number) {
  return avgRevenuePerCustomer * customerLifetimeMonths;
}

export function calcLtvCacRatio(ltv: number, cac: number) {
  if (cac === 0) return Infinity;
  return ltv / cac;
}

export function calcConversionRate(conversions: number, visitors: number) {
  if (visitors === 0) return 0;
  return (conversions / visitors) * 100;
}

export function calcChurnRate(lostCustomers: number, startingCustomers: number) {
  if (startingCustomers === 0) return 0;
  return (lostCustomers / startingCustomers) * 100;
}

export function calcRetentionRate(remainingCustomers: number, startingCustomers: number) {
  if (startingCustomers === 0) return 0;
  return (remainingCustomers / startingCustomers) * 100;
}

export function calcRunway(cashAvailable: number, monthlyNetBurn: number) {
  if (monthlyNetBurn <= 0) return Infinity;
  return cashAvailable / monthlyNetBurn;
}

export function calcPostMoneyValuation(preMoneyValuation: number, investment: number) {
  return preMoneyValuation + investment;
}

export function calcInvestorOwnership(investment: number, postMoneyValuation: number) {
  if (postMoneyValuation === 0) return 0;
  return (investment / postMoneyValuation) * 100;
}

export function calcDilution(previousOwnershipPercent: number, newInvestorOwnershipPercent: number) {
  const remainingPoolPercent = 100 - newInvestorOwnershipPercent;
  const newOwnershipPercent = previousOwnershipPercent * (remainingPoolPercent / 100);
  const dilutionPoints = previousOwnershipPercent - newOwnershipPercent;
  return { newOwnershipPercent, dilutionPoints };
}

export function calcPaybackPeriodMonths(cac: number, monthlyRevenuePerCustomer: number) {
  if (monthlyRevenuePerCustomer === 0) return Infinity;
  return cac / monthlyRevenuePerCustomer;
}
