import type { Metadata } from "next";
import { caseStudies } from "@/lib/content/case-studies";
import { CaseStudyBrowser } from "@/components/case-studies/CaseStudyBrowser";

export const metadata: Metadata = { title: "Case Studies" };

export default function CaseStudiesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Case Study Library</h1>
      <p className="text-muted mb-6">
        Real companies analysed with the frameworks from the course. Each case is clearly labelled as a
        documented fact or an illustrative analysis — we never invent company financial figures.
      </p>
      <CaseStudyBrowser items={caseStudies} />
    </div>
  );
}
