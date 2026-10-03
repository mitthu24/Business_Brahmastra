// Shared category lists for the reference-content CMS (Phase 5.3 slice 2). Kept separate from
// content-actions.ts because a "use server" file may only export async functions - plain constants
// have to live elsewhere to be importable from both the server actions and the founder UI.
export const FORMULA_CATEGORIES = ["Finance", "Marketing", "Sales", "Growth", "Operations", "Startup"] as const;

export const CASE_STUDY_CATEGORIES = [
  "SaaS",
  "E-commerce",
  "Fintech",
  "Food",
  "Retail",
  "Manufacturing",
  "Marketplace",
  "Consumer",
  "Indian Startups",
  "Global Companies",
] as const;
