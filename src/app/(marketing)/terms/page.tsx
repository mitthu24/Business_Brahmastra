import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms governing use of 90-Day Business School.",
  alternates: { canonical: "/terms" },
};

/** Plain-language terms describing the product as it actually works - the trial length,
 * suspension/access-control behavior, and lack of a payment system are all real, verified
 * against src/lib/access/status.ts and src/lib/db/schema.ts, not invented for this page. Not a
 * substitute for legal review before real-world launch. */
export default function TermsPage() {
  return (
    <div className="px-4 lg:px-8 max-w-2xl mx-auto pt-16 pb-24">
      <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-sm text-muted mb-10">Last updated: these terms describe the product as it currently works.</p>

      <div className="space-y-8 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">Your account</h2>
          <p>
            You&apos;re responsible for keeping your login credentials secure and for the accuracy of the
            information you provide when creating an account.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">Free trial and access</h2>
          <p>
            New accounts receive a free trial. After it ends, continued access may be suspended or
            require arrangement with our team — see the Pricing page. We may suspend or revoke access
            for accounts that violate these terms.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">Educational content, not professional advice</h2>
          <p>
            Lessons, calculators, case studies and the startup validator are educational tools. They are
            not financial, legal, tax, or professional business advice, and the startup validator does
            not predict business success.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">Acceptable use</h2>
          <p>
            Don&apos;t attempt to access another user&apos;s account or data, interfere with the service, or use
            it for anything unlawful.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">Changes</h2>
          <p>
            We may update these terms as the product evolves. Continued use after a change means you
            accept the updated terms.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">Contact</h2>
          <p>Questions about these terms? Reach us via the Contact page.</p>
        </section>
      </div>
    </div>
  );
}
