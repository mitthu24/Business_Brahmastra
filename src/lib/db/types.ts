import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import type * as schema from "./schema";

/** The shape of our drizzle client, loose enough to also accept the `tx` object passed into a
 * `db.transaction(async (tx) => ...)` callback (which has a slightly narrower type than the
 * top-level client). Query modules take this as a parameter instead of importing getDb()
 * directly, so tests can inject a pglite-backed instance - see src/lib/db/test-client.ts. */
export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;
