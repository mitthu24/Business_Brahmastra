export function LessonSection({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-sm font-semibold tracking-wide text-muted mb-3 flex items-center gap-2">
        <span aria-hidden>{icon}</span> {title}
      </h2>
      {children}
    </section>
  );
}
