import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Production/dev DB client. Always targets Postgres (via the `postgres` driver), per
 * Phase 4's choice of Drizzle ORM + Postgres. Tests use a separate pglite-backed client
 * (src/lib/db/test-client.ts) so they don't require DATABASE_URL - see docs/PHASE-4.md.
 *
 * The connection is created lazily (on first `getDb()` call) rather than at module load,
 * so that `next build` can statically analyze routes without a DATABASE_URL present; the
 * app's protected routes are all dynamic and only call getDb() at request time.
 */
type AppDb = ReturnType<typeof drizzle<typeof schema>>;

declare global {
  var __bbDbInstance: AppDb | undefined;
}

function getConnectionString(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and point it at a Postgres database. See docs/PHASE-4.md."
    );
  }
  return url;
}

export function getDb(): AppDb {
  if (!global.__bbDbInstance) {
    const sql = postgres(getConnectionString(), { max: Number(process.env.DB_POOL_MAX) || 10 });
    global.__bbDbInstance = drizzle(sql, { schema });
  }
  return global.__bbDbInstance;
}
