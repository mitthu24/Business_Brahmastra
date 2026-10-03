export interface FounderNavItem {
  href: string;
  label: string;
  icon: string;
  /** Pages not yet built in this slice of Phase 5.3 - rendered as a clear "coming soon" state
   * rather than a fake/broken page. See docs/PHASE-5.3.md "Known limitations". */
  comingSoon?: boolean;
}

export const founderNavItems: FounderNavItem[] = [
  { href: "/founder/dashboard", label: "Overview", icon: "LayoutDashboard" },
  { href: "/founder/users", label: "Users", icon: "Users" },
  { href: "/founder/content", label: "Content", icon: "FileText", comingSoon: true },
  { href: "/founder/curriculum", label: "Curriculum", icon: "CalendarDays", comingSoon: true },
  { href: "/founder/lessons", label: "Lessons", icon: "BookOpen", comingSoon: true },
  { href: "/founder/glossary", label: "Glossary", icon: "BookMarked", comingSoon: true },
  { href: "/founder/formulas", label: "Formulas", icon: "Sigma", comingSoon: true },
  { href: "/founder/case-studies", label: "Case Studies", icon: "Building2", comingSoon: true },
  { href: "/founder/calculators", label: "Calculators", icon: "Calculator", comingSoon: true },
  { href: "/founder/exercises", label: "Exercises", icon: "ClipboardCheck", comingSoon: true },
  { href: "/founder/quizzes", label: "Quizzes", icon: "HelpCircle", comingSoon: true },
  { href: "/founder/achievements", label: "Achievements", icon: "Trophy", comingSoon: true },
  { href: "/founder/analytics", label: "Analytics", icon: "LineChart", comingSoon: true },
  { href: "/founder/settings", label: "Settings", icon: "Settings", comingSoon: true },
  { href: "/founder/audit-log", label: "Audit Log", icon: "History" },
];
