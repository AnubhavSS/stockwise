"use client";

/**
 * Dashboard composition: greeting, KPIs, charts, alerts, and recent activity.
 */
import dynamic from "next/dynamic";
import { useState, useSyncExternalStore } from "react";

import { LoadingState } from "@/components/shared/loading-state";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { LowStockAlerts } from "@/components/dashboard/low-stock-alerts";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { Card } from "@/components/ui/card";
import type { ReportPeriod } from "@/features/reports/periods";
import { useDashboardData } from "@/hooks/use-dashboard-data";

// Recharts needs the browser. Load charts on the client and show an empty card until then.
const SalesPurchaseChart = dynamic(
  () =>
    import("@/components/dashboard/sales-purchase-chart").then(
      (module) => module.SalesPurchaseChart,
    ),
  {
    ssr: false,
    loading: () => <Card className="h-90 border-border bg-card shadow-sm ring-1 ring-border" />,
  },
);

const StockStatusChart = dynamic(
  () =>
    import("@/components/dashboard/stock-status-chart").then(
      (module) => module.StockStatusChart,
    ),
  {
    ssr: false,
    loading: () => <Card className="h-full min-h-80 border-border bg-card shadow-sm ring-1 ring-border" />,
  },
);

const emptySubscribe = () => () => undefined;

export function DashboardOverview() {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const [period, setPeriod] = useState<ReportPeriod>("30d");
  const data = useDashboardData(period);

  if (!mounted) {
    return <LoadingState rows={8} />;
  }

  return (
    <div className="space-y-6">
      {/* Greeting, date range, and New Sale / New Purchase / Add Item */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0 flex-1">
          <DashboardHeader period={period} onPeriodChange={setPeriod} />
        </div>
        <QuickActions />
      </div>

      {/* Sales, purchases, units on hand, and low-stock count */}
      <DashboardStats stats={data.stats} />

      {/* Revenue vs purchases chart (2 cols) and products that need reorder */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SalesPurchaseChart data={data.series} />
        </div>
        <LowStockAlerts alerts={data.alerts} />
      </div>

      {/* Latest ledger activity and current In / Low / Out mix */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RecentActivity activities={data.recentActivity} />
        </div>
        <StockStatusChart
          slices={data.stockStatus}
          totalItems={data.stats.totalProducts}
        />
      </div>
    </div>
  );
}
