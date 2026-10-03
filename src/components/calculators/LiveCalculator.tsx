"use client";

import { useState } from "react";

export interface FieldConfig {
  id: string;
  label: string;
  defaultValue: number;
  prefix?: string;
  suffix?: string;
  step?: number;
}

export interface ResultConfig {
  id: string;
  label: string;
  format: (value: number) => string;
  highlight?: boolean;
}

export function LiveCalculator({
  fields,
  resultConfigs,
  compute,
}: {
  fields: FieldConfig[];
  resultConfigs: ResultConfig[];
  compute: (values: Record<string, number>) => Record<string, number>;
}) {
  const [values, setValues] = useState<Record<string, number>>(
    Object.fromEntries(fields.map((f) => [f.id, f.defaultValue]))
  );

  const results = compute(values);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        {fields.map((f) => (
          <div key={f.id}>
            <label htmlFor={f.id} className="text-sm font-medium block mb-1">
              {f.label}
            </label>
            <div className="flex items-center rounded-lg border border-border bg-bg-elevated overflow-hidden focus-within:border-primary">
              {f.prefix && <span className="px-3 text-muted text-sm">{f.prefix}</span>}
              <input
                id={f.id}
                type="number"
                step={f.step ?? "any"}
                value={values[f.id]}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [f.id]: e.target.value === "" ? 0 : Number(e.target.value) }))
                }
                className="w-full bg-transparent px-3 py-2.5 text-sm outline-none"
              />
              {f.suffix && <span className="px-3 text-muted text-sm">{f.suffix}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {resultConfigs.map((r) => {
          const value = results[r.id];
          return (
            <div
              key={r.id}
              className={`card p-4 ${r.highlight ? "bg-primary/10 border-primary/30" : ""}`}
            >
              <div className="text-xs text-muted mb-1">{r.label}</div>
              <div className={`text-2xl font-bold ${r.highlight ? "text-primary" : ""}`}>
                {Number.isFinite(value) ? r.format(value) : "∞"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
