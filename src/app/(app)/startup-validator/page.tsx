import type { Metadata } from "next";
import { ValidatorView } from "@/components/validator/ValidatorView";

export const metadata: Metadata = { title: "Startup Validator" };

export default function StartupValidatorPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Startup Readiness Checklist</h1>
      <p className="text-muted mb-6">Enter your idea and get a structured checklist of what&apos;s clear and what still needs work.</p>
      <ValidatorView />
    </div>
  );
}
