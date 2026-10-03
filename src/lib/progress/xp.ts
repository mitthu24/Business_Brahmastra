export const XP_REWARDS = {
  lessonComplete: 50,
  exercise: 25,
  quiz: 25,
  caseStudy: 50,
  finalProject: 500,
} as const;

export type XpEventType = keyof typeof XP_REWARDS;

export function xpForEvent(type: XpEventType): number {
  return XP_REWARDS[type];
}

export interface QuizAnswer {
  questionId: string;
  selectedIndex: number;
  correctIndex: number;
}

export interface QuizResult {
  correctCount: number;
  total: number;
  accuracyPercent: number;
  xpEarned: number;
}

/** Scores a quiz attempt. XP is only awarded once — callers must track whether a quiz was already completed. */
export function scoreQuiz(answers: QuizAnswer[]): QuizResult {
  const total = answers.length;
  const correctCount = answers.filter((a) => a.selectedIndex === a.correctIndex).length;
  const accuracyPercent = total === 0 ? 0 : Math.round((correctCount / total) * 100);
  const xpEarned = total > 0 ? xpForEvent("quiz") : 0;
  return { correctCount, total, accuracyPercent, xpEarned };
}
