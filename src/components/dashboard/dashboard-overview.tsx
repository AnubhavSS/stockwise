"use client";

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

const SalesPurchaseChart = dynamic(
  () =>
    import("@/components/dashboard/sales-purchase-chart").then(
      (module) => module.SalesPurchaseChart,
    ),
  {
    ssr: false,
    loading: () => <Card className="h-[360px] border-border bg-card shadow-sm ring-1 ring-border" />,
  },
);

const StockStatusChart = dynamic(
  () =>
    import("@/components/dashboard/stock-status-chart").then(
      (module) => module.StockStatusChart,
    ),
  {
    ssr: false,
    loading: () => <Card className="h-full min-h-[320px] border-border bg-card shadow-sm ring-1 ring-border" />,
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
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0 flex-1">
          <DashboardHeader period={period} onPeriodChange={setPeriod} />
        </div>
        <QuickActions />
      </div>
      <DashboardStats stats={data.stats} />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SalesPurchaseChart data={data.series} />
        </div>
        <LowStockAlerts alerts={data.alerts} />
      </div>
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
