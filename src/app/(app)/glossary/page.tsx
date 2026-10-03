import type { Metadata } from "next";
import { glossary } from "@/lib/content/glossary";
import { GlossarySearch } from "@/components/glossary/GlossarySearch";

export const metadata: Metadata = { title: "Business Glossary" };

export default function GlossaryPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Business Glossary</h1>
      <p className="text-muted mb-6">{glossary.length}+ business and startup terms, explained simply.</p>
      <GlossarySearch terms={glossary} />
    </div>
  );
}
