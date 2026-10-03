import "server-only";
import { eq } from "drizzle-orm";
import type { Database } from "./types";
import { finalProjects, finalProjectSteps } from "./schema";
import { wizardSteps, emptyWizardAnswers, type WizardAnswers } from "@/lib/final-project";

async function ensureProject(db: Database, userId: string) {
  const rows = await db.select().from(finalProjects).where(eq(finalProjects.userId, userId)).limit(1);
  if (rows[0]) return rows[0];
  const [created] = await db.insert(finalProjects).values({ userId }).onConflictDoNothing().returning();
  if (created) return created;
  // Lost a race with a concurrent request that inserted first - read it back.
  const [row] = await db.select().from(finalProjects).where(eq(finalProjects.userId, userId)).limit(1);
  return row;
}

export async function getFinalProjectAnswers(db: Database, userId: string): Promise<{ answers: WizardAnswers; completed: boolean }> {
  const rows = await db.select().from(finalProjects).where(eq(finalProjects.userId, userId)).limit(1);
  const project = rows[0];
  const answers = emptyWizardAnswers();
  if (!project) return { answers, completed: false };
  const steps = await db.select().from(finalProjectSteps).where(eq(finalProjectSteps.finalProjectId, project.id));
  for (const step of steps) {
    const def = wizardSteps.find((s) => s.stepNumber === step.stepNumber);
    if (def) answers[def.id] = step.content;
  }
  return { answers, completed: project.completed };
}

/** Per-step save (idempotent: unique(finalProjectId, stepNumber), upsert on conflict). */
export async function saveFinalProjectStep(db: Database, userId: string, stepNumber: number, content: string) {
  return db.transaction(async (tx) => {
    const project = await ensureProject(tx, userId);
    await tx
      .insert(finalProjectSteps)
      .values({ finalProjectId: project.id, stepNumber, content })
      .onConflictDoUpdate({
        target: [finalProjectSteps.finalProjectId, finalProjectSteps.stepNumber],
        set: { content, updatedAt: new Date() },
      });
    return getFinalProjectAnswers(tx, userId);
  });
}

export async function setFinalProjectTitle(db: Database, userId: string, title: string) {
  await db.transaction(async (tx) => {
    const project = await ensureProject(tx, userId);
    await tx.update(finalProjects).set({ title, updatedAt: new Date() }).where(eq(finalProjects.id, project.id));
  });
}
