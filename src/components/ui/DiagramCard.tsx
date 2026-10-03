export function DiagramCard({
  title,
  description,
  children,
  footnote,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  footnote?: string;
}) {
  return (
    <div className="card p-5">
      <p className="font-semibold mb-1">{title}</p>
      {description && <p className="text-sm text-muted mb-4">{description}</p>}
      <div className="overflow-x-auto scrollbar-thin">{children}</div>
      {footnote && <p className="text-xs text-muted mt-4 border-t border-border pt-3">{footnote}</p>}
    </div>
  );
}
