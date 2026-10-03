import { verifyAccess } from "@/lib/auth/dal";
import { redirect } from "next/navigation";

export default async function FounderLoginLayout({ children }: { children: React.ReactNode }) {
  // Only redirect away if the current session is ALREADY a founder - a regular logged-in learner
  // is allowed to see this form (they may hold a separate founder account), unlike the main
  // (auth) layout which redirects anyone with a session. Not the authorization boundary either
  // way; requireFounderOrRedirect in the protected founder layout re-checks on every request.
  const access = await verifyAccess();
  if (access?.user.role === "founder") redirect("/founder/dashboard");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-bg-elevated">
      <div className="flex items-center gap-2 mb-8">
        <span className="text-2xl" aria-hidden>
          🔑
        </span>
        <span className="font-semibold text-lg">Founder sign-in</span>
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
