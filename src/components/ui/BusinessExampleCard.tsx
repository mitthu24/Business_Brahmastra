export function BusinessExampleCard({
  label,
  icon,
  text,
  illustrative,
}: {
  label: string;
  icon: string;
  text: string;
  illustrative?: boolean;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-xs font-semibold text-muted flex items-center gap-1.5">
          <span aria-hidden>{icon}</span> {label.toUpperCase()}
        </span>
        {illustrative && (
          <span className="text-[10px] rounded-full bg-warning/15 text-warning px-2 py-0.5 shrink-0">
            Illustrative
          </span>
        )}
      </div>
      <p className="text-sm text-muted">{text}</p>
    </div>
  );
}
