const toneStyles = {
  warning: "bg-warning/10 border-warning/30",
  success: "bg-success/10 border-success/30",
  info: "bg-primary/10 border-primary/30",
  accent: "bg-accent/10 border-accent/30",
} as const;

export function Callout({
  tone = "info",
  icon,
  title,
  children,
}: {
  tone?: keyof typeof toneStyles;
  icon?: string;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`card p-5 ${toneStyles[tone]}`}>
      {title && (
        <p className="font-medium mb-2 flex items-center gap-2">
          {icon && <span aria-hidden>{icon}</span>} {title}
        </p>
      )}
      <div className="text-sm">{children}</div>
    </div>
  );
}
