import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db/client";
import { getAchievementEntry } from "@/lib/db/achievement-queries";
import { ContentStatusBadge } from "@/components/founder/ContentStatusBadge";
import { ContentStatusActions } from "@/components/founder/ContentStatusActions";
import { setAchievementStatusAction } from "../../../achievement-actions";
import { EditAchievementForm } from "./EditAchievementForm";
import { Icon } from "@/components/nav/Icon";

export const metadata: Metadata = { title: "Founder · Edit achievement" };
export const dynamic = "force-dynamic";

export default async function FounderAchievementEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entry = await getAchievementEntry(getDb(), id);
  if (!entry) notFound();

  return (
    <div className="max-w-5xl">
      <div className="flex items-center gap-3 mb-1">
        <h1 className="text-2xl font-bold">{entry.name}</h1>
        <ContentStatusBadge status={entry.status} />
      </div>
      <div className="mb-6">
        <ContentStatusActions id={entry.id} status={entry.status} setStatus={setAchievementStatusAction} />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-sm font-semibold mb-3">Edit</h2>
          <EditAchievementForm entry={entry} />
        </div>
        <div>
          <h2 className="text-sm font-semibold mb-3">Preview — what a learner will see once published</h2>
          <div className="card p-5 text-center max-w-xs">
            <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-3 bg-accent/20 text-accent">
              <Icon name={entry.icon} size={26} />
            </div>
            <h3 className="font-medium text-sm">{entry.name}</h3>
            <p className="text-xs text-muted mt-1">{entry.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
