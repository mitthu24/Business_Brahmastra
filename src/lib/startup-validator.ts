export interface ValidatorInput {
  idea: string;
  targetCustomer: string;
  problem: string;
  solution: string;
  price: string;
  competitors: string;
}

export type ChecklistStatus = "strong" | "needs-work" | "missing";

export interface ChecklistItem {
  id: string;
  title: string;
  status: ChecklistStatus;
  note: string;
}

function assess(value: string, minLength = 15): ChecklistItem["status"] {
  const trimmed = value.trim();
  if (trimmed.length === 0) return "missing";
  if (trimmed.length < minLength) return "needs-work";
  return "strong";
}

/**
 * Generates a Startup Readiness Checklist — a structured self-assessment, NOT a prediction of success.
 * All heuristics are simple completeness/specificity checks on the founder's own input.
 */
export function buildReadinessChecklist(input: ValidatorInput): ChecklistItem[] {
  const items: ChecklistItem[] = [];

  const problemStatus = assess(input.problem, 20);
  items.push({
    id: "problem-clarity",
    title: "Problem Clarity",
    status: problemStatus,
    note:
      problemStatus === "missing"
        ? "You haven't described the problem yet. Can you state it in one sentence, without mentioning your solution?"
        : problemStatus === "needs-work"
        ? "Your problem statement is quite short. Try to be more specific: who feels this pain, and how often?"
        : "You've described a specific problem. Make sure you can state it without ever mentioning your own product (Day 9).",
  });

  const customerStatus = assess(input.targetCustomer, 15);
  items.push({
    id: "customer-clarity",
    title: "Customer Clarity",
    status: customerStatus,
    note:
      customerStatus === "missing"
        ? "Define your target customer — who exactly are you building this for?"
        : customerStatus === "needs-work"
        ? "Try narrowing this further into a specific ICP (Day 16) rather than a broad group."
        : "Good — a specific target customer. Revisit Day 16-17 (ICP and Persona) to sharpen this further.",
  });

  const hasCompetitors = input.competitors.trim().length > 0;
  items.push({
    id: "market-clarity",
    title: "Market Clarity",
    status: hasCompetitors ? (input.competitors.trim().length < 15 ? "needs-work" : "strong") : "missing",
    note: hasCompetitors
      ? "You've named competitors or alternatives. Revisit Day 18 (TAM/SAM/SOM) to size the realistic opportunity."
      : "List at least 1-2 competitors or current alternatives — even 'doing nothing' or 'Excel' counts as an alternative.",
  });

  const solutionStatus = assess(input.solution, 20);
  const differentiationStrong = hasCompetitors && solutionStatus === "strong";
  items.push({
    id: "differentiation",
    title: "Differentiation",
    status: differentiationStrong ? "strong" : solutionStatus === "missing" ? "missing" : "needs-work",
    note: differentiationStrong
      ? "You have both a solution and named alternatives — make sure your solution is specifically better for your ICP, not just 'different' (Day 32 Positioning)."
      : "Describe specifically how your solution differs from the alternatives you listed — this is your positioning (Day 32).",
  });

  const hasPrice = input.price.trim().length > 0;
  items.push({
    id: "monetization",
    title: "Monetization",
    status: hasPrice ? "strong" : "missing",
    note: hasPrice
      ? "You've defined a price. Double-check this against your ICP's willingness to pay and your business model choice (Day 4)."
      : "You haven't defined how you'll charge yet. Even a rough price helps you reason about unit economics (Day 57).",
  });

  items.push({
    id: "validation-plan",
    title: "Validation Plan",
    status: "needs-work",
    note: "This checklist can't verify real-world validation for you. Have you gathered real evidence (pre-orders, pilot customers) yet, per Day 11? If not, that's your next concrete step.",
  });

  items.push({
    id: "mvp-scope",
    title: "MVP Scope",
    status: solutionStatus === "strong" ? "needs-work" : "missing",
    note: "Define the smallest version of your solution that a real customer could use this week (Day 12). This checklist doesn't know your MVP scope — write it down separately.",
  });

  items.push({
    id: "risk-areas",
    title: "Risk Areas",
    status: "needs-work",
    note: "Every idea has risk. Name your single riskiest assumption (Day 8) and how you'll test it cheaply this week.",
  });

  return items;
}
