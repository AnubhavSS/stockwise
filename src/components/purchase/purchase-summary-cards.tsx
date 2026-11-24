/**
 * Order value, received vs pending, and outstanding supplier payments.
 */

import { ClipboardList, PackageSearch, ShoppingBag, Wallet } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { PurchaseSummary } from "@/features/purchase/selectors";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/calculations";
import { cn } from "@/lib/utils";

type PurchaseSummaryCardsProps = {
  summary: PurchaseSummary;
};

export function PurchaseSummaryCards({ summary }: PurchaseSummaryCardsProps) {
  const cards = [
    {
      title: "Total Purchases",
      value: formatCurrency(summary.totalPurchases),
      hint: "vs previous period",
      trend: summary.purchasesChangePercent,
      icon: ShoppingBag,
      iconClass: "bg-primary/10 text-primary",
    },
    {
      title: "Purchase Orders",
      value: formatNumber(summary.orderCount),
      hint: "Orders in this period",
      trend: summary.ordersChangePercent,
      icon: ClipboardList,
      iconClass: "bg-[#111C32]/8 text-[#111C32]",
    },
    {
      title: "Pending Orders",
      value: formatNumber(summary.pendingOrders),
      hint: "Not fully received",
      icon: PackageSearch,
      iconClass: "bg-warning/15 text-[#8A5A12]",
    },
    {
      title: "Pending Payments",
      value: formatCurrency(summary.pendingPayments),
      hint: "Outstanding to suppliers",
      icon: Wallet,
      iconClass: "bg-destructive/10 text-destructive",
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* Drafts and cancelled POs are excluded from these totals */}
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
                <p className="mt-1 text-2xl font-semibold tracking-tight">{card.value}</p>
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
