import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db/client";
import { getCaseStudyEntry } from "@/lib/db/content-queries";
import { ContentStatusBadge } from "@/components/founder/ContentStatusBadge";
import { ContentStatusActions } from "@/components/founder/ContentStatusActions";
import { setCaseStudyStatusAction } from "../../../content-actions";
import { EditCaseStudyForm } from "./EditCaseStudyForm";
import { CaseStudyPreview } from "./CaseStudyPreview";

export const metadata: Metadata = { title: "Founder · Edit case study" };
export const dynamic = "force-dynamic";

export default async function FounderCaseStudyEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entry = await getCaseStudyEntry(getDb(), id);
  if (!entry) notFound();

  return (
    <div className="max-w-5xl">
      <div className="flex items-center gap-3 mb-1">
        <h1 className="text-2xl font-bold">{entry.company}</h1>
        <ContentStatusBadge status={entry.status} />
      </div>
      <div className="mb-6">
        <ContentStatusActions id={entry.id} status={entry.status} setStatus={setCaseStudyStatusAction} />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-sm font-semibold mb-3">Edit</h2>
          <EditCaseStudyForm entry={entry} />
        </div>
        <div>
          <h2 className="text-sm font-semibold mb-3">Preview — what a learner will see once published</h2>
          <CaseStudyPreview entry={entry} />
        </div>
      </div>
    </div>
  );
}
