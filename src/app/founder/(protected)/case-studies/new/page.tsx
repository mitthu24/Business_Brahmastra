import type { Metadata } from "next";
import { CreateCaseStudyForm } from "./CreateCaseStudyForm";

export const metadata: Metadata = { title: "Founder · New case study" };

export default function NewCaseStudyEntryPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">New case study</h1>
      <p className="text-muted mb-6">Saved as a draft until you publish it. Learners never see drafts.</p>
      <CreateCaseStudyForm />
    </div>
  );
}
