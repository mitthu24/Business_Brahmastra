import type { Metadata } from "next";
import { formulas } from "@/lib/content/formulas";
import type { FormulaEntry } from "@/lib/content/types";

export const metadata: Metadata = { title: "Formula Library" };

const categories: FormulaEntry["category"][] = ["Finance", "Marketing", "Sales", "Growth", "Operations", "Startup"];

export default function FormulasPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Formula Library</h1>
      <p className="text-muted mb-6">Every formula taught in the course, organised by category, with a worked example.</p>
      <div className="space-y-10">
        {categories.map((cat) => {
          const items = formulas.filter((f) => f.category === cat);
          if (items.length === 0) return null;
          return (
            <section key={cat}>
              <h2 className="text-lg font-semibold mb-4">{cat}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((f) => (
                  <div key={f.id} id={f.id} className="card p-5 scroll-mt-20">
                    <h3 className="font-medium mb-2">{f.name}</h3>
                    <pre className="whitespace-pre-wrap font-mono text-sm text-primary bg-primary/10 rounded-lg p-3 mb-3">{f.expression}</pre>
                    <p className="text-sm text-muted mb-2">{f.explanation}</p>
                    <p className="text-xs text-muted border-t border-border pt-2 mt-2">{f.example}</p>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
