"use client";

/**
 * Latest sales, receipts, and stock adjustments from the inventory activity feed.
 */
import Link from "next/link";
import {
  ClipboardPen,
  PackageCheck,
  ShoppingBag,
  ShoppingCart,
} from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatRelativeTime } from "@/lib/calculations";
import { cn } from "@/lib/utils";
import type { Activity } from "@/types/common";

type RecentActivityProps = {
  activities: Activity[];
};

const activityMeta = {
  sale_created: {
    icon: ShoppingCart,
    className: "bg-primary/10 text-primary",
  },
  sale_paid: {
    icon: ShoppingCart,
    className: "bg-success/10 text-success",
  },
  purchase_created: {
    icon: ShoppingBag,
    className: "bg-[#111C32]/8 text-[#111C32]",
  },
  purchase_received: {
    icon: PackageCheck,
    className: "bg-success/10 text-success",
  },
  stock_adjusted: {
    icon: ClipboardPen,
    className: "bg-warning/15 text-[#8A5A12]",
  },
} as const;

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card className="flex h-full flex-col border-border bg-card shadow-sm ring-1 ring-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Activity</CardTitle>
        {/* Full history lives on Reports → Overview */}
        <Link
          href="/reports"
          className="text-sm font-medium text-primary hover:underline"
        >
          View All
        </Link>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        {activities.length === 0 ? (
          <EmptyState
            title="No activity in this period"
            description="Sales, purchases and stock movements will appear here."
          />
        ) : (
          <ul className="divide-y divide-border">
            {activities.map((activity) => {
              const meta = activityMeta[activity.type];
              const Icon = meta.icon;
              return (
                <li key={activity.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <span
                    className={cn(
                      "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg",
                      meta.className,
                    )}
                  >
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{activity.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {activity.description}
                    </p>
                  </div>
                  <div className="text-right">
                    {activity.amount !== undefined ? (
                      <p className="text-sm font-medium">{formatCurrency(activity.amount)}</p>
                    ) : null}
                    {activity.quantityChange !== undefined ? (
                      <p className="text-sm font-medium">
                        {activity.quantityChange > 0 ? "+" : ""}
                        {activity.quantityChange} units
                      </p>
                    ) : null}
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(activity.createdAt)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
