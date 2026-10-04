import type { Metadata } from "next";
import { getDb } from "@/lib/db/client";
import { getProductSettings } from "@/lib/db/settings-queries";
import { SettingsForm } from "./SettingsForm";

export const metadata: Metadata = { title: "Founder · Settings" };
export const dynamic = "force-dynamic";

export default async function FounderSettingsPage() {
  const settings = await getProductSettings(getDb());

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-1">Settings</h1>
      <p className="text-muted mb-6">Product-wide defaults. No database credentials, environment variables, or payment secrets are ever shown here.</p>
      <SettingsForm settings={settings} />
    </div>
  );
}
