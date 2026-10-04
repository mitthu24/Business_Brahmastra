export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

/** Grouped for the redesigned learner sidebar (docs/PHASE-5.5.md "Desktop Shell": Primary /
 * Secondary / Personal / Account). Flattened via `navItems` below for anything that just needs
 * the full list (active-route matching, mobile drawer, search). */
export const navGroups: { heading: string | null; items: NavItem[] }[] = [
  {
    heading: null,
    items: [
      { href: "/dashboard", label: "Home", icon: "LayoutDashboard" },
      { href: "/roadmap", label: "90-Day Journey", icon: "Map" },
      { href: "/learn/day/1", label: "Learn", icon: "BookOpen" },
      { href: "/progress", label: "Progress", icon: "LineChart" },
    ],
  },
  {
    heading: "Tools",
    items: [
      { href: "/calculators", label: "Calculators", icon: "Calculator" },
      { href: "/formulas", label: "Formula Library", icon: "Sigma" },
      { href: "/glossary", label: "Business Glossary", icon: "BookMarked" },
      { href: "/case-studies", label: "Case Studies", icon: "Building2" },
      { href: "/simulator", label: "Business Simulator", icon: "Gamepad2" },
      { href: "/business-model-canvas", label: "Business Model Canvas", icon: "LayoutGrid" },
      { href: "/startup-validator", label: "Startup Validator", icon: "Rocket" },
    ],
  },
  {
    heading: "Yours",
    items: [
      { href: "/journal", label: "Founder Journal", icon: "NotebookPen" },
      { href: "/achievements", label: "Achievements", icon: "Trophy" },
      { href: "/final-project", label: "Final Project", icon: "GraduationCap" },
    ],
  },
];

export const accountNavItem: NavItem = { href: "/account", label: "Account", icon: "User" };

export const navItems: NavItem[] = [...navGroups.flatMap((g) => g.items), accountNavItem];

/** The 4 destinations the mobile bottom nav prioritizes (docs/PHASE-5.5.md "Mobile Shell"). */
export const bottomNavItems: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: "LayoutDashboard" },
  { href: "/learn/day/1", label: "Learn", icon: "BookOpen" },
  { href: "/progress", label: "Progress", icon: "LineChart" },
  { href: "/account", label: "Profile", icon: "User" },
];
