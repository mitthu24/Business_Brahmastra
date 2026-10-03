import type { Metadata } from "next";
import { getDb } from "@/lib/db/client";
import { listUsersForFounder } from "@/lib/db/founder-queries";
import { UsersTable } from "./UsersTable";

export const metadata: Metadata = { title: "Founder · Users" };
export const dynamic = "force-dynamic";

export default async function FounderUsersPage() {
  const users = await listUsersForFounder(getDb());

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Users</h1>
      <p className="text-muted mb-6">{users.length} account{users.length === 1 ? "" : "s"}.</p>
      <UsersTable users={users} />
    </div>
  );
}
