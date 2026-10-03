import type { Metadata } from "next";
import { RoadmapView } from "@/components/roadmap/RoadmapView";

export const metadata: Metadata = { title: "90-Day Roadmap" };

export default function RoadmapPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">90-Day Roadmap</h1>
      <p className="text-muted mb-6">15 phases. Start at Business Foundation, end with your own Founder Project.</p>
      <RoadmapView />
    </div>
  );
}
