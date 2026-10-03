"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/nav/Icon";

interface CanvasBlock {
  id: string;
  label: string;
  placeholder: string;
  className: string;
}

const blocks: CanvasBlock[] = [
  { id: "keyPartners", label: "Key Partners", placeholder: "Who do you rely on (suppliers, partners) to deliver value?", className: "md:col-span-1 md:row-span-2" },
  { id: "keyActivities", label: "Key Activities", placeholder: "What must you DO to deliver your value proposition?", className: "md:col-span-1" },
  { id: "valueProposition", label: "Value Proposition", placeholder: "What value do you deliver? What problem do you solve?", className: "md:col-span-1 md:row-span-2" },
  { id: "customerRelationships", label: "Customer Relationships", placeholder: "How do you acquire, keep, and grow customers?", className: "md:col-span-1" },
  { id: "customerSegments", label: "Customer Segments", placeholder: "Who are you creating value for? Your ICP.", className: "md:col-span-1 md:row-span-2" },
  { id: "keyResources", label: "Key Resources", placeholder: "What assets does your value proposition require?", className: "md:col-span-1" },
  { id: "channels", label: "Channels", placeholder: "How do you reach and deliver to your customers?", className: "md:col-span-1" },
  { id: "costStructure", label: "Cost Structure", placeholder: "What are your most important costs?", className: "md:col-span-2" },
  { id: "revenueStreams", label: "Revenue Streams", placeholder: "How and from what do you earn revenue?", className: "md:col-span-3" },
];

type CanvasState = Record<string, string>;
type SaveState = "loading" | "idle" | "saving" | "saved" | "error";

const initial: CanvasState = Object.fromEntries(blocks.map((b) => [b.id, ""]));

export function CanvasView() {
  const [canvas, setCanvas] = useState<CanvasState>(initial);
  const [compact, setCompact] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("loading");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<CanvasState | null>(null);

  async function load() {
    setSaveState("loading");
    try {
      const res = await fetch("/api/canvas");
      if (!res.ok) throw new Error();
      const data: CanvasState = await res.json();
      setCanvas({ ...initial, ...data });
      setSaveState("idle");
    } catch {
      setSaveState("error");
    }
  }

  useEffect(() => {
    // One-time fetch on mount from an external source (the API) - not a React state sync.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  function scheduleSave(next: CanvasState) {
    pendingRef.current = next;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const toSave = pendingRef.current;
      if (!toSave) return;
      setSaveState("saving");
      try {
        const res = await fetch("/api/canvas", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(toSave),
        });
        if (!res.ok) throw new Error();
        setSaveState("saved");
      } catch {
        setSaveState("error");
      }
    }, 600); // debounced autosave
  }

  function update(id: string, value: string) {
    setCanvas((prev) => {
      const next = { ...prev, [id]: value };
      scheduleSave(next);
      return next;
    });
  }

  function clearBlock(id: string) {
    update(id, "");
  }

  function clearAll() {
    setCanvas(initial);
    scheduleSave(initial);
  }

  const filledCount = blocks.filter((b) => (canvas[b.id] ?? "").trim()).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p className="text-xs text-muted">{filledCount}/{blocks.length} blocks filled</p>
        <div className="flex items-center gap-3">
          <SaveIndicator state={saveState} onRetry={load} />
          <button
            onClick={() => setCompact((c) => !c)}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground border border-border rounded-lg px-3 py-1.5"
          >
            <Icon name={compact ? "LayoutGrid" : "List"} size={14} />
            {compact ? "Full view" : "Compact summary"}
          </button>
          <button onClick={clearAll} className="text-sm text-muted hover:text-foreground border border-border rounded-lg px-3 py-1.5">
            Clear all
          </button>
        </div>
      </div>

      {compact ? (
        <div className="space-y-2">
          {blocks.map((b) => (
            <div key={b.id} className="card p-3">
              <p className="text-xs font-semibold text-muted">{b.label.toUpperCase()}</p>
              <p className="text-sm mt-0.5">{(canvas[b.id] ?? "").trim() || <span className="text-muted">Not filled yet.</span>}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-5 gap-3">
          {blocks.map((b) => (
            <div key={b.id} className={`card p-4 ${b.className}`}>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor={b.id} className="text-xs font-semibold text-muted">{b.label.toUpperCase()}</label>
                {(canvas[b.id] ?? "").trim() && (
                  <button onClick={() => clearBlock(b.id)} aria-label={`Clear ${b.label}`}>
                    <Icon name="X" size={12} className="text-muted hover:text-danger" />
                  </button>
                )}
              </div>
              <textarea
                id={b.id}
                value={canvas[b.id] ?? ""}
                onChange={(e) => update(b.id, e.target.value)}
                placeholder={b.placeholder}
                rows={5}
                className="w-full bg-transparent text-sm outline-none resize-none placeholder:text-muted/70"
              />
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-muted mt-4">Saved automatically to your account.</p>
    </div>
  );
}

function SaveIndicator({ state, onRetry }: { state: SaveState; onRetry: () => void }) {
  if (state === "loading") return <span className="text-xs text-muted">Loading…</span>;
  if (state === "saving") return <span className="text-xs text-muted">Saving…</span>;
  if (state === "error")
    return (
      <button onClick={onRetry} className="text-xs text-danger hover:underline">
        Sync failed · Retry
      </button>
    );
  if (state === "saved") return <span className="text-xs text-success">Saved</span>;
  return null;
}
