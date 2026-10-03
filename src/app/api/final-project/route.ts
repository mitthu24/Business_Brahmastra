import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserForApi } from "@/lib/auth/dal";
import { getDb } from "@/lib/db/client";
import { getFinalProjectAnswers, saveFinalProjectStep } from "@/lib/db/final-project-queries";
import { wizardSteps } from "@/lib/final-project";
import { completeFinalProjectTx } from "@/lib/db/progress-queries";

export const dynamic = "force-dynamic";

const stepNumbers = wizardSteps.map((s) => s.stepNumber);

const bodySchema = z.object({
  stepNumber: z.number().int().refine((n) => stepNumbers.includes(n), "Unknown step"),
  content: z.string().max(10000),
  complete: z.boolean().optional(),
});

export async function GET() {
  const session = await requireUserForApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const data = await getFinalProjectAnswers(getDb(), session.userId);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  const session = await requireUserForApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  try {
    const db = getDb();
    const data = await saveFinalProjectStep(db, session.userId, parsed.data.stepNumber, parsed.data.content);
    if (parsed.data.complete) {
      await completeFinalProjectTx(db, session.userId);
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}
