"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navGroups, accountNavItem, bottomNavItems } from "@/lib/nav-items";
import { Icon } from "@/components/nav/Icon";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { ProgressBootstrap } from "@/components/sync/ProgressBootstrap";
import { SyncStatusBadge } from "@/components/sync/SyncStatusBadge";

const SIDEBAR_COLLAPSE_KEY = "learner-sidebar-collapsed";

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  const base = href.split("/").slice(0, 2).join("/"); // e.g. "/learn/day/1" -> "/learn"
  return pathname === href || pathname.startsWith(base + "/") || pathname === base;
}

function NavLinks({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-5" aria-label="Main navigation">
      {navGroups.map((group, i) => (
        <div key={i}>
          {group.heading && !collapsed && (
            <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted/70">{group.heading}</p>
          )}
          <div className="flex flex-col gap-1">
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    collapsed ? "justify-center" : ""
                  } ${active ? "bg-primary/15 text-primary font-medium" : "text-muted hover:bg-bg-elevated hover:text-foreground"}`}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon name={item.icon} size={18} className="shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

/** The learner app's shell - shared by the authenticated (app) group (dashboard, progress,
 * journal, achievements, etc.) and the (public) group (roadmap, glossary, calculators, case
 * studies, simulator), which are both "the learner app" for Phase 5.5's purposes (as distinct
 * from the (marketing) group's own separate header/footer, and the Founder Control Center's own
 * FounderShell). A collapsible desktop sidebar (grouped Primary/Tools/Yours, Account pinned at
 * the bottom) replaces the old flat link list; collapse state persists in localStorage only -
 * no new DB column, nothing server-visible, pure UI state (docs/PHASE-5.5.md "Data Safety": "UI
 * changes must be presentation-only unless a small UI-state change is necessary"). Mobile adds a
 * genuine bottom navigation bar, which did not exist before this redesign. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Reads a browser-only API (localStorage) that cannot run during SSR, so the real value is
    // deliberately not known until after mount - the `invisible` class above hides the sidebar
    // for that one frame instead of flashing the wrong width. This is the standard "sync state
    // from an external, browser-only source on mount" case the lint rule's own guidance names as
    // an accepted use of setState-in-effect, not something a lazy initializer can safely replace
    // (that would read window/localStorage during SSR too and risk a hydration mismatch).
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCollapsed(localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === "1");
    } catch {
      // localStorage unavailable (private mode, etc.) - default to expanded, never throw.
    }
    setHydrated(true);
  }, []);

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem(SIDEBAR_COLLAPSE_KEY, next ? "1" : "0");
    } catch {
      // Best-effort only; collapse still works for this session even if persistence fails.
    }
  }

  function closeDrawer() {
    setDrawerOpen(false);
    menuButtonRef.current?.focus();
  }

  useEffect(() => {
    if (!drawerOpen) return;
    closeButtonRef.current?.focus();
    document.body.style.overflow = "hidden";

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeDrawer();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <div className="min-h-screen flex">
      <ProgressBootstrap />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:bg-primary focus:text-primary-foreground focus:px-3 focus:py-2 focus:rounded-lg"
      >
        Skip to main content
      </a>

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col border-r border-border bg-bg-elevated py-6 shrink-0 h-screen sticky top-0 overflow-y-auto scrollbar-thin print:hidden transition-[width] duration-200 ${
          collapsed ? "w-[72px] px-2" : "w-64 px-4"
        } ${hydrated ? "" : "invisible"}`}
      >
        <div className={`flex items-center mb-6 ${collapsed ? "justify-center" : "justify-between px-2"}`}>
          <Link href="/dashboard" className="flex items-center gap-2 min-w-0">
            <span className="text-2xl shrink-0" aria-hidden>🎓</span>
            {!collapsed && <span className="font-semibold text-lg leading-tight truncate">90-Day<br />Business School</span>}
          </Link>
        </div>

        <div className="flex-1">
          <NavLinks collapsed={collapsed} />
        </div>

        <div className="mt-4 pt-4 border-t border-border flex flex-col gap-1">
          <Link
            href={accountNavItem.href}
            title={collapsed ? accountNavItem.label : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${collapsed ? "justify-center" : ""} ${
              isActive(pathname, accountNavItem.href) ? "bg-primary/15 text-primary font-medium" : "text-muted hover:bg-bg-elevated hover:text-foreground"
            }`}
          >
            <Icon name={accountNavItem.icon} size={18} className="shrink-0" />
            {!collapsed && <span>{accountNavItem.label}</span>}
          </Link>
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted hover:bg-bg-elevated hover:text-foreground transition-colors ${collapsed ? "justify-center" : ""}`}
          >
            <Icon name={collapsed ? "ChevronsRight" : "ChevronsLeft"} size={18} className="shrink-0" />
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={closeDrawer} aria-hidden="true" />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="absolute left-0 top-0 h-full w-72 bg-bg-elevated border-r border-border px-4 py-6 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6 px-2">
              <Link href="/dashboard" className="flex items-center gap-2" onClick={closeDrawer}>
                <span className="text-2xl" aria-hidden>🎓</span>
                <span className="font-semibold leading-tight">90-Day Business School</span>
              </Link>
              <button ref={closeButtonRef} onClick={closeDrawer} aria-label="Close menu">
                <Icon name="X" size={20} />
              </button>
            </div>
            <NavLinks onNavigate={closeDrawer} />
            <div className="mt-5 pt-4 border-t border-border">
              <Link
                href={accountNavItem.href}
                onClick={closeDrawer}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted hover:bg-bg-elevated hover:text-foreground transition-colors"
              >
                <Icon name={accountNavItem.icon} size={18} />
                {accountNavItem.label}
              </Link>
            </div>
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center gap-3 border-b border-border px-4 py-3 lg:px-6 sticky top-0 bg-bg/95 backdrop-blur z-30 print:hidden">
          <button ref={menuButtonRef} className="lg:hidden" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
            <Icon name="Menu" size={22} />
          </button>
          <div className="flex-1">
            <GlobalSearch />
          </div>
          <SyncStatusBadge />
        </header>
        <main
          id="main-content"
          className="flex-1 px-4 py-6 lg:px-8 lg:py-8 max-w-6xl w-full mx-auto pb-24 lg:pb-8"
        >
          {children}
        </main>

        {/* Mobile bottom navigation - did not exist before (docs/PHASE-5.5.md "Mobile Shell") */}
        <nav
          aria-label="Bottom navigation"
          className="lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-bg/95 backdrop-blur print:hidden"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="grid grid-cols-4">
            {bottomNavItems.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] transition-colors ${
                    active ? "text-primary" : "text-muted"
                  }`}
                >
                  <Icon name={item.icon} size={21} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
