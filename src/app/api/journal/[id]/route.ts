import { NextResponse } from "next/server";
import { requireUserForApi } from "@/lib/auth/dal";
import { getDb } from "@/lib/db/client";
import { deleteJournalEntryRow } from "@/lib/db/journal-queries";

export const dynamic = "force-dynamic";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireUserForApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    // deleteJournalEntryRow scopes the delete to session.userId at the SQL level - a request for
    // another user's entry id affects zero rows and is reported as 404, never as someone else's data.
    const deleted = await deleteJournalEntryRow(getDb(), session.userId, id);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}
