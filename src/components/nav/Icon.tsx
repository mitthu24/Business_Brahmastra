import * as Icons from "lucide-react";
import type { LucideProps } from "lucide-react";

type IconComponent = React.ForwardRefExoticComponent<LucideProps & React.RefAttributes<SVGSVGElement>>;

export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const icons = Icons as unknown as Record<string, IconComponent>;
  const Component = icons[name] ?? Icons.Circle;
  return <Component {...props} />;
}
