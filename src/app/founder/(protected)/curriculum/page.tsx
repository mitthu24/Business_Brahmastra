import type { Metadata } from "next";
import Link from "next/link";
import { getDb } from "@/lib/db/client";
import { listLessons } from "@/lib/db/lesson-queries";
import { listPhasesForFounder } from "@/lib/db/settings-queries";
import { getLessonByDay } from "@/lib/content/lessons";
import { ContentStatusBadge } from "@/components/founder/ContentStatusBadge";
import { ContentStatusActions } from "@/components/founder/ContentStatusActions";
import { setLessonStatusAction } from "../../lesson-actions";
import type { ContentStatus } from "@/lib/db/content-queries";
import { PhaseEditForm } from "./PhaseEditForm";

export const metadata: Metadata = { title: "Founder · Curriculum" };
export const dynamic = "force-dynamic";

export default async function FounderCurriculumPage() {
  const db = getDb();
  const [rows, phases] = await Promise.all([listLessons(db), listPhasesForFounder(db)]);
  const byDay = new Map(rows.map((r) => [r.day, r]));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Curriculum</h1>
      <p className="text-muted mb-6">15 phases · 90 days. {rows.length}/90 migrated into the CMS.</p>

      <div className="space-y-8">
        {phases.map((phase) => (
          <section key={phase.id}>
            <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
              <h2 className="text-lg font-semibold">
                Phase {phase.number} — {phase.name} — Days {phase.startDay}–{phase.endDay}
              </h2>
              <PhaseEditForm phase={phase} />
            </div>
            <p className="text-sm text-muted mb-3">{phase.description}</p>
            <div className="card p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[720px]">
                  <thead>
                    <tr className="text-left text-xs text-muted border-b border-border bg-bg-elevated">
                      <th className="py-2.5 px-4 font-medium">Day</th>
                      <th className="py-2.5 px-4 font-medium">Title</th>
                      <th className="py-2.5 px-4 font-medium">Status</th>
                      <th className="py-2.5 px-4 font-medium">Updated</th>
                      <th className="py-2.5 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: phase.endDay - phase.startDay + 1 }, (_, i) => phase.startDay + i).map((day) => {
                      const row = byDay.get(day);
                      const fallbackTitle = getLessonByDay(day)?.title ?? `Day ${day}`;
                      return (
                        <tr key={day} className="border-b border-border/50 last:border-0 align-top">
                          <td className="py-2.5 px-4 font-medium">{day}</td>
                          <td className="py-2.5 px-4">
                            {row ? (
                              <Link href={`/founder/lessons/${row.id}`} className="hover:underline">
                                {row.title}
                              </Link>
                            ) : (
                              <span className="text-muted">{fallbackTitle}</span>
                            )}
                          </td>
                          <td className="py-2.5 px-4">
                            {row ? (
                              <ContentStatusBadge status={row.status} />
                            ) : (
                              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-muted/15 text-muted">
                                not migrated
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-muted whitespace-nowrap">
                            {row ? row.updatedAt.toLocaleDateString() : "—"}
                          </td>
                          <td className="py-2.5 px-4">
                            {row ? (
                              <div className="flex flex-wrap items-center gap-2">
                                <Link href={`/founder/lessons/${row.id}/preview`} className="text-xs rounded-md border border-border px-2 py-1 hover:bg-bg-elevated transition-colors">
                                  Preview
                                </Link>
                                <ContentStatusActions
                                  id={row.id}
                                  status={row.status as ContentStatus}
                                  setStatus={setLessonStatusAction}
                                  editHref={`/founder/lessons/${row.id}`}
                                />
                              </div>
                            ) : (
                              <Link href={`/founder/lessons/new?day=${day}`} className="text-xs rounded-md border border-border px-2 py-1 hover:bg-bg-elevated transition-colors">
                                Create
                              </Link>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
