export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/roadmap", label: "90-Day Roadmap", icon: "Map" },
  { href: "/learn/day/1", label: "Learn", icon: "BookOpen" },
  { href: "/progress", label: "Progress", icon: "LineChart" },
  { href: "/calculators", label: "Calculators", icon: "Calculator" },
  { href: "/formulas", label: "Formula Library", icon: "Sigma" },
  { href: "/glossary", label: "Business Glossary", icon: "BookMarked" },
  { href: "/case-studies", label: "Case Studies", icon: "Building2" },
  { href: "/simulator", label: "Business Simulator", icon: "Gamepad2" },
  { href: "/business-model-canvas", label: "Business Model Canvas", icon: "LayoutGrid" },
  { href: "/startup-validator", label: "Startup Validator", icon: "Rocket" },
  { href: "/journal", label: "Founder Journal", icon: "NotebookPen" },
  { href: "/achievements", label: "Achievements", icon: "Trophy" },
  { href: "/final-project", label: "Final Project", icon: "GraduationCap" },
  { href: "/account", label: "Account", icon: "User" },
];
