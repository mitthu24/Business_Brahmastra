import "server-only";
import { eq, and, or, ilike, type SQL } from "drizzle-orm";
import type { Database } from "./types";
import { achievementEntries } from "./schema";
import type { ContentStatus } from "./content-queries";
import { achievements as trustedAchievements } from "@/lib/progress/achievements";

export interface AchievementFilters {
  status?: ContentStatus;
  search?: string;
}

export interface AchievementEntryRow {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  xp: number;
  status: ContentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export async function listAchievementEntries(db: Database, filters: AchievementFilters = {}): Promise<AchievementEntryRow[]> {
  const conditions: SQL[] = [];
  if (filters.status) conditions.push(eq(achievementEntries.status, filters.status));
  if (filters.search) {
    const needle = `%${filters.search}%`;
    conditions.push(or(ilike(achievementEntries.name, needle), ilike(achievementEntries.description, needle))!);
  }
  return db
    .select()
    .from(achievementEntries)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(achievementEntries.name);
}

export async function getAchievementEntry(db: Database, id: string): Promise<AchievementEntryRow | null> {
  const [row] = await db.select().from(achievementEntries).where(eq(achievementEntries.id, id)).limit(1);
  return row ?? null;
}

/** The learner read path (docs/PHASE-5.3.md "Achievement CMS"): only published metadata is ever
 * shown, falling back to the trusted hardcoded definition for any achievement id not yet migrated
 * into the CMS - never hiding an achievement the engine can actually unlock just because its CMS
 * row doesn't exist yet. Unlock eligibility itself is untouched; this only governs display. */
export async function listPublishedAchievementsForLearner(
  db: Database
): Promise<{ id: string; name: string; description: string; icon: string }[]> {
  const rows = await db.select().from(achievementEntries);
  const byId = new Map(rows.map((r) => [r.id, r]));
  return trustedAchievements
    .map((a) => {
      const row = byId.get(a.id);
      if (row) return row.status === "published" ? { id: a.id, name: row.name, description: row.description, icon: row.icon } : null;
      return { id: a.id, name: a.title, description: a.description, icon: a.icon };
    })
    .filter((a): a is { id: string; name: string; description: string; icon: string } => a !== null);
}

export interface AchievementEntryInput {
  name: string;
  description: string;
  icon: string;
  category: string;
  xp: number;
}

/** Only ever creates a row for an id the trusted engine already knows about - see
 * src/app/founder/achievement-actions.ts for the enforcement, since a row for an unknown id would
 * display in the CMS but could never actually unlock for any learner. */
export async function createAchievementEntry(
  db: Database,
  id: string,
  input: AchievementEntryInput,
  status: ContentStatus,
  founderId: string
): Promise<AchievementEntryRow> {
  const [row] = await db
    .insert(achievementEntries)
    .values({ id, ...input, status, createdBy: founderId, updatedBy: founderId })
    .returning();
  return row;
}

export async function updateAchievementEntry(db: Database, id: string, input: AchievementEntryInput, founderId: string): Promise<void> {
  await db
    .update(achievementEntries)
    .set({ ...input, updatedBy: founderId, updatedAt: new Date() })
    .where(eq(achievementEntries.id, id));
}

export async function setAchievementEntryStatus(db: Database, id: string, status: ContentStatus, founderId: string): Promise<void> {
  await db
    .update(achievementEntries)
    .set({ status, updatedBy: founderId, updatedAt: new Date() })
    .where(eq(achievementEntries.id, id));
}
