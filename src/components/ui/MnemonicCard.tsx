export function MnemonicCard({
  label,
  breakdown,
  remember,
}: {
  label: string;
  breakdown: string[];
  remember?: string;
}) {
  return (
    <div className="card p-5 bg-accent/10 border-accent/30">
      <p className="font-semibold mb-2">{label}</p>
      <ul className="space-y-1 text-sm mb-3">
        {breakdown.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
      {remember && (
        <p className="text-sm border-t border-border pt-3">
          <span className="font-medium text-accent">🧠 Remember: </span>
          {remember}
        </p>
      )}
    </div>
  );
}
