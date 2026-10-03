"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/nav-items";
import { Icon } from "@/components/nav/Icon";
import { GlobalSearch } from "@/components/search/GlobalSearch";

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1" aria-label="Main navigation">
      {navItems.map((item) => {
        const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href.split("/").slice(0, 2).join("/")) && item.href !== "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
              active ? "bg-primary/15 text-primary font-medium" : "text-muted hover:bg-bg-elevated hover:text-foreground"
            }`}
            aria-current={active ? "page" : undefined}
          >
            <Icon name={item.icon} size={18} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  function closeDrawer() {
    setDrawerOpen(false);
    // Return focus to the trigger so keyboard users land back where they started, never trapped.
    menuButtonRef.current?.focus();
  }

  useEffect(() => {
    if (!drawerOpen) return;
    // Move focus into the drawer when it opens.
    closeButtonRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeDrawer();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen]);

  return (
    <div className="min-h-screen flex">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:bg-primary focus:text-primary-foreground focus:px-3 focus:py-2 focus:rounded-lg"
      >
        Skip to main content
      </a>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-bg-elevated px-4 py-6 shrink-0 h-screen sticky top-0 overflow-y-auto scrollbar-thin print:hidden">
        <Link href="/" className="flex items-center gap-2 px-2 mb-6">
          <span className="text-2xl" aria-hidden>🎓</span>
          <span className="font-semibold text-lg leading-tight">90-Day<br />Business School</span>
        </Link>
        <NavLinks />
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
              <Link href="/" className="flex items-center gap-2" onClick={closeDrawer}>
                <span className="text-2xl" aria-hidden>🎓</span>
                <span className="font-semibold leading-tight">90-Day Business School</span>
              </Link>
              <button ref={closeButtonRef} onClick={closeDrawer} aria-label="Close menu">
                <Icon name="X" size={20} />
              </button>
            </div>
            <NavLinks onNavigate={closeDrawer} />
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
        </header>
        <main id="main-content" className="flex-1 px-4 py-6 lg:px-8 lg:py-8 max-w-6xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
