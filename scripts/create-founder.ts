/**
 * One-off operator script to create or promote a founder account (docs/PHASE-5.md "Founder
 * authentication"). Run with DATABASE_URL pointed at the target database:
 *
 *   DATABASE_URL=<connection string> FOUNDER_PASSWORD='<password>' \
 *     npx tsx scripts/create-founder.ts founder@example.com "Founder Name"
 *
 * The password is read from the FOUNDER_PASSWORD environment variable only - never from argv
 * (which would leak into shell history and `ps`), never hardcoded, and never printed back. If the
 * email already exists, that account is promoted to role "founder" (password left untouched); the
 * password still must not be passed since it isn't used in that path - run with any value or unset.
 */
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import * as schema from "../src/lib/db/schema";

async function main() {
  const [email, name] = process.argv.slice(2);
  if (!email) {
    console.error("Usage: DATABASE_URL=... FOUNDER_PASSWORD=... npx tsx scripts/create-founder.ts <email> [name]");
    process.exit(1);
  }
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  const sql = postgres(databaseUrl, { max: 1 });
  const db = drizzle(sql, { schema });

  try {
    const existing = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);

    if (existing[0]) {
      if (existing[0].role === "founder") {
        console.log(`${email} is already a founder.`);
        return;
      }
      await db.update(schema.users).set({ role: "founder", updatedAt: new Date() }).where(eq(schema.users.id, existing[0].id));
      console.log(`Promoted existing account ${email} to founder.`);
      return;
    }

    const password = process.env.FOUNDER_PASSWORD;
    if (!password || password.length < 8) {
      console.error("FOUNDER_PASSWORD must be set (8+ characters) to create a new founder account.");
      process.exit(1);
    }
    const passwordHash = await bcrypt.hash(password, 12);

    await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(schema.users)
        .values({ email, passwordHash, role: "founder" })
        .returning();
      await tx.insert(schema.userProfiles).values({
        userId: user.id,
        name: name ?? "Founder",
        avatarInitials: (name ?? "Founder").slice(0, 2).toUpperCase(),
      });
    });
    console.log(`Created founder account for ${email}.`);
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
