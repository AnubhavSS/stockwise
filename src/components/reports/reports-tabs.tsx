"use client";

/**
 * In-page tabs: Overview, Sales, Purchase, Stock, Stock Movement.
 */
import { cn } from "@/lib/utils";
import type { ReportTab } from "@/features/reports/types";

type ReportsTabsProps = {
  value: ReportTab;
  onValueChange: (value: ReportTab) => void;
};

const TABS: Array<{ id: ReportTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "sales", label: "Sales Report" },
  { id: "purchases", label: "Purchase Report" },
  { id: "stock", label: "Stock Report" },
  { id: "movements", label: "Stock Movement Report" },
];

export function ReportsTabs({ value, onValueChange }: ReportsTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Report categories"
      className="flex gap-1 overflow-x-auto border-b border-border print:hidden"
    >
      {/* Underline on the active tab; print hides this chrome */}
      {TABS.map((tab) => {
        const selected = tab.id === value;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            className={cn(
              "relative shrink-0 px-3 py-2.5 text-sm font-medium transition-colors",
              selected ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
            onClick={() => onValueChange(tab.id)}
          >
            {tab.label}
            {selected ? (
              <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary" />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
