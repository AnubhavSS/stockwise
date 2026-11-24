/**
 * Live counts of products by stock status.
 */

import { AlertTriangle, Boxes, PackageCheck, PackageX } from "lucide-react";

import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/calculations";
import { cn } from "@/lib/utils";
import type { StockSummary } from "@/features/stock/selectors";

type StockSummaryCardsProps = {
  summary: StockSummary;
};

export function StockSummaryCards({ summary }: StockSummaryCardsProps) {
  const cards = [
    {
      title: "Total Items",
      value: summary.totalItems,
      hint: "Unique products in the catalogue",
      icon: Boxes,
      iconClass: "bg-[#3B82F6]/10 text-[#2563EB]",
    },
    {
      title: "In Stock",
      value: summary.inStock,
      hint: "Quantity above minimum level",
      icon: PackageCheck,
      iconClass: "bg-success/10 text-success",
    },
    {
      title: "Low Stock",
      value: summary.lowStock,
      hint: "At or below the reorder point",
      icon: AlertTriangle,
      iconClass: "bg-warning/15 text-[#8A5A12]",
    },
    {
      title: "Out of Stock",
      value: summary.outOfStock,
      hint: "Zero units available",
      icon: PackageX,
      iconClass: "bg-destructive/10 text-destructive",
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* Counts of SKUs, not units — except the units card itself */}
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.title}
            className="h-full border-border bg-card py-4 shadow-sm ring-1 ring-border"
          >
            <div className="flex h-full items-start justify-between gap-3 px-4">
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">
                  {formatNumber(card.value)}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">{card.hint}</p>
              </div>
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-xl",
                  card.iconClass,
                )}
              >
                <Icon className="size-4" aria-hidden />
              </span>
            </div>
          </Card>
        );
      })}
    </section>
  );
}
