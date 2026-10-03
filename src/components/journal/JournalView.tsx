"use client";

import { useState } from "react";
import { useLocalStorageState } from "@/lib/use-local-storage-state";
import { journalCategories, createJournalEntry, type JournalEntry, type JournalCategory } from "@/lib/journal";
import { useProgressStore } from "@/lib/progress/store";
import { getLessonByDay } from "@/lib/content/lessons";
import { Icon } from "@/components/nav/Icon";

export function JournalView() {
  const [entries, setEntries] = useLocalStorageState<JournalEntry[]>("founder-journal", []);
  const [category, setCategory] = useState<JournalCategory>("Business idea");
  const [text, setText] = useState("");
  const reflections = useProgressStore((s) => s.reflections);

  function addEntry() {
    if (!text.trim()) return;
    setEntries((prev) => [createJournalEntry(category, text.trim()), ...prev]);
    setText("");
  }

  function removeEntry(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  const reflectionEntries = Object.entries(reflections);

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div>
        <div className="card p-5 mb-6">
          <label className="text-sm font-medium block mb-2">Category</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {journalCategories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`text-xs rounded-full px-3 py-1.5 transition-colors ${
                  category === c ? "bg-primary text-primary-foreground" : "border border-border text-muted hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write down an idea, observation, or lesson..."
            rows={3}
            className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary resize-none mb-3"
          />
          <button onClick={addEntry} className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity">
            Add entry
          </button>
        </div>

        <h2 className="text-sm font-semibold text-muted mb-3">YOUR ENTRIES ({entries.length})</h2>
        <div className="space-y-3">
          {entries.length === 0 && <p className="text-sm text-muted">No entries yet.</p>}
          {entries.map((e) => (
            <div key={e.id} className="card p-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs rounded-full bg-primary/15 text-primary px-2.5 py-0.5">{e.category}</span>
                <button onClick={() => removeEntry(e.id)} aria-label="Delete entry">
                  <Icon name="Trash2" size={14} className="text-muted hover:text-danger" />
                </button>
              </div>
              <p className="text-sm">{e.text}</p>
              <p className="text-xs text-muted mt-1.5">{new Date(e.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-muted mb-3">LESSON REFLECTIONS ({reflectionEntries.length})</h2>
        <div className="space-y-3">
          {reflectionEntries.length === 0 && <p className="text-sm text-muted">Reflections you save at the end of each lesson will appear here.</p>}
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
