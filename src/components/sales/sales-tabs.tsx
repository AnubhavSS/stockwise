"use client";

/**
 * All / Completed / Pending payment / Cancelled.
 */
import { formatNumber } from "@/lib/calculations";
import { cn } from "@/lib/utils";
import type { SalesTab } from "@/features/sales/selectors";

type SalesTabsProps = {
  value: SalesTab;
  counts: Record<SalesTab, number>;
  onValueChange: (value: SalesTab) => void;
};

export function SalesTabs({ value, counts, onValueChange }: SalesTabsProps) {
  const tabs: Array<{ id: SalesTab; label: string }> = [
    { id: "all", label: "All Sales" },
    { id: "completed", label: "Completed" },
    { id: "pending", label: "Pending Payment" },
    { id: "cancelled", label: "Cancelled" },
  ];

  return (
    <div
      role="tablist"
      aria-label="Sales views"
      className="flex gap-1 overflow-x-auto border-b border-border"
    >
      {tabs.map((tab) => {
        const selected = tab.id === value;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            className={cn(
              "relative shrink-0 px-3 py-2.5 text-sm font-medium transition-colors",
              selected
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
            onClick={() => onValueChange(tab.id)}
          >
            {tab.label} ({formatNumber(counts[tab.id])})
            {selected ? (
              <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary" />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
