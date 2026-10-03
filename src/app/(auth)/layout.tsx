import Link from "next/link";
import { verifySession } from "@/lib/auth/dal";
import { redirect } from "next/navigation";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  // Optimistic UX nicety: someone already signed in who lands on /login or /signup goes
  // straight to their dashboard instead of seeing a form. This is not the authorization boundary
  // (the (app) layout re-verifies the session itself) - just a redirect for convenience.
  const session = await verifySession();
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <span className="text-2xl" aria-hidden>
          🎓
        </span>
        <span className="font-semibold text-lg">90-Day Business School</span>
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
