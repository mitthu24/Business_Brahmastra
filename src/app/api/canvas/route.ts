import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserForApi, requireActiveAccessForApi } from "@/lib/auth/dal";
import { getDb } from "@/lib/db/client";
import { getCanvas, upsertCanvas, CANVAS_BLOCK_IDS } from "@/lib/db/canvas-queries";

export const dynamic = "force-dynamic";

const bodySchema = z.object(
  Object.fromEntries(CANVAS_BLOCK_IDS.map((id) => [id, z.string().max(5000).optional()]))
);

export async function GET() {
  const session = await requireUserForApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const canvas = await getCanvas(getDb(), session.userId);
    return NextResponse.json(canvas);
  } catch {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  const access = await requireActiveAccessForApi();
  if (!access.ok) {
    if (access.code === "UNAUTHENTICATED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Your access has ended.", accessStatus: access.status }, { status: 403 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  try {
    const canvas = await upsertCanvas(getDb(), access.userId, parsed.data);
    return NextResponse.json(canvas);
  } catch {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}
