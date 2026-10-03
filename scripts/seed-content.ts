/**
 * One-off operator script to copy the existing hardcoded glossary/formula/case-study content into
 * the new CMS tables (docs/PHASE-5.3.md "Reference content CMS migration"). Safe to re-run - see
 * src/lib/db/content-seed.ts#seedContentFromHardcoded for the idempotency guarantee. Run with
 * DATABASE_URL pointed at the target database:
 *
 *   DATABASE_URL=<connection string> npx tsx scripts/seed-content.ts
 */
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "../src/lib/db/schema";
import { seedContentFromHardcoded } from "../src/lib/db/content-seed";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  const sql = postgres(databaseUrl, { max: 1 });
  const db = drizzle(sql, { schema });

  try {
    const result = await seedContentFromHardcoded(db);
    console.log(`Glossary rows inserted: ${result.glossaryInserted}`);
    console.log(`Formula rows inserted: ${result.formulasInserted}`);
    console.log(`Case study rows inserted: ${result.caseStudiesInserted}`);
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
