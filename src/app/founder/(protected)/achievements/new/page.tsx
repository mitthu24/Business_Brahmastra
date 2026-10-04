import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db/client";
import { listAchievementEntries } from "@/lib/db/achievement-queries";
import { achievements as trustedAchievements } from "@/lib/progress/achievements";
import { CreateAchievementForm } from "./CreateAchievementForm";

export const metadata: Metadata = { title: "Founder · Import achievement" };
export const dynamic = "force-dynamic";

export default async function NewAchievementPage() {
  const existing = await listAchievementEntries(getDb());
  const existingIds = new Set(existing.map((e) => e.id));
  const missing = trustedAchievements.filter((a) => !existingIds.has(a.id));

  if (missing.length === 0) redirect("/founder/achievements");

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Import achievement</h1>
      <p className="text-muted mb-6">
        Every achievement the unlock engine knows about is already in the CMS except these. Pick one to bring it in.
      </p>
      <CreateAchievementForm missing={missing} />
    </div>
  );
}
