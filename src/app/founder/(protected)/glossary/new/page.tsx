import type { Metadata } from "next";
import { CreateGlossaryForm } from "./CreateGlossaryForm";

export const metadata: Metadata = { title: "Founder · New glossary term" };

export default function NewGlossaryEntryPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">New glossary term</h1>
      <p className="text-muted mb-6">Saved as a draft until you publish it. Learners never see drafts.</p>
      <CreateGlossaryForm />
    </div>
  );
}
