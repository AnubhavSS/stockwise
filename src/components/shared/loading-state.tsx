/**
 * Skeleton placeholder while a client workspace hydrates.
 */

import { Skeleton } from "@/components/ui/skeleton";

type LoadingStateProps = {
  rows?: number;
};

export function LoadingState({ rows = 5 }: LoadingStateProps) {
  return (
    <div className="space-y-3" role="status" aria-live="polite">
      <span className="sr-only">Loading</span>
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  );
}
