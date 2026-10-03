export interface CalculatorMeta {
  slug: string;
  title: string;
  description: string;
  icon: string;
}

export const calculatorMeta: CalculatorMeta[] = [
  { slug: "profit", title: "Profit Calculator", description: "Find profit and margin from revenue and cost.", icon: "IndianRupee" },
  { slug: "margin", title: "Margin Calculator", description: "Calculate gross/net margin percentage.", icon: "Percent" },
  { slug: "break-even", title: "Break-even Calculator", description: "Find the break-even point in units sold.", icon: "Scale" },
  { slug: "roi", title: "ROI Calculator", description: "Calculate return on investment.", icon: "TrendingUp" },
  { slug: "cac", title: "CAC Calculator", description: "Calculate customer acquisition cost.", icon: "Users" },
  { slug: "ltv", title: "LTV Calculator", description: "Calculate customer lifetime value.", icon: "Heart" },
  { slug: "conversion", title: "Conversion Calculator", description: "Calculate visitor-to-customer conversion rate.", icon: "MousePointerClick" },
  { slug: "churn", title: "Churn Calculator", description: "Calculate customer churn rate.", icon: "UserMinus" },
  { slug: "retention", title: "Retention Calculator", description: "Calculate customer retention rate.", icon: "UserCheck" },
  { slug: "runway", title: "Startup Runway Calculator", description: "Calculate how many months of cash remain.", icon: "Timer" },
  { slug: "valuation", title: "Valuation Calculator", description: "Calculate post-money valuation and investor ownership.", icon: "Landmark" },
  { slug: "dilution", title: "Dilution Calculator", description: "Calculate founder ownership after a funding round.", icon: "PieChart" },
];
