import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import * as schema from "./schema";
import type { Database } from "./types";

/**
 * Real-Postgres test database for Vitest: PGlite is Postgres itself, compiled to WASM, not a
 * SQLite shim - see docs/PHASE-4.md "Testing" for why this stands in for a live Postgres server
 * in this sandbox (no superuser access to the local Postgres install was available - see that
 * doc for details). Each call returns a fresh, isolated in-memory database with the real
 * drizzle-kit-generated migration applied.
 */
export async function createTestDb(): Promise<Database> {
  const client = new PGlite();
  const db = drizzle(client, { schema }) as unknown as Database;

  const migrationsDir = join(process.cwd(), "drizzle");
  const files = readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort();
  for (const file of files) {
    const sql = readFileSync(join(migrationsDir, file), "utf-8");
    const statements = sql.split("--> statement-breakpoint");
    for (const statement of statements) {
      const trimmed = statement.trim();
      if (trimmed) await client.exec(trimmed);
    }
  }

  return db;
}
