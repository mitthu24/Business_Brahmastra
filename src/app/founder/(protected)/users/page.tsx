import type { Metadata } from "next";
import Link from "next/link";
import { getDb } from "@/lib/db/client";
import { listUsersForFounder } from "@/lib/db/founder-queries";
import { UsersTable } from "./UsersTable";

export const metadata: Metadata = { title: "Founder · Users" };
export const dynamic = "force-dynamic";

export default async function FounderUsersPage() {
  const users = await listUsersForFounder(getDb());

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-1">
        <h1 className="text-2xl font-bold">Users</h1>
        <Link
          href="/founder/users/new"
          className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          Create user
        </Link>
      </div>
      <p className="text-muted mb-6">{users.length} account{users.length === 1 ? "" : "s"}.</p>
      <UsersTable users={users} />
    </div>
  );
}
