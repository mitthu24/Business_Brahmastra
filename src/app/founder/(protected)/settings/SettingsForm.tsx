"use client";

import { useActionState } from "react";
import { updateSettingsAction, type FormState } from "../../settings-actions";
import type { ProductSettingsRow } from "@/lib/db/settings-queries";

export function SettingsForm({ settings }: { settings: ProductSettingsRow }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(updateSettingsAction, undefined);

  return (
    <form action={formAction} className="space-y-8">
      {state?.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}
      {state?.success && <p className="text-sm text-success">{state.success}</p>}

      <section className="card p-5">
        <h2 className="text-sm font-semibold mb-4">General</h2>
        <div className="space-y-4 max-w-xl">
          <div>
            <label htmlFor="productName" className="text-sm font-medium block mb-1">Product name</label>
            <input id="productName" name="productName" defaultValue={settings.productName} required className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
            {state?.fieldErrors?.productName && <p className="text-xs text-danger mt-1">{state.fieldErrors.productName[0]}</p>}
          </div>
          <div>
            <label htmlFor="productDescription" className="text-sm font-medium block mb-1">Product description</label>
            <textarea id="productDescription" name="productDescription" defaultValue={settings.productDescription} rows={2} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
          </div>
          <div>
            <label htmlFor="logoUrl" className="text-sm font-medium block mb-1">Logo URL (optional)</label>
            <input id="logoUrl" name="logoUrl" defaultValue={settings.logoUrl ?? ""} placeholder="https://…" className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
            <p className="text-xs text-muted mt-1">A hosted image URL only - uploading or executing files is not supported here.</p>
          </div>
        </div>
      </section>

      <section className="card p-5">
        <h2 className="text-sm font-semibold mb-1">Trial</h2>
        <p className="text-xs text-muted mb-4">
          Changing this affects only users who sign up after you save - it never modifies an existing user&apos;s trial.
        </p>
        <div className="max-w-xs">
          <label htmlFor="defaultTrialDays" className="text-sm font-medium block mb-1">Default trial days</label>
          <input id="defaultTrialDays" name="defaultTrialDays" type="number" min={0} max={365} defaultValue={settings.defaultTrialDays} required className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm outline-none focus-visible:border-primary" />
          {state?.fieldErrors?.defaultTrialDays && <p className="text-xs text-danger mt-1">{state.fieldErrors.defaultTrialDays[0]}</p>}
        </div>
      </section>

      <section className="card p-5">
        <h2 className="text-sm font-semibold mb-1">Access</h2>
        <p className="text-xs text-muted mb-4">Applies only to newly created users going forward.</p>
        <div className="max-w-xs">
          <label htmlFor="defaultNewUserAccess" className="text-sm font-medium block mb-1">Default new-user access</label>
          <select id="defaultNewUserAccess" name="defaultNewUserAccess" defaultValue={settings.defaultNewUserAccess} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm">
            <option value="trial">Trial</option>
            <option value="active">Active (standing access)</option>
          </select>
        </div>
      </section>

      <section className="card p-5">
        <h2 className="text-sm font-semibold mb-1">Content</h2>
        <p className="text-xs text-muted mb-4">
          The default status new content is created with across the Founder Control Center. Existing content is unaffected.
        </p>
        <div className="max-w-xs">
          <label htmlFor="defaultContentStatus" className="text-sm font-medium block mb-1">Default content status</label>
          <select id="defaultContentStatus" name="defaultContentStatus" defaultValue={settings.defaultContentStatus} className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </section>

      <button type="submit" disabled={pending} className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
        Save settings
      </button>
    </form>
  );
}
