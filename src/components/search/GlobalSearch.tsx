"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { buildSearchIndex, searchIndex, type SearchResult } from "@/lib/search-index";
import { Icon } from "@/components/nav/Icon";

const categoryIcon: Record<SearchResult["category"], string> = {
  Lesson: "BookOpen",
  Glossary: "BookMarked",
  Formula: "Sigma",
  "Case Study": "Building2",
  Calculator: "Calculator",
};

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const index = useMemo(() => buildSearchIndex(), []);
  const results = useMemo(() => searchIndex(query, index), [query, index]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === "INPUT" || target.tagName === "TEXTAREA";
      if (e.key === "/" && !isTyping) {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function goTo(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm text-muted hover:text-foreground transition-colors w-full md:w-64"
        aria-label="Open global search"
      >
        <Icon name="Search" size={16} />
        <span className="flex-1 text-left">Search...</span>
        <kbd className="hidden md:inline rounded border border-border px-1.5 py-0.5 text-xs">/</kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-[10vh]"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Global search"
        >
          <div
            className="card w-full max-w-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <Icon name="Search" size={18} className="text-muted" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search lessons, glossary, formulas, case studies, calculators..."
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted"
              />
              <button onClick={() => setOpen(false)} aria-label="Close search">
                <Icon name="X" size={18} className="text-muted" />
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto scrollbar-thin">
              {query && results.length === 0 && (
                <p className="px-4 py-6 text-sm text-muted text-center">No results for &ldquo;{query}&rdquo;.</p>
              )}
              {results.map((r) => (
                <button
                  key={r.id}
                  onClick={() => goTo(r.href)}
                  className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-bg-elevated transition-colors border-b border-border last:border-b-0"
                >
                  <Icon name={categoryIcon[r.category]} size={16} className="mt-0.5 text-primary shrink-0" />
                  <span className="flex-1">
                    <span className="block text-sm font-medium">{r.title}</span>
                    <span className="block text-xs text-muted mt-0.5 line-clamp-1">{r.description}</span>
                  </span>
                  <span className="text-xs text-muted shrink-0">{r.category}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
