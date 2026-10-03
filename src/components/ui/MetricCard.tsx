import { Icon } from "@/components/nav/Icon";

export function MetricCard({
  icon,
  label,
  value,
  highlight,
  warn,
}: {
  icon?: string;
  label: string;
  value: string;
  highlight?: boolean;
  warn?: boolean;
}) {
  return (
    <div className={`card p-4 ${highlight ? "bg-primary/10 border-primary/30" : ""}`}>
      {icon && <Icon name={icon} size={16} className="text-primary mb-2" />}
      <div className={`text-xl font-bold ${warn ? "text-warning" : highlight ? "text-primary" : ""}`}>{value}</div>
      <div className="text-xs text-muted mt-0.5">{label}</div>
    </div>
  );
}
