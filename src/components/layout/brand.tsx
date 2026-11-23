import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type BrandProps = {
  compact?: boolean;
};

export function Brand({ compact = false }: BrandProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <svg
          viewBox="0 0 24 24"
          className="size-5"
          fill="none"
          aria-hidden
        >
          <path
            d="M4 8.5 12 4l8 4.5v9L12 22 4 17.5v-9Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path d="M12 12.5 20 8.5M12 12.5V22M12 12.5 4 8.5" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </span>
      <span className={cn("min-w-0", compact && "sr-only")}>
        <span className="block text-sm font-semibold tracking-tight">
          {siteConfig.name}
        </span>
        <span className="block truncate text-[11px] text-sidebar-foreground/70">
          {siteConfig.tagline}
        </span>
      </span>
    </div>
  );
}
