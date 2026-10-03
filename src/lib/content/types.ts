// Core content data model for the 90-Day Business School curriculum.
// Content is kept separate from UI so it can later move to an admin-managed source.

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ExerciseBlock {
  prompt: string;
  answer: string;
}

export interface Lesson {
  id: string; // e.g. "day-24"
  day: number; // 1-90
  phaseId: string;
  title: string;
  slug: string;
  objective: string;
  concept: string;
  simpleExplanation: string;
  analogy: string;
  businessExample: string;
  indiaExample?: string;
  startupExample?: string;
  formula?: {
    name: string;
    expression: string;
    workedExample: string;
  };
  mnemonic?: {
    label: string;
    breakdown: string[];
  };
  commonMistake: string;
  exercise: ExerciseBlock;
  caseStudy: string;
  founderQuestion: string;
  quiz: QuizQuestion[];
  takeaways: string[];
  rememberThis: string;
}

export interface Phase {
  id: string;
  number: number;
  title: string;
  description: string;
  icon: string;
  startDay: number;
  endDay: number;
}

export interface FormulaEntry {
  id: string;
  name: string;
  category: "Finance" | "Marketing" | "Sales" | "Growth" | "Operations" | "Startup";
  expression: string;
  explanation: string;
  example: string;
}

export interface GlossaryEntry {
  term: string;
  slug: string;
  definition: string;
  example: string;
  formula?: string;
  mnemonic?: string;
  relatedTerms: string[];
}

export interface CaseStudyEntry {
  id: string;
  company: string;
  category:
    | "SaaS"
    | "E-commerce"
    | "Fintech"
    | "Food"
    | "Retail"
    | "Manufacturing"
    | "Marketplace"
    | "Consumer"
    | "Indian Startups"
    | "Global Companies";
  industry: string;
  factType: "documented" | "illustrative";
  problem: string;
  solution: string;
  customer: string;
  businessModel: string;
  revenueModel: string;
  growth: string;
  competition: string;
  challenges: string;
  lessons: string[];
}
