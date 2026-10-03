export interface WizardStep {
  id: string;
  stepNumber: number;
  title: string;
  prompt: string;
}

export const wizardSteps: WizardStep[] = [
  { id: "idea", stepNumber: 1, title: "Business Idea", prompt: "In one or two sentences, what is your business idea?" },
  { id: "problem", stepNumber: 2, title: "Problem", prompt: "What specific, painful problem does this solve? For whom?" },
  { id: "customer", stepNumber: 3, title: "Customer", prompt: "Who exactly is your target customer? Describe your ICP." },
  { id: "market", stepNumber: 4, title: "Market", prompt: "Roughly estimate your TAM, SAM, and SOM." },
  { id: "competition", stepNumber: 5, title: "Competition", prompt: "Who are your competitors or current alternatives? What's their biggest weakness?" },
  { id: "product", stepNumber: 6, title: "Product", prompt: "What is your product or service, specifically?" },
  { id: "businessModel", stepNumber: 7, title: "Business Model", prompt: "How exactly will you make money? (subscription, commission, direct sale, etc.)" },
  { id: "pricing", stepNumber: 8, title: "Pricing", prompt: "What will you charge, and why will your ICP pay that price?" },
  { id: "marketing", stepNumber: 9, title: "Marketing", prompt: "How will customers first hear about you, and what message will you lead with?" },
  { id: "sales", stepNumber: 10, title: "Sales", prompt: "How does a lead become a paying customer? Describe your funnel." },
  { id: "operations", stepNumber: 11, title: "Operations", prompt: "How will you actually deliver your product/service, day to day?" },
  { id: "team", stepNumber: 12, title: "Team", prompt: "Who is on your team, and what key roles (CEO/CTO/etc.) are covered or missing?" },
  { id: "financialModel", stepNumber: 13, title: "Financial Model", prompt: "Rough revenue, costs, and expected margin for your first year." },
  { id: "growth", stepNumber: 14, title: "Growth", prompt: "How will you acquire, retain, and grow your customer base over time?" },
  { id: "funding", stepNumber: 15, title: "Funding", prompt: "Will you bootstrap, take debt, or raise equity? Why?" },
  { id: "risks", stepNumber: 16, title: "Risks", prompt: "What are your biggest risks, and how will you mitigate them?" },
  { id: "finalPitch", stepNumber: 17, title: "Final Pitch", prompt: "Write your one-paragraph elevator pitch: problem, solution, market, and why you." },
];

export type WizardAnswers = Record<string, string>;

export function emptyWizardAnswers(): WizardAnswers {
  return Object.fromEntries(wizardSteps.map((s) => [s.id, ""]));
}

export function isWizardComplete(answers: WizardAnswers): boolean {
  return wizardSteps.every((s) => (answers[s.id] ?? "").trim().length > 0);
}

export function completionPercent(answers: WizardAnswers): number {
  const filled = wizardSteps.filter((s) => (answers[s.id] ?? "").trim().length > 0).length;
  return Math.round((filled / wizardSteps.length) * 100);
}
