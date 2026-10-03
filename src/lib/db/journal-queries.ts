import "server-only";
import { eq, and, desc } from "drizzle-orm";
import type { Database } from "./types";
import { journalEntries } from "./schema";
import type { JournalCategory } from "@/lib/journal";

export async function listJournalEntries(db: Database, userId: string) {
  return db
    .select()
    .from(journalEntries)
    .where(eq(journalEntries.userId, userId))
    .orderBy(desc(journalEntries.createdAt));
}

export async function createJournalEntryRow(db: Database, userId: string, category: JournalCategory, text: string) {
  const [row] = await db.insert(journalEntries).values({ userId, category, text }).returning();
  return row;
}

/** Deletes an entry only if it belongs to `userId` - returns false (no-op) for someone else's
 * entry rather than throwing, so a route handler can turn that into a 404 without leaking
 * whether the id exists at all. */
export async function deleteJournalEntryRow(db: Database, userId: string, entryId: string): Promise<boolean> {
  const deleted = await db
    .delete(journalEntries)
    .where(and(eq(journalEntries.id, entryId), eq(journalEntries.userId, userId)))
    .returning();
  return deleted.length > 0;
}
