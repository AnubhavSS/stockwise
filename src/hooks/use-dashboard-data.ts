"use client";

/**
 * Dashboard data hook. Pulls products, sales, purchases, and activities from
 * the Zustand stores and derives KPIs, charts, alerts, and the activity list
 * for the selected 7 / 30 / 90 day period.
 */

import { useMemo } from "react";

import {
  deriveDailyPerformance,
  deriveDashboardStats,
  deriveStockStatus,
} from "@/features/dashboard/selectors";
import type { ReportPeriod } from "@/features/reports/periods";
import { getStockAlerts } from "@/features/stock/alerts";
import { getActiveProducts, isWithinRange } from "@/lib/calculations";
import { getPeriodBounds } from "@/features/reports/periods";
import { useInventoryStore } from "@/store/inventory-store";
import { usePurchaseStore } from "@/store/purchase-store";
import { useSalesStore } from "@/store/sales-store";

export function useDashboardData(period: ReportPeriod) {
  const products = useInventoryStore((state) => state.products);
  const activities = useInventoryStore((state) => state.activities);
  const sales = useSalesStore((state) => state.sales);
  const purchases = usePurchaseStore((state) => state.purchases);

  const stats = useMemo(
    () => deriveDashboardStats({ products, sales, purchases, period }),
    [period, products, purchases, sales],
  );

  const series = useMemo(
    () => deriveDailyPerformance({ sales, purchases, period }),
    [period, purchases, sales],
  );

  const stockStatus = useMemo(() => deriveStockStatus(products), [products]);

  const alerts = useMemo(() => {
    // Keep the four demo SKUs from the original dashboard mock at the top of the list.
    const featured = ["WM-001", "UC-002", "LS-003", "HC-004"];
    return getStockAlerts(getActiveProducts(products))
      .sort((a, b) => {
        const aRank = featured.indexOf(a.sku);
        const bRank = featured.indexOf(b.sku);
        if (aRank !== -1 || bRank !== -1) {
          return (aRank === -1 ? 99 : aRank) - (bRank === -1 ? 99 : bRank);
        }
        return b.shortage - a.shortage;
      })
      .slice(0, 4);
  }, [products]);

  const recentActivity = useMemo(() => {
    const { start, end } = getPeriodBounds(period);
    return activities
      .filter((activity) => isWithinRange(activity.createdAt, start, end))
      .slice(0, 6);
  }, [activities, period]);

  return {
    products,
    sales,
    purchases,
    stats,
    series,
    stockStatus,
    alerts,
    recentActivity,
  };
}
