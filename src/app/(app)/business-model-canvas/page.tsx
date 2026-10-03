import type { Metadata } from "next";
import { CanvasView } from "@/components/canvas/CanvasView";

export const metadata: Metadata = { title: "Business Model Canvas" };

export default function BusinessModelCanvasPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Business Model Canvas</h1>
      <p className="text-muted mb-6">Map your idea across all 9 blocks. Your work is saved automatically in this browser.</p>
      <CanvasView />
    </div>
  );
}
