import "server-only";
import { eq } from "drizzle-orm";
import type { Database } from "./types";
import { productSettings, curriculumPhaseOverrides } from "./schema";
import { phases as hardcodedPhases } from "@/lib/content/phases";

const SINGLETON_ID = "singleton";

export interface ProductSettingsRow {
  productName: string;
  productDescription: string;
  logoUrl: string | null;
  defaultTrialDays: number;
  defaultNewUserAccess: "trial" | "active";
  defaultContentStatus: "draft" | "published" | "archived";
  updatedAt: Date;
}

const DEFAULTS: ProductSettingsRow = {
  productName: "90-Day Business School",
  productDescription: "",
  logoUrl: null,
  defaultTrialDays: 3,
  defaultNewUserAccess: "trial",
  defaultContentStatus: "draft",
  updatedAt: new Date(0),
};

/** Reads the single settings row, creating it with defaults on first read (idempotent - a
 * concurrent first read racing this insert just hits the unique PK and we re-read). Never throws
 * on a fresh database with no row yet. */
export async function getProductSettings(db: Database): Promise<ProductSettingsRow> {
  const rows = await db.select().from(productSettings).where(eq(productSettings.id, SINGLETON_ID)).limit(1);
  if (rows[0]) {
    return {
      productName: rows[0].productName,
      productDescription: rows[0].productDescription,
      logoUrl: rows[0].logoUrl,
      defaultTrialDays: rows[0].defaultTrialDays,
      defaultNewUserAccess: rows[0].defaultNewUserAccess as "trial" | "active",
      defaultContentStatus: rows[0].defaultContentStatus,
      updatedAt: rows[0].updatedAt,
    };
  }
  return DEFAULTS;
}

/** Updates (or creates, on first write) the singleton settings row. Changing defaultTrialDays
 * affects only users signed up AFTER this call - see schema.ts productSettings comment - it never
 * touches the `users` table. */
export async function updateProductSettings(
  db: Database,
  updates: Partial<Omit<ProductSettingsRow, "updatedAt">>,
  founderId: string
): Promise<void> {
  const current = await getProductSettings(db);
  await db
    .insert(productSettings)
    .values({ id: SINGLETON_ID, ...current, ...updates, updatedBy: founderId, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: productSettings.id,
      set: { ...updates, updatedBy: founderId, updatedAt: new Date() },
    });
}

export interface PhaseDisplayRow {
  id: string; // phase number as string
  number: number;
  name: string;
  description: string;
  startDay: number;
  endDay: number;
  overridden: boolean;
  updatedAt: Date | null;
}

/** The 15 phases, with any founder-entered name/description override merged in. Day ranges are
 * never overridable (they are not stored here at all - see schema.ts curriculumPhaseOverrides) so
 * this can never disagree with which lessons belong to which phase. */
export async function listPhasesForFounder(db: Database): Promise<PhaseDisplayRow[]> {
  const overrides = await db.select().from(curriculumPhaseOverrides);
  const overrideById = new Map(overrides.map((o) => [o.id, o]));

  return hardcodedPhases.map((p) => {
    const override = overrideById.get(String(p.number));
    return {
      id: String(p.number),
      number: p.number,
      name: override?.name ?? p.title,
      description: override?.description ?? p.description,
      startDay: p.startDay,
      endDay: p.endDay,
      overridden: Boolean(override),
      updatedAt: override?.updatedAt ?? null,
    };
  });
}

export async function updatePhaseOverride(
  db: Database,
  phaseNumber: number,
  updates: { name: string; description: string },
  founderId: string
): Promise<void> {
  const id = String(phaseNumber);
  await db
    .insert(curriculumPhaseOverrides)
    .values({ id, name: updates.name, description: updates.description, updatedBy: founderId, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: curriculumPhaseOverrides.id,
      set: { name: updates.name, description: updates.description, updatedBy: founderId, updatedAt: new Date() },
    });
}
