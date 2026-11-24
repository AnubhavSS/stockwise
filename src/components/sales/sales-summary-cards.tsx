/**
 * Revenue, orders, AOV, and pending payments for the selected sales period.
 */

import {
  Banknote,
  Receipt,
  ShoppingCart,
  Wallet,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/calculations";
import { cn } from "@/lib/utils";
import type { SalesSummary } from "@/features/sales/selectors";

type SalesSummaryCardsProps = {
  summary: SalesSummary;
};

export function SalesSummaryCards({ summary }: SalesSummaryCardsProps) {
  const cards = [
    {
      title: "Total Sales",
      value: formatCurrency(summary.totalSales),
      hint: "vs previous period",
      trend: summary.salesChangePercent,
      icon: ShoppingCart,
      iconClass: "bg-primary/10 text-primary",
    },
    {
      title: "Total Orders",
      value: formatNumber(summary.totalOrders),
      hint: "Completed invoices",
      trend: summary.ordersChangePercent,
      icon: Receipt,
      iconClass: "bg-[#111C32]/8 text-[#111C32]",
    },
    {
      title: "Average Order Value",
      value: formatCurrency(summary.averageOrderValue),
      hint: "Revenue per completed sale",
      icon: Banknote,
      iconClass: "bg-success/10 text-success",
    },
    {
      title: "Pending Payments",
      value: formatCurrency(summary.pendingPayments),
      hint: "Outstanding customer balances",
      icon: Wallet,
      iconClass: "bg-warning/15 text-[#8A5A12]",
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* Completed sales only — cancelled invoices are not in these numbers */}
      {cards.map((card) => {
        const Icon = card.icon;
        const positive = (card.trend ?? 0) >= 0;
        return (
          <Card
            key={card.title}
            className="h-full border-border bg-card py-4 shadow-sm ring-1 ring-border"
          >
            <div className="flex h-full items-start justify-between gap-3 px-4">
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">
                  {card.value}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  {card.trend !== undefined ? (
                    <span
                      className={cn(
                        "text-xs font-medium",
                        positive ? "text-success" : "text-destructive",
                      )}
                    >
                      {formatPercent(card.trend)}
                    </span>
                  ) : null}
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
