/**
 * Reusable KPI row used by every report tab.
 */

import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { formatPercent } from "@/lib/calculations";
import { cn } from "@/lib/utils";

export type ReportKpiCard = {
  title: string;
  value: string;
  hint: string;
  trend?: number;
  icon: LucideIcon;
  iconClass: string;
};

type ReportKpiCardsProps = {
  cards: ReportKpiCard[];
  columns?: string;
};

export function ReportKpiCards({
  cards,
  columns = "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4",
}: ReportKpiCardsProps) {
  return (
    <section className={cn("grid gap-4", columns)}>
      {/* Value, optional % vs previous period, and a one-line definition */}
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
