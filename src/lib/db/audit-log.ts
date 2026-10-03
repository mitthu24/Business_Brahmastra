import "server-only";
import { desc, eq, and, type SQL } from "drizzle-orm";
import type { Database } from "./types";
import { auditLogs } from "./schema";

export type AuditAction =
  | "USER_CREATED"
  | "USER_UPDATED"
  | "USER_SUSPENDED"
  | "USER_REACTIVATED"
  | "PASSWORD_RESET"
  | "ACCESS_GRANTED"
  | "ACCESS_REVOKED"
  | "TRIAL_EXTENDED";

/** Records one founder action. Never pass passwords, hashes, or tokens in `metadata` - see
 * docs/PHASE-5.3.md "Audit logging". Logging failures never block the underlying action (a missed
 * log entry is bad; a failed user-suspend because logging hiccuped is worse) - callers should call
 * this after the real mutation succeeds and treat it as best-effort. */
export async function recordAuditLog(
  db: Database,
  entry: { founderId: string; action: AuditAction; entityType: string; entityId?: string; metadata?: Record<string, unknown> }
) {
  await db.insert(auditLogs).values({
    founderId: entry.founderId,
    action: entry.action,
    entityType: entry.entityType,
    entityId: entry.entityId,
    metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
  });
}

export interface AuditLogRow {
  id: string;
  founderId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

export async function listAuditLogs(
  db: Database,
  filters: { founderId?: string; action?: string; entityType?: string } = {},
  limit = 100
): Promise<AuditLogRow[]> {
  const conditions: SQL[] = [];
  if (filters.founderId) conditions.push(eq(auditLogs.founderId, filters.founderId));
  if (filters.action) conditions.push(eq(auditLogs.action, filters.action));
  if (filters.entityType) conditions.push(eq(auditLogs.entityType, filters.entityType));

  const rows = await db
    .select()
    .from(auditLogs)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);

  return rows.map((r) => ({
    ...r,
    metadata: r.metadata ? (JSON.parse(r.metadata) as Record<string, unknown>) : null,
  }));
}
