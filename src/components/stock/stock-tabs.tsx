"use client";

/**
 * All / Low stock / Out of stock.
 */
import { formatNumber } from "@/lib/calculations";
import { cn } from "@/lib/utils";
import type { StockSummary, StockTab } from "@/features/stock/selectors";

type StockTabsProps = {
  value: StockTab;
  summary: StockSummary;
  onValueChange: (value: StockTab) => void;
};

export function StockTabs({ value, summary, onValueChange }: StockTabsProps) {
  const tabs: Array<{ id: StockTab; label: string; count: number }> = [
    { id: "all", label: "All Items", count: summary.totalItems },
    { id: "low_stock", label: "Low Stock", count: summary.lowStock },
    { id: "out_of_stock", label: "Out of Stock", count: summary.outOfStock },
  ];

  return (
    <div
      role="tablist"
      aria-label="Stock views"
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
            {tab.label} ({formatNumber(tab.count)})
            {selected ? (
              <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary" />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
