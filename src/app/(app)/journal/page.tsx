import type { Metadata } from "next";
import { JournalView } from "@/components/journal/JournalView";

export const metadata: Metadata = { title: "Founder Journal" };

export default function JournalPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Founder Journal</h1>
      <p className="text-muted mb-6">Capture ideas, observations, and lessons as you go. Saved in this browser.</p>
      <JournalView />
    </div>
  );
}
