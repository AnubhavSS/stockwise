/**
 * Branded spinner used while a route, store, or chart is still loading.
 */

import { LoaderCircle } from "lucide-react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type PageLoaderProps = {
  label?: string;
  className?: string;
  /** Covers the viewport — used until Zustand rehydrates from localStorage. */
  fullScreen?: boolean;
};

export function PageLoader({
  label = "Loading Stockwise…",
  className,
  fullScreen = false,
}: PageLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        fullScreen
          ? "fixed inset-0 z-50 bg-background"
          : "min-h-[min(28rem,70vh)] w-full",
        className,
      )}
    >
      <span className="relative flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
        <LoaderCircle className="size-7 animate-spin" aria-hidden />
      </span>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="mt-1 text-xs text-muted-foreground">{siteConfig.tagline}</p>
      </div>
      <span className="sr-only">Loading</span>
    </div>
  );
}

/** Compact spinner for chart cards that load on the client only. */
export function ChartLoader({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex h-full min-h-40 w-full items-center justify-center", className)}
    >
      <LoaderCircle className="size-6 animate-spin text-primary" aria-hidden />
      <span className="sr-only">Loading chart</span>
    </div>
  );
}
