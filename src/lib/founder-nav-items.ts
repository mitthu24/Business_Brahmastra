export interface FounderNavItem {
  href: string;
  label: string;
  icon: string;
}

export const founderNavItems: FounderNavItem[] = [
  { href: "/founder/dashboard", label: "Overview", icon: "LayoutDashboard" },
  { href: "/founder/users", label: "Users", icon: "Users" },
  { href: "/founder/content", label: "Content", icon: "FileText" },
  { href: "/founder/curriculum", label: "Curriculum", icon: "CalendarDays" },
  { href: "/founder/lessons", label: "Lessons", icon: "BookOpen" },
  { href: "/founder/glossary", label: "Glossary", icon: "BookMarked" },
  { href: "/founder/formulas", label: "Formulas", icon: "Sigma" },
  { href: "/founder/case-studies", label: "Case Studies", icon: "Building2" },
  { href: "/founder/calculators", label: "Calculators", icon: "Calculator" },
  { href: "/founder/exercises", label: "Exercises", icon: "ClipboardCheck" },
  { href: "/founder/quizzes", label: "Quizzes", icon: "HelpCircle" },
  { href: "/founder/achievements", label: "Achievements", icon: "Trophy" },
  { href: "/founder/analytics", label: "Analytics", icon: "LineChart" },
  { href: "/founder/settings", label: "Settings", icon: "Settings" },
  { href: "/founder/audit-log", label: "Audit Log", icon: "History" },
];
