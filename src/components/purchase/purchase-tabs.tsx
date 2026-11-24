"use client";

/**
 * All / Ordered / Partially received / Received / Cancelled.
 */
import type { PurchaseTab } from "@/features/purchase/selectors";
import { formatNumber } from "@/lib/calculations";
import { cn } from "@/lib/utils";

type PurchaseTabsProps = {
  value: PurchaseTab;
  counts: Record<PurchaseTab, number>;
  onValueChange: (value: PurchaseTab) => void;
};

export function PurchaseTabs({ value, counts, onValueChange }: PurchaseTabsProps) {
  const tabs: Array<{ id: PurchaseTab; label: string }> = [
    { id: "all", label: "All Purchases" },
    { id: "ordered", label: "Ordered" },
    { id: "partially_received", label: "Partially Received" },
    { id: "received", label: "Received" },
    { id: "cancelled", label: "Cancelled" },
  ];

  return (
    <div
      role="tablist"
      aria-label="Purchase views"
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
