import type { Metadata } from "next";
import { ProgressView } from "@/components/progress/ProgressView";

export const metadata: Metadata = { title: "Progress" };

export default function ProgressPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Your Progress</h1>
      <p className="text-muted mb-6">A detailed breakdown of your journey through all 15 phases.</p>
      <ProgressView />
    </div>
  );
}
