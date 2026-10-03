import type { Phase } from "./types";

export const phases: Phase[] = [
  { id: "business", number: 1, title: "Business Foundation", description: "What a business actually is, how it makes money, and who it serves.", icon: "Brain", startDay: 1, endDay: 7 },
  { id: "startup", number: 2, title: "Startup Fundamentals", description: "Problems, ideas, validation, MVPs, and product-market fit.", icon: "Rocket", startDay: 8, endDay: 14 },
  { id: "customer", number: 3, title: "Customer & Market", description: "Who you serve and how big the opportunity really is.", icon: "Users", startDay: 15, endDay: 21 },
  { id: "product", number: 4, title: "Product Management", description: "Building the right thing, and building it well.", icon: "Lightbulb", startDay: 22, endDay: 28 },
  { id: "marketing", number: 5, title: "Marketing", description: "Getting the right message in front of the right people.", icon: "Megaphone", startDay: 29, endDay: 35 },
  { id: "sales", number: 6, title: "Sales", description: "Turning interest into paying customers.", icon: "Handshake", startDay: 36, endDay: 42 },
  { id: "operations", number: 7, title: "Operations", description: "Running the business efficiently, day after day.", icon: "Settings", startDay: 43, endDay: 49 },
  { id: "finance", number: 8, title: "Business Finance", description: "Reading the numbers that tell you if the business is healthy.", icon: "BarChart3", startDay: 50, endDay: 58 },
  { id: "legal", number: 9, title: "Tax & Legal Basics", description: "Structures, GST, and compliance every founder should know.", icon: "Scale", startDay: 59, endDay: 63 },
  { id: "management", number: 10, title: "People & Management", description: "Hiring, leading, and building culture.", icon: "UserCog", startDay: 64, endDay: 68 },
  { id: "funding", number: 11, title: "Funding & Investment", description: "Bootstrapping, debt, equity, and how valuation really works.", icon: "Wallet", startDay: 69, endDay: 74 },
  { id: "growth", number: 12, title: "Growth & Scale", description: "Acquiring, activating, and retaining customers at scale.", icon: "TrendingUp", startDay: 75, endDay: 80 },
  { id: "strategy", number: 13, title: "Business Strategy", description: "Thinking like a strategist, not just an operator.", icon: "Target", startDay: 81, endDay: 85 },
  { id: "analysis", number: 14, title: "Real Business Analysis", description: "Breaking down real companies the way an investor would.", icon: "SearchCheck", startDay: 86, endDay: 88 },
  { id: "founder-project", number: 15, title: "Founder Project", description: "Build and pitch your own business from scratch.", icon: "Trophy", startDay: 89, endDay: 90 },
];

export function getPhaseForDay(day: number): Phase {
  const phase = phases.find((p) => day >= p.startDay && day <= p.endDay);
  if (!phase) throw new Error(`No phase found for day ${day}`);
  return phase;
}
