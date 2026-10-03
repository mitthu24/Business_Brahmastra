import type { Metadata } from "next";
import { CreateFormulaForm } from "./CreateFormulaForm";

export const metadata: Metadata = { title: "Founder · New formula" };

export default function NewFormulaEntryPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">New formula</h1>
      <p className="text-muted mb-6">Saved as a draft until you publish it. Learners never see drafts.</p>
      <CreateFormulaForm />
    </div>
  );
}
