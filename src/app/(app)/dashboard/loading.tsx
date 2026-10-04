import { Skeleton } from "@/components/ui/Skeleton";

/** Matches DashboardView's actual shape (greeting, mission card, 6-stat grid, phase card) so
 * nothing jumps when the real content streams in. */
export default function DashboardLoading() {
  return (
    <div>
      <Skeleton className="h-7 w-64 mb-2" />
      <Skeleton className="h-4 w-72 mb-6" />
      <Skeleton className="h-28 mb-6" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
      <Skeleton className="h-24" />
    </div>
  );
}
