"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AlertRow = {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  minimumStockLevel: number;
};

type LowStockAlertsProps = {
  alerts: AlertRow[];
};

export function LowStockAlerts({ alerts }: LowStockAlertsProps) {
  const router = useRouter();

  return (
    <Card className="flex h-full flex-col border-border bg-card shadow-sm ring-1 ring-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Low Stock Alerts</CardTitle>
        <Link
          href="/stock"
          className="text-sm font-medium text-primary hover:underline"
        >
          View All
        </Link>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2">
        {alerts.length === 0 ? (
          <EmptyState
            title="All stocked up"
            description="No products are at or below their minimum level."
          />
        ) : (
          alerts.map((alert) => {
            const outOfStock = alert.quantity === 0;
            return (
              <button
                key={alert.productId}
                type="button"
                onClick={() => {
                  toast.info(`${alert.name} will open in Stock details once that module is ready.`);
                  router.push("/stock");
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors hover:bg-muted/60",
                  outOfStock
                    ? "border-destructive/20 bg-destructive/5"
                    : "border-warning/20 bg-warning/5",
                )}
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-lg",
                    outOfStock
                      ? "bg-destructive/10 text-destructive"
                      : "bg-warning/20 text-[#8A5A12]",
                  )}
                >
                  <AlertTriangle className="size-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{alert.name}</span>
                  <span className="block text-xs text-muted-foreground">{alert.sku}</span>
                </span>
                <span className="text-right">
                  <span
                    className={cn(
                      "block text-sm font-semibold",
                      outOfStock ? "text-destructive" : "text-[#8A5A12]",
                    )}
                  >
                    Qty: {alert.quantity}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    Min: {alert.minimumStockLevel}
                  </span>
                </span>
                <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
              </button>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
