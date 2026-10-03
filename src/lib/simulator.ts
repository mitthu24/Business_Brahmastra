export interface SimulatorInputs {
  price: number;
  customers: number;
  marketingCost: number;
  employeeCost: number;
  rent: number;
  otherCostPerUnit: number; // treated as the per-customer material/COGS cost
}

export interface SimulatorResults {
  revenue: number;
  cogs: number;
  grossProfit: number;
  operatingExpenses: number;
  netProfit: number;
  marginPercent: number;
  breakEvenUnits: number;
  cashBurn: number;
}

export function runSimulation(inputs: SimulatorInputs): SimulatorResults {
  const revenue = inputs.price * inputs.customers;
  const cogs = inputs.otherCostPerUnit * inputs.customers;
  const grossProfit = revenue - cogs;
  const operatingExpenses = inputs.marketingCost + inputs.employeeCost + inputs.rent;
  const netProfit = grossProfit - operatingExpenses;
  const marginPercent = revenue === 0 ? 0 : (netProfit / revenue) * 100;
  const contributionPerUnit = inputs.price - inputs.otherCostPerUnit;
  const breakEvenUnits = contributionPerUnit > 0 ? Math.ceil(operatingExpenses / contributionPerUnit) : Infinity;
  const cashBurn = netProfit < 0 ? Math.abs(netProfit) : 0;

  return { revenue, cogs, grossProfit, operatingExpenses, netProfit, marginPercent, breakEvenUnits, cashBurn };
}

export type OutlookLevel = "Strong" | "Stable" | "Weak";
export type RiskLevel = "Low" | "Medium" | "High";

export interface SimulationOutlook {
  customerSatisfaction: OutlookLevel;
  risk: RiskLevel;
  growth: OutlookLevel;
}

/**
 * Derives simple, labelled outlook categories from simulation results — illustrative heuristics for
 * teaching purposes, not a prediction of real-world outcomes. Reuses runSimulation's own numbers only.
 */
export function deriveSimulationOutlook(results: SimulatorResults): SimulationOutlook {
  const customerSatisfaction: OutlookLevel = results.marginPercent >= 15 ? "Strong" : results.marginPercent >= 0 ? "Stable" : "Weak";
  const risk: RiskLevel = results.cashBurn === 0 ? "Low" : results.marginPercent >= -10 ? "Medium" : "High";
  const growth: OutlookLevel = results.netProfit > 0 && results.marginPercent >= 10 ? "Strong" : results.netProfit >= 0 ? "Stable" : "Weak";
  return { customerSatisfaction, risk, growth };
}

export interface BusinessTypeConfig {
  id: string;
  label: string;
  icon: string;
  defaults: SimulatorInputs;
}

export const businessTypes: BusinessTypeConfig[] = [
  { id: "cafe", label: "Café", icon: "Coffee", defaults: { price: 200, customers: 1200, marketingCost: 30000, employeeCost: 150000, rent: 80000, otherCostPerUnit: 70 } },
  { id: "saas", label: "SaaS", icon: "Cloud", defaults: { price: 999, customers: 500, marketingCost: 200000, employeeCost: 400000, rent: 50000, otherCostPerUnit: 100 } },
  { id: "ecommerce", label: "E-commerce", icon: "ShoppingCart", defaults: { price: 1200, customers: 800, marketingCost: 250000, employeeCost: 150000, rent: 40000, otherCostPerUnit: 700 } },
  { id: "gym", label: "Gym", icon: "Dumbbell", defaults: { price: 2000, customers: 300, marketingCost: 40000, employeeCost: 200000, rent: 150000, otherCostPerUnit: 200 } },
  { id: "retail", label: "Retail", icon: "Store", defaults: { price: 500, customers: 2000, marketingCost: 60000, employeeCost: 180000, rent: 100000, otherCostPerUnit: 320 } },
  { id: "manufacturing", label: "Manufacturing", icon: "Factory", defaults: { price: 1500, customers: 400, marketingCost: 50000, employeeCost: 350000, rent: 200000, otherCostPerUnit: 900 } },
];

export interface ScenarioOption {
  id: string;
  label: string;
  consequence: string;
}

export interface Scenario {
  id: string;
  prompt: string;
  options: ScenarioOption[];
}

export const scenarios: Scenario[] = [
  {
    id: "price-war",
    prompt: "Your competitors just reduced prices by 15%. How do you respond?",
    options: [
      { id: "match", label: "A. Reduce your price to match", consequence: "You protect market share but your margin compresses significantly — revisit your break-even point immediately, since you now need more customers just to stay profitable." },
      { id: "value", label: "B. Keep price, increase perceived value (added service/features)", consequence: "Margin stays intact, but you must invest in and clearly communicate the added value — some price-sensitive customers may still leave if the extra value isn't obvious to them." },
      { id: "premium", label: "C. Reposition toward premium customers", consequence: "You deliberately shrink your addressable market but can often sustain a healthier margin — this only works if a genuinely premium-willing segment exists for your category." },
      { id: "efficiency", label: "D. Improve operational efficiency to absorb the cut without raising prices", consequence: "This protects both price and margin, but requires real, often slow operational change (Day 44-48 territory) — it's rarely a quick fix." },
    ],
  },
  {
    id: "demand-spike",
    prompt: "Demand suddenly doubles overnight. How do you respond?",
    options: [
      { id: "scale-fast", label: "A. Hire and scale fast to meet all new demand", consequence: "You risk quality and cash flow strain if the spike is temporary — check whether this is a durable trend or a one-off spike first." },
      { id: "wait-list", label: "B. Serve existing capacity and put the rest on a waitlist", consequence: "You protect quality and avoid overcommitting resources, but may lose some impatient customers to competitors during the wait." },
      { id: "raise-price", label: "C. Raise prices to balance demand with current capacity", consequence: "This can fund capacity expansion from the demand itself, but risks alienating price-sensitive early customers who felt loyal to you." },
      { id: "partner", label: "D. Partner with another business to fulfil the overflow", consequence: "This can scale quickly without big fixed costs, but requires trust and quality control over a partner you don't fully manage." },
    ],
  },
  {
    id: "key-supplier-leaves",
    prompt: "Your single key supplier (Day 46 territory) suddenly doubles their prices. How do you respond?",
    options: [
      { id: "absorb", label: "A. Absorb the cost and keep prices the same", consequence: "Protects customer relationships short-term but directly compresses your margin — check your break-even math immediately." },
      { id: "pass-on", label: "B. Pass the cost increase on to customers", consequence: "Protects margin but risks losing price-sensitive customers, especially if competitors haven't faced the same supplier issue." },
      { id: "diversify", label: "C. Urgently find a second supplier", consequence: "Reduces future risk and may find a better price, but takes time to vet quality and reliability — a short-term cash cushion helps here." },
      { id: "substitute", label: "D. Redesign your product/process to reduce dependency on that input", consequence: "This can remove the vulnerability permanently, but may require real product or process changes that take time to validate." },
    ],
  },
];
