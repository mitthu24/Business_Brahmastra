import { Skeleton } from "@/components/ui/Skeleton";

/** Generic fallback for every (app)-group route that doesn't have its own more specific
 * loading.tsx (dashboard and the lesson page do - this one covers progress, achievements,
 * journal, account, etc.). Shaped like "a page header plus a card grid", the common shape across
 * these pages, so the layout doesn't jump when real content replaces it. */
export default function AppLoading() {
  return (
    <div>
      <Skeleton className="h-7 w-48 mb-2" />
      <Skeleton className="h-4 w-80 mb-6" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    </div>
  );
}
