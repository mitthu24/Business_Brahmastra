"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/nav/Icon";

const navLinks = [
  { href: "/roadmap", label: "90-Day Roadmap" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
];

/** Premium marketing nav: sticky-with-blur after scroll, full-screen mobile sheet. Deliberately
 * separate from the learner app's AppShell nav (src/components/nav/AppShell.tsx) - this is public
 * marketing chrome, not the authenticated product shell, and must never gate on a session (any
 * visitor, logged in or not, sees the same thing). */
export function MarketingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors ${
        scrolled ? "bg-bg/80 backdrop-blur-md border-b border-border" : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/15 text-primary">
            <Icon name="GraduationCap" size={18} />
          </span>
          <span>90-Day Business School</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7 text-sm text-muted">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-foreground transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Link href="/login" className="text-sm text-muted hover:text-foreground transition-colors px-3 py-2">
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Start Learning
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={menuOpen}
          className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-bg-elevated transition-colors"
        >
          <Icon name="Menu" size={22} />
        </button>
      </div>

      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-bg flex flex-col">
          <div className="h-16 flex items-center justify-between px-4 border-b border-border">
            <span className="font-semibold">90-Day Business School</span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              autoFocus
              className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-bg-elevated transition-colors"
            >
              <Icon name="X" size={22} />
            </button>
          </div>
          <nav className="flex flex-col p-4 gap-1 text-lg">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="px-3 py-3 rounded-lg hover:bg-bg-elevated transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto p-4 flex flex-col gap-3 border-t border-border">
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="text-center rounded-lg border border-border px-4 py-3 font-medium hover:bg-bg-elevated transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              onClick={() => setMenuOpen(false)}
              className="text-center rounded-lg bg-primary text-primary-foreground px-4 py-3 font-medium hover:opacity-90 transition-opacity"
            >
              Start Your 3-Day Free Trial
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
