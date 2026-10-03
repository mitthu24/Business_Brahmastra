import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db/client";
import { getUserDetailForFounder } from "@/lib/db/founder-queries";
import { listJournalEntries } from "@/lib/db/journal-queries";
import { getCanvas } from "@/lib/db/canvas-queries";
import { TOTAL_DAYS } from "@/lib/content/lessons";
import { UserDetailActions } from "./UserDetailActions";

export const metadata: Metadata = { title: "Founder · User" };
export const dynamic = "force-dynamic";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 text-sm py-1.5">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium text-right">{value}</dd>
    </div>
  );
}

export default async function FounderUserDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const db = getDb();

  // A founder may look up any user by design - but an id that doesn't exist (typo'd URL, deleted
  // account) must 404, never throw a raw DB error or render a half-populated page. This is the
  // IDOR-safety boundary for this page: the *authorization* check (founder role) already happened
  // in the layout; this is the *existence* check.
  const detail = await getUserDetailForFounder(db, userId);
  if (!detail) notFound();

  const [journalEntries, canvas] = await Promise.all([listJournalEntries(db, userId), getCanvas(db, userId)]);
  const canvasFilledBlocks = Object.values(canvas).filter((v) => v.length > 0).length;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">{detail.name ?? detail.email}</h1>
        <p className="text-muted">{detail.email}</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold mb-2">Account</h2>
          <dl className="divide-y divide-border/50">
            <Field label="Role" value={detail.role === "founder" ? "Founder" : "Learner"} />
            <Field label="Access status" value={detail.status} />
            <Field label="Trial start" value={detail.trialStartedAt.toLocaleString()} />
            <Field label="Trial end" value={detail.trialEndsAt.toLocaleString()} />
            <Field label="Access granted" value={detail.accessActivatedAt ? detail.accessActivatedAt.toLocaleString() : "—"} />
            <Field label="Suspended" value={detail.suspendedAt ? detail.suspendedAt.toLocaleString() : "No"} />
            <Field label="Joined" value={detail.createdAt.toLocaleDateString()} />
            <Field label="Last activity" value={detail.lastActivityDate ?? "—"} />
          </dl>
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-semibold mb-2">Learning</h2>
          <dl className="divide-y divide-border/50">
            <Field label="Days completed" value={`${detail.progress.completedDays.length}/${TOTAL_DAYS}`} />
            <Field label="XP" value={detail.progress.xp.toLocaleString()} />
            <Field label="Current streak" value={`${detail.currentStreak} days`} />
            <Field label="Longest streak" value={`${detail.longestStreak} days`} />
            <Field label="Exercises completed" value={detail.exerciseCompletedCount} />
            <Field label="Quiz attempts" value={detail.quizAttemptCount} />
            <Field label="Achievements" value={detail.achievementCount} />
            <Field label="Final project" value={detail.finalProjectCompleted ? "Completed" : "In progress"} />
          </dl>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-sm font-semibold mb-2">Activity</h2>
        <dl className="divide-y divide-border/50">
          <Field label="Journal entries" value={journalEntries.length} />
          <Field label="Canvas blocks filled" value={`${canvasFilledBlocks}/9`} />
          <Field
            label="Recent lesson completions"
            value={detail.progress.completedDays.slice(-5).reverse().map((d) => `Day ${d}`).join(", ") || "None yet"}
          />
        </dl>
      </div>

      <div className="card p-5">
        <h2 className="text-sm font-semibold mb-3">Founder actions</h2>
        <UserDetailActions userId={detail.id} role={detail.role} status={detail.status} />
      </div>
    </div>
  );
}
