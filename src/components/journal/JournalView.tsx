"use client";

import { useEffect, useMemo, useState } from "react";
import { journalCategories, categoryIcon, type JournalCategory } from "@/lib/journal";
import { useProgressStore } from "@/lib/progress/store";
import { getLessonByDay } from "@/lib/content/lessons";
import { Icon } from "@/components/nav/Icon";

interface ServerJournalEntry {
  id: string;
  category: JournalCategory;
  text: string;
  createdAt: string;
}

type LoadState = "loading" | "ready" | "error";

export function JournalView() {
  const [entries, setEntries] = useState<ServerJournalEntry[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [category, setCategory] = useState<JournalCategory>(journalCategories[0].label);
  const [filter, setFilter] = useState<JournalCategory | "All">("All");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const reflections = useProgressStore((s) => s.reflections);

  async function load() {
    setLoadState("loading");
    try {
      const res = await fetch("/api/journal");
      if (!res.ok) throw new Error();
      const data: ServerJournalEntry[] = await res.json();
      setEntries(data);
      setLoadState("ready");
    } catch {
      setLoadState("error");
    }
  }

  useEffect(() => {
    // One-time fetch on mount from an external source (the API) - not a React state sync.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function addEntry() {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, text: text.trim() }),
      });
      if (!res.ok) throw new Error();
      const created: ServerJournalEntry = await res.json();
      setEntries((prev) => [created, ...prev]);
      setText("");
    } catch {
      // Leave the draft text in place so nothing typed is lost; the user can retry the submit.
    } finally {
      setSubmitting(false);
    }
  }

  async function removeEntry(id: string) {
    const previous = entries;
    setEntries((prev) => prev.filter((e) => e.id !== id));
    try {
      const res = await fetch(`/api/journal/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
    } catch {
      setEntries(previous); // roll back on failure
    }
  }

  const filteredEntries = useMemo(
    () => (filter === "All" ? entries : entries.filter((e) => e.category === filter)),
    [entries, filter]
  );

  const reflectionEntries = Object.entries(reflections);

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div>
        <div className="card p-5 mb-6">
          <fieldset className="mb-4">
            <legend className="text-sm font-medium mb-2">Category</legend>
            <div className="flex flex-wrap gap-2">
              {journalCategories.map((c) => (
                <button
                  key={c.label}
                  onClick={() => setCategory(c.label)}
                  aria-pressed={category === c.label}
                  className={`text-xs rounded-full px-3 py-1.5 transition-colors flex items-center gap-1 ${
                    category === c.label ? "bg-primary text-primary-foreground" : "border border-border text-muted hover:text-foreground"
                  }`}
                >
                  <span aria-hidden>{c.icon}</span> {c.label}
                </button>
              ))}
            </div>
          </fieldset>
          <label htmlFor="journal-entry-text" className="sr-only">Journal entry</label>
          <textarea
            id="journal-entry-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write down an idea, observation, or lesson..."
            rows={3}
            className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary resize-none mb-3"
          />
          <button
            onClick={addEntry}
            disabled={submitting}
            className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Add entry"}
          </button>
        </div>

        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="text-sm font-semibold text-muted">YOUR ENTRIES ({filteredEntries.length})</h2>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as JournalCategory | "All")}
            aria-label="Filter entries by category"
            className="text-xs rounded-lg border border-border bg-bg-elevated px-2 py-1.5"
          >
            <option value="All">All categories</option>
            {journalCategories.map((c) => (
              <option key={c.label} value={c.label}>{c.icon} {c.label}</option>
            ))}
          </select>
        </div>

        {loadState === "loading" && <p className="text-sm text-muted">Loading your journal…</p>}
        {loadState === "error" && (
          <div className="card p-4 flex items-center justify-between gap-3">
            <p className="text-sm text-danger">Couldn&apos;t load your journal.</p>
            <button onClick={load} className="text-xs rounded-lg border border-border px-3 py-1.5 hover:text-foreground">
              Retry
            </button>
          </div>
        )}
        {loadState === "ready" && (
          <div className="space-y-3">
            {filteredEntries.length === 0 && (
              <div className="card p-8 text-center">
                <Icon name="NotebookPen" size={28} className="text-muted mx-auto mb-3" />
                <p className="text-sm font-medium">No entries yet</p>
                <p className="text-xs text-muted mt-1">Write down your first idea, observation, or lesson above.</p>
              </div>
            )}
            {filteredEntries.map((e) => (
              <div key={e.id} className="card p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs rounded-full bg-primary/15 text-primary px-2.5 py-0.5 flex items-center gap-1">
                    <span aria-hidden>{categoryIcon(e.category)}</span> {e.category}
                  </span>
                  <button onClick={() => removeEntry(e.id)} aria-label="Delete entry">
                    <Icon name="Trash2" size={14} className="text-muted hover:text-danger" />
                  </button>
                </div>
                <p className="text-sm">{e.text}</p>
                <p className="text-xs text-muted mt-1.5">{new Date(e.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-muted mb-3">LESSON REFLECTIONS ({reflectionEntries.length})</h2>
        <div className="space-y-3">
          {reflectionEntries.length === 0 && (
            <div className="card p-8 text-center">
              <Icon name="Sparkles" size={28} className="text-muted mx-auto mb-3" />
              <p className="text-sm font-medium">No reflections yet</p>
              <p className="text-xs text-muted mt-1">Reflections you save at the end of each lesson will appear here.</p>
            </div>
          )}
          {reflectionEntries.map(([lessonId, r]) => {
            const dayMatch = lessonId.match(/day-(\d+)/);
            const lesson = dayMatch ? getLessonByDay(Number(dayMatch[1])) : undefined;
            return (
              <div key={lessonId} className="card p-4">
                <p className="text-xs font-medium text-primary mb-2">{lesson ? `Day ${lesson.day}: ${lesson.title}` : lessonId}</p>
                {r.learned && <p className="text-sm"><span className="text-muted">Learned: </span>{r.learned}</p>}
                {r.application && <p className="text-sm mt-1"><span className="text-muted">Application: </span>{r.application}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
