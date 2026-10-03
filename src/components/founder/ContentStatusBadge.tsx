import type { ContentStatus } from "@/lib/db/content-queries";

const STYLE: Record<ContentStatus, string> = {
  published: "bg-success/15 text-success",
  draft: "bg-muted/15 text-muted",
  archived: "bg-danger/15 text-danger",
};

export function ContentStatusBadge({ status }: { status: ContentStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STYLE[status]}`}>
      {status}
    </span>
  );
}
