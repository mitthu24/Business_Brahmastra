import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db/client";
import { getCalculatorEntry } from "@/lib/db/calculator-queries";
import { ContentStatusBadge } from "@/components/founder/ContentStatusBadge";
import { ContentStatusActions } from "@/components/founder/ContentStatusActions";
import { setCalculatorStatusAction } from "../../../calculator-actions";
import { EditCalculatorForm } from "./EditCalculatorForm";

export const metadata: Metadata = { title: "Founder · Edit calculator" };
export const dynamic = "force-dynamic";

export default async function FounderCalculatorEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entry = await getCalculatorEntry(getDb(), id);
  if (!entry) notFound();

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-1">
        <h1 className="text-2xl font-bold">{entry.title}</h1>
        <ContentStatusBadge status={entry.status} />
      </div>
      <div className="mb-6">
        <ContentStatusActions id={entry.id} status={entry.status} setStatus={setCalculatorStatusAction} />
      </div>
      <EditCalculatorForm entry={entry} />
    </div>
  );
}
