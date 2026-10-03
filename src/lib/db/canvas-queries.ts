import "server-only";
import { eq } from "drizzle-orm";
import type { Database } from "./types";
import { canvases } from "./schema";

export const CANVAS_BLOCK_IDS = [
  "keyPartners",
  "keyActivities",
  "valueProposition",
  "customerRelationships",
  "customerSegments",
  "keyResources",
  "channels",
  "costStructure",
  "revenueStreams",
] as const;

export type CanvasBlockId = (typeof CANVAS_BLOCK_IDS)[number];
export type CanvasData = Record<CanvasBlockId, string>;

export function emptyCanvas(): CanvasData {
  return Object.fromEntries(CANVAS_BLOCK_IDS.map((id) => [id, ""])) as CanvasData;
}

export async function getCanvas(db: Database, userId: string): Promise<CanvasData> {
  const rows = await db.select().from(canvases).where(eq(canvases.userId, userId)).limit(1);
  const row = rows[0];
  if (!row) return emptyCanvas();
  const data = emptyCanvas();
  for (const id of CANVAS_BLOCK_IDS) data[id] = row[id] ?? "";
  return data;
}

/** Full-row upsert (autosave): the UI always sends the whole canvas, so this is a plain
 * insert-or-replace keyed on the per-user unique row, not a field-by-field merge. */
export async function upsertCanvas(db: Database, userId: string, data: Partial<CanvasData>) {
  const existing = await db.select().from(canvases).where(eq(canvases.userId, userId)).limit(1);
  if (existing[0]) {
    await db.update(canvases).set({ ...data, updatedAt: new Date() }).where(eq(canvases.userId, userId));
  } else {
    await db.insert(canvases).values({ userId, ...emptyCanvas(), ...data });
  }
  return getCanvas(db, userId);
}
