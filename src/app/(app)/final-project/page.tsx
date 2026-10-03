import type { Metadata } from "next";
import { WizardView } from "@/components/final-project/WizardView";

export const metadata: Metadata = { title: "Final Project" };

export default function FinalProjectPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1 print:hidden">Final Project: Build Your Business</h1>
      <p className="text-muted mb-6 print:hidden">17 steps. Answers are saved automatically in this browser as you go.</p>
      <WizardView />
    </div>
  );
}
