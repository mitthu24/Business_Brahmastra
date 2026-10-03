// @vitest-environment node
import { describe, it, expect } from "vitest";
import { createTestDb } from "./test-client";
import { users } from "./schema";

describe("test-client (pglite)", () => {
  it("applies the real drizzle migration and can read/write", async () => {
    const db = await createTestDb();
    const [user] = await db.insert(users).values({ email: "a@example.com", passwordHash: "x" }).returning();
    expect(user.email).toBe("a@example.com");
    const rows = await db.select().from(users);
    expect(rows).toHaveLength(1);
  });
});
