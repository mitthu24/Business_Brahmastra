"use client";

import { useLocalStorageState } from "@/lib/use-local-storage-state";

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

const initial: CanvasState = Object.fromEntries(blocks.map((b) => [b.id, ""]));

export function CanvasView() {
  const [canvas, setCanvas] = useLocalStorageState<CanvasState>("business-model-canvas", initial);

  function update(id: string, value: string) {
    setCanvas((prev) => ({ ...prev, [id]: value }));
  }

  function clearAll() {
    setCanvas(initial);
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={clearAll} className="text-sm text-muted hover:text-foreground border border-border rounded-lg px-3 py-1.5">
          Clear all
        </button>
      </div>
      <div className="grid md:grid-cols-5 gap-3">
        {blocks.map((b) => (
          <div key={b.id} className={`card p-4 ${b.className}`}>
            <label htmlFor={b.id} className="text-xs font-semibold text-muted block mb-2">{b.label.toUpperCase()}</label>
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
      <p className="text-xs text-muted mt-4">Saved automatically to this browser.</p>
    </div>
  );
}
