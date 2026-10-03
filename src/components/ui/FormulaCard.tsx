"use client";

import { useState } from "react";
import { Icon } from "@/components/nav/Icon";

export function FormulaCard({
  name,
  expression,
  example,
}: {
  name: string;
  expression: string;
  example?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(expression);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — silently ignore
    }
  }

  return (
    <div className="card p-5 bg-primary/10 border-primary/30">
      <div className="flex items-start justify-between gap-3 mb-2">
        <p className="font-semibold">{name}</p>
        <button
          onClick={copy}
          className="shrink-0 flex items-center gap-1.5 text-xs text-muted hover:text-foreground rounded-lg border border-border px-2 py-1 transition-colors"
          aria-label={`Copy formula: ${name}`}
        >
          <Icon name={copied ? "Check" : "Copy"} size={13} />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="whitespace-pre-wrap font-mono text-sm text-primary mb-3">{expression}</pre>
      {example && <p className="text-sm text-muted border-t border-border pt-3">{example}</p>}
    </div>
  );
}
