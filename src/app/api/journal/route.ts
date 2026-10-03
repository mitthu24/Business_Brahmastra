import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserForApi, requireActiveAccessForApi } from "@/lib/auth/dal";
import { getDb } from "@/lib/db/client";
import { listJournalEntries, createJournalEntryRow } from "@/lib/db/journal-queries";
import { journalCategories, type JournalCategory } from "@/lib/journal";

export const dynamic = "force-dynamic";

const categoryValues = journalCategories.map((c) => c.label) as [JournalCategory, ...JournalCategory[]];

const createSchema = z.object({
  category: z.enum(categoryValues),
  text: z.string().trim().min(1).max(5000),
});

export async function GET() {
  const session = await requireUserForApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const entries = await listJournalEntries(getDb(), session.userId);
    return NextResponse.json(entries);
  } catch {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const access = await requireActiveAccessForApi();
  if (!access.ok) {
    if (access.code === "UNAUTHENTICATED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Your access has ended.", accessStatus: access.status }, { status: 403 });
  }

  const json = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  try {
    const entry = await createJournalEntryRow(getDb(), access.userId, parsed.data.category, parsed.data.text);
    return NextResponse.json(entry, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}
