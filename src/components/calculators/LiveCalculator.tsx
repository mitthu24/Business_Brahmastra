"use client";

import { useState } from "react";

export interface FieldConfig {
  id: string;
  label: string;
  defaultValue: number;
  prefix?: string;
  suffix?: string;
  step?: number;
  /** Clamps the value into [min, max] on change — use for inputs like percentages where out-of-range values would produce nonsensical results (e.g. negative ownership). */
  min?: number;
  max?: number;
}

function clamp(value: number, min?: number, max?: number) {
  let result = value;
  if (min !== undefined) result = Math.max(min, result);
  if (max !== undefined) result = Math.min(max, result);
  return result;
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
  chart,
  interpretation,
}: {
  fields: FieldConfig[];
  resultConfigs: ResultConfig[];
  compute: (values: Record<string, number>) => Record<string, number>;
  /** Optional chart renderer, given the same live values/results used by the result cards above — it never computes its own logic. */
  chart?: (ctx: { values: Record<string, number>; results: Record<string, number> }) => React.ReactNode;
  /** Optional plain-language "what does this mean?" explanation shown below the results. */
  interpretation?: (ctx: { values: Record<string, number>; results: Record<string, number> }) => string;
}) {
  const [values, setValues] = useState<Record<string, number>>(
    Object.fromEntries(fields.map((f) => [f.id, f.defaultValue]))
  );

  const results = compute(values);

  return (
    <div className="space-y-6">
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
                  min={f.min}
                  max={f.max}
                  value={values[f.id]}
                  onChange={(e) => {
                    const raw = e.target.value === "" ? 0 : Number(e.target.value);
                    setValues((prev) => ({ ...prev, [f.id]: clamp(raw, f.min, f.max) }));
                  }}
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
              <div key={r.id} className={`card p-4 ${r.highlight ? "bg-primary/10 border-primary/30" : ""}`}>
                <div className="text-xs text-muted mb-1">{r.label}</div>
                <div className={`text-2xl font-bold ${r.highlight ? "text-primary" : ""}`}>
                  {Number.isFinite(value) ? r.format(value) : "∞"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {chart && <div className="card p-5">{chart({ values, results })}</div>}

      {interpretation && (
        <div className="card p-5 bg-accent/10 border-accent/30">
          <p className="text-sm font-medium text-accent mb-1">What does this mean?</p>
          <p className="text-sm">{interpretation({ values, results })}</p>
        </div>
      )}
    </div>
  );
}
