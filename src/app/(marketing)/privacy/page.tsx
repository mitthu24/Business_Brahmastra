import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How 90-Day Business School collects, stores and uses your data.",
  alternates: { canonical: "/privacy" },
};

/** Describes only what this app actually does, verified against the codebase at the time of
 * writing (docs/PHASE-5.4.md legal pages are not asked to fabricate claims) - no third-party
 * analytics or ad trackers are present (checked: no google-analytics/gtag/mixpanel/segment/
 * posthog/hotjar/pixel references anywhere in src), passwords are bcrypt-hashed and never stored
 * in plain text (src/lib/db/schema.ts users.passwordHash), and sessions are HttpOnly/Secure
 * cookies, not client-readable tokens (src/lib/db/schema.ts sessions table, Phase 4). This is a
 * plain-language policy, not a substitute for legal review before real-world launch. */
export default function PrivacyPage() {
  return (
    <div className="px-4 lg:px-8 max-w-2xl mx-auto pt-16 pb-24 prose-sm">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted mb-10">Last updated: this policy describes the product as it currently works.</p>

      <div className="space-y-8 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">What we collect</h2>
          <p>
            When you create an account, we store your name, email address, and a securely hashed
            password (never your plain-text password). As you use the product, we store your learning
            progress — completed lessons, exercises and quizzes, streak, XP, achievements, journal
            entries, business model canvas, and final project content — so it is there when you come
            back on any device.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">How we use it</h2>
          <p>
            Your data is used only to run the product: authenticating you, syncing your progress, and
            letting our team provide support if you contact us. We do not sell your data.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">Cookies and sessions</h2>
          <p>
            We use a single session cookie to keep you logged in. It is HttpOnly and cannot be read by
            page scripts. We do not use third-party advertising or analytics trackers.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">Founder/admin access</h2>
          <p>
            A small number of founder accounts can view account and progress information to provide
            support and manage the product. Every such action is recorded in an internal audit log.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">Your data, your control</h2>
          <p>
            Contact us if you want a copy of your data or want your account removed.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">Changes</h2>
          <p>
            If this policy changes meaningfully, we will update this page.
          </p>
        </section>
      </div>
    </div>
  );
}
