export const journalCategories = [
  "Business idea",
  "Customer problem",
  "Interesting company",
  "Lesson",
  "Business calculation",
  "Startup idea",
  "Market observation",
] as const;

export type JournalCategory = (typeof journalCategories)[number];

export interface JournalEntry {
  id: string;
  category: JournalCategory;
  text: string;
  createdAt: string; // ISO date
}

export function createJournalEntry(category: JournalCategory, text: string): JournalEntry {
  return { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, category, text, createdAt: new Date().toISOString() };
}
