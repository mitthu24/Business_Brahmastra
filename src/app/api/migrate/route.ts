import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserForApi } from "@/lib/auth/dal";
import { getDb } from "@/lib/db/client";
import { migrateLocalData, hasMigrated, type LocalStorageSnapshot } from "@/lib/db/migration-queries";

export const dynamic = "force-dynamic";

// Loose/permissive schema: this is a one-time best-effort import of whatever shape the client's
// old localStorage happens to be in. Anything that doesn't parse is simply ignored field-by-field
// inside migrateLocalData rather than rejecting the whole request.
const snapshotSchema = z.object({
  progress: z.record(z.string(), z.unknown()).optional(),
  journal: z.array(z.record(z.string(), z.unknown())).optional(),
  canvas: z.record(z.string(), z.unknown()).optional(),
  finalProjectAnswers: z.record(z.string(), z.unknown()).optional(),
});

export async function GET() {
  const session = await requireUserForApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const migrated = await hasMigrated(getDb(), session.userId);
    return NextResponse.json({ migrated });
  } catch {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const session = await requireUserForApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await request.json().catch(() => null);
  const parsed = snapshotSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  try {
    const result = await migrateLocalData(getDb(), session.userId, parsed.data as LocalStorageSnapshot);
    return NextResponse.json(result);
  } catch (err) {
    console.error("migration failed", err);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}
