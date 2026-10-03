export function CaseStudyCard({
  text,
  read,
  onMarkRead,
  xpLabel = "+50 XP",
}: {
  text: string;
  read: boolean;
  onMarkRead: () => void;
  xpLabel?: string;
}) {
  return (
    <div className="card p-5">
      <p>{text}</p>
      {!read ? (
        <button
          onClick={onMarkRead}
          className="mt-4 rounded-lg bg-bg-elevated border border-border px-4 py-2 text-sm font-medium hover:bg-primary/10 transition-colors"
        >
          Mark as read ({xpLabel})
        </button>
      ) : (
        <p className="mt-3 text-xs text-success">Case study credited.</p>
      )}
    </div>
  );
}
