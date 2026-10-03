export function ExerciseCard({
  prompt,
  revealed,
  answer,
  onReveal,
  xpLabel = "+25 XP",
}: {
  prompt: string;
  revealed: boolean;
  answer: string;
  onReveal: () => void;
  xpLabel?: string;
}) {
  return (
    <div className="card p-5">
      <p className="mb-4">{prompt}</p>
      {!revealed ? (
        <button
          onClick={onReveal}
          className="rounded-lg bg-bg-elevated border border-border px-4 py-2 text-sm font-medium hover:bg-primary/10 transition-colors"
        >
          Reveal Answer ({xpLabel})
        </button>
      ) : (
        <div className="rounded-lg bg-success/10 border border-success/30 p-4 text-sm">
          <div className="font-medium text-success mb-1">✅ Answer</div>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}
