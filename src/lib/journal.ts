export interface JournalCategoryDef {
  label: string;
  icon: string;
}

export const journalCategories = [
  { label: "Idea", icon: "💡" },
  { label: "Customer", icon: "👥" },
  { label: "Market", icon: "📊" },
  { label: "Finance", icon: "💰" },
  { label: "Marketing", icon: "📣" },
  { label: "Startup", icon: "🚀" },
  { label: "Learning", icon: "🧠" },
  { label: "Company Analysis", icon: "🏢" },
] as const satisfies readonly JournalCategoryDef[];

export type JournalCategory = (typeof journalCategories)[number]["label"];

export interface JournalEntry {
  id: string;
  category: JournalCategory;
  text: string;
  createdAt: string; // ISO date
}

export function createJournalEntry(category: JournalCategory, text: string): JournalEntry {
  return { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, category, text, createdAt: new Date().toISOString() };
}

export function categoryIcon(category: string): string {
  return journalCategories.find((c) => c.label === category)?.icon ?? "📝";
}
