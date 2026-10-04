import { Skeleton } from "@/components/ui/Skeleton";

/** Matches the lesson page's actual article shape (header + a stack of section cards) so
 * clicking "Continue Learning" shows an immediate, layout-matching placeholder rather than a
 * blank page while the lesson row and access check resolve. */
export default function LessonLoading() {
  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <Skeleton className="h-4 w-56 mb-3" />
        <Skeleton className="h-9 w-3/4 mb-3" />
        <Skeleton className="h-2.5 w-full" />
      </div>
      {Array.from({ length: 5 }, (_, i) => (
        <Skeleton key={i} className="h-28" />
      ))}
    </div>
  );
}
