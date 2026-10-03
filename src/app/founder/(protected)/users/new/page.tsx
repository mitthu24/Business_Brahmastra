import type { Metadata } from "next";
import { CreateUserForm } from "./CreateUserForm";

export const metadata: Metadata = { title: "Founder · Create user" };

export default function CreateUserPage() {
  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold mb-1">Create user</h1>
      <p className="text-muted mb-6">New accounts default to the learner role.</p>
      <CreateUserForm />
    </div>
  );
}
