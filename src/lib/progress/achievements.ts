import { phases } from "../content/phases";

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export const achievements: Achievement[] = [
  { id: "first-step", icon: "Rocket", title: "First Step", description: "Complete Day 1" },
  { id: "seven-day-founder", icon: "Flame", title: "7-Day Founder", description: "Complete 7 days" },
  { id: "business-thinker", icon: "Brain", title: "Business Thinker", description: "Complete the Business Foundation phase" },
  { id: "money-minded", icon: "Wallet", title: "Money Minded", description: "Complete the Finance phase" },
  { id: "marketing-mind", icon: "Megaphone", title: "Marketing Mind", description: "Complete the Marketing phase" },
  { id: "sales-builder", icon: "Handshake", title: "Sales Builder", description: "Complete the Sales phase" },
  { id: "operator", icon: "Settings", title: "Operator", description: "Complete the Operations phase" },
  { id: "growth-hacker", icon: "TrendingUp", title: "Growth Hacker", description: "Complete the Growth phase" },
  { id: "founder", icon: "Trophy", title: "Founder", description: "Complete all 90 days" },
];

export interface AchievementCheckInput {
  completedDays: Set<number>;
}

function isPhaseComplete(phaseId: string, completedDays: Set<number>): boolean {
  const phase = phases.find((p) => p.id === phaseId);
  if (!phase) return false;
  for (let day = phase.startDay; day <= phase.endDay; day++) {
    if (!completedDays.has(day)) return false;
  }
  return true;
}

/** Pure function: given current progress, returns the set of achievement ids that should be unlocked. */
export function computeUnlockedAchievements({ completedDays }: AchievementCheckInput): string[] {
  const unlocked: string[] = [];

  if (completedDays.has(1)) unlocked.push("first-step");
  if (completedDays.size >= 7) unlocked.push("seven-day-founder");
  if (isPhaseComplete("business", completedDays)) unlocked.push("business-thinker");
  if (isPhaseComplete("finance", completedDays)) unlocked.push("money-minded");
  if (isPhaseComplete("marketing", completedDays)) unlocked.push("marketing-mind");
  if (isPhaseComplete("sales", completedDays)) unlocked.push("sales-builder");
  if (isPhaseComplete("operations", completedDays)) unlocked.push("operator");
  if (isPhaseComplete("growth", completedDays)) unlocked.push("growth-hacker");
  if (completedDays.size >= 90) unlocked.push("founder");

  return unlocked;
}
