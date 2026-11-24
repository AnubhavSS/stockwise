/**
 * Four dashboard KPI cards derived from the shared stores for the selected period.
 */

import {
  AlertTriangle,
  Boxes,
  Package,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/calculations";
import { cn } from "@/lib/utils";
import type { DashboardStats } from "@/types/common";

type DashboardStatsProps = {
  stats: DashboardStats;
};

function Trend({ value }: { value: number }) {
  const positive = value >= 0;
  const Icon = positive ? TrendingUp : TrendingDown;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        positive ? "text-success" : "text-destructive",
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {formatPercent(value)}
    </span>
  );
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const cards = [
    {
      title: "Total Sales",
      value: formatCurrency(stats.periodSalesTotal),
      icon: ShoppingCart,
      iconClass: "bg-primary/10 text-primary",
      trend: stats.salesChangePercent,
      hint: "vs previous period",
    },
    {
      title: "Total Purchases",
      value: formatCurrency(stats.periodPurchaseTotal),
      icon: Package,
      iconClass: "bg-[#111C32]/8 text-[#111C32]",
      trend: stats.purchaseChangePercent,
      hint: "vs previous period",
    },
    {
      title: "Total Items",
      value: formatNumber(stats.totalStockQuantity),
      icon: Boxes,
      iconClass: "bg-success/10 text-success",
      hint: `${formatNumber(stats.totalProducts)} SKUs in catalogue`,
    },
    {
      title: "Low Stock Items",
      value: formatNumber(stats.lowStockCount),
      icon: AlertTriangle,
      iconClass: "bg-warning/15 text-[#8A5A12]",
      hint: "Items need attention",
      warning: true,
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* Each card: label, formatted value, vs-previous trend, and hint */}
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.title}
            className={cn(
              "border-border bg-card py-4 shadow-sm ring-1 ring-border",
              card.warning && "bg-warning/5",
            )}
          >
            <div className="flex items-start justify-between gap-3 px-4">
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">
                  {card.value}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  {card.trend !== undefined ? <Trend value={card.trend} /> : null}
                  <span className="text-xs text-muted-foreground">{card.hint}</span>
                </div>
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
