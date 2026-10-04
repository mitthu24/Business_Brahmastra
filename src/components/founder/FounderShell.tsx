"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { founderNavItems } from "@/lib/founder-nav-items";
import { Icon } from "@/components/nav/Icon";
import { FounderLogoutButton } from "@/components/founder/FounderLogoutButton";

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1" aria-label="Founder navigation">
      {founderNavItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
              active ? "bg-primary/15 text-primary font-medium" : "text-muted hover:bg-bg-elevated hover:text-foreground"
            }`}
            aria-current={active ? "page" : undefined}
          >
            <span className="flex items-center gap-3">
              <Icon name={item.icon} size={18} />
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

/** Founder admin shell: desktop sidebar + mobile drawer, mirroring the learner AppShell's
 * accessibility pattern (focus management, Escape-to-close, skip link) rather than inventing a
 * new one. See docs/PHASE-5.3.md "Founder panel architecture". */
export function FounderShell({
  children,
  founderName,
  founderEmail,
}: {
  children: React.ReactNode;
  founderName: string | null;
  founderEmail: string;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  function closeDrawer() {
    setDrawerOpen(false);
    menuButtonRef.current?.focus();
  }

  useEffect(() => {
    if (!drawerOpen) return;
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
        href="#founder-main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:bg-primary focus:text-primary-foreground focus:px-3 focus:py-2 focus:rounded-lg"
      >
        Skip to main content
      </a>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-bg-elevated px-4 py-6 shrink-0 h-screen sticky top-0 overflow-y-auto scrollbar-thin print:hidden">
        <Link href="/founder/dashboard" className="flex items-center gap-2 px-2 mb-6">
          <span className="text-2xl" aria-hidden>🔑</span>
          <span className="font-semibold text-lg leading-tight">Founder<br />Control Center</span>
        </Link>
        <NavLinks />
        <div className="mt-auto pt-4 border-t border-border">
          <div className="px-2 mb-2">
            <p className="text-sm font-medium truncate">{founderName ?? "Founder"}</p>
            <p className="text-xs text-muted truncate">{founderEmail}</p>
          </div>
          <FounderLogoutButton />
        </div>
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={closeDrawer} aria-hidden="true" />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Founder navigation menu"
            className="absolute left-0 top-0 h-full w-72 bg-bg-elevated border-r border-border px-4 py-6 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6 px-2">
              <Link href="/founder/dashboard" className="flex items-center gap-2" onClick={closeDrawer}>
                <span className="text-2xl" aria-hidden>🔑</span>
                <span className="font-semibold leading-tight">Founder Control Center</span>
              </Link>
              <button ref={closeButtonRef} onClick={closeDrawer} aria-label="Close menu">
                <Icon name="X" size={20} />
              </button>
            </div>
            <NavLinks onNavigate={closeDrawer} />
            <div className="mt-6 pt-4 border-t border-border">
              <div className="px-2 mb-2">
                <p className="text-sm font-medium truncate">{founderName ?? "Founder"}</p>
                <p className="text-xs text-muted truncate">{founderEmail}</p>
              </div>
              <FounderLogoutButton />
            </div>
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center gap-3 border-b border-border px-4 py-3 lg:px-6 sticky top-0 bg-bg/95 backdrop-blur z-30 print:hidden">
          <button ref={menuButtonRef} className="lg:hidden" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
            <Icon name="Menu" size={22} />
          </button>
          <div className="flex-1 text-sm text-muted lg:hidden">Founder Control Center</div>
        </header>
        <main id="founder-main-content" className="flex-1 px-4 py-6 lg:px-8 lg:py-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
