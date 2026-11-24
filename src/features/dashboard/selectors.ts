/**
 * Dashboard KPIs and charts from the shared stores.
 * Sales totals use completed invoices only; purchase totals skip drafts and cancellations.
 */
import {
  formatChartTick,
  getActiveProducts,
  getAttentionProducts,
  getInStockProducts,
  getLowStockProducts,
  getOutOfStockProducts,
  getTotalUnits,
  isWithinRange,
  percentChange,
  purchaseActivityDate,
  sumPurchaseTotals,
  sumSaleTotals,
} from "@/lib/calculations";
import { getPeriodBounds } from "@/features/reports/periods";
import type { ReportPeriod } from "@/features/reports/periods";
import type {
  DailyPerformancePoint,
  DashboardStats,
  StockStatusSlice,
} from "@/types/common";
import type { Product } from "@/types/inventory";
import type { Purchase } from "@/types/purchase";
import type { Sale } from "@/types/sales";

// Cancelled and draft sales never contribute to dashboard revenue.
const ACTIVE_SALE_STATUSES: Sale["status"][] = ["completed"];
const ACTIVE_PURCHASE_STATUSES: Purchase["status"][] = [
  "ordered",
  "partially_received",
  "received",
];

function eachDay(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  const cursor = new Date(start);
  cursor.setUTCHours(0, 0, 0, 0);
  const last = new Date(end);
  last.setUTCHours(23, 59, 59, 999);

  while (cursor.getTime() <= last.getTime()) {
    days.push(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return days;
}

function toDayKey(isoDate: string): string {
  return new Date(isoDate).toISOString().slice(0, 10);
}

export function deriveDashboardStats(input: {
  products: Product[];
  sales: Sale[];
  purchases: Purchase[];
  period: ReportPeriod;
  now?: Date;
}): DashboardStats {
  const catalog = getActiveProducts(input.products);
  const { start, end, previousStart, previousEnd } = getPeriodBounds(
    input.period,
    input.now,
  );

  const activeSales = input.sales.filter((sale) =>
    ACTIVE_SALE_STATUSES.includes(sale.status),
  );
  const activePurchases = input.purchases.filter((purchase) =>
    ACTIVE_PURCHASE_STATUSES.includes(purchase.status),
  );

  const periodSales = activeSales.filter((sale) =>
    isWithinRange(sale.date, start, end),
  );
  const previousSales = activeSales.filter((sale) =>
    isWithinRange(sale.date, previousStart, previousEnd),
  );
  const periodPurchases = activePurchases.filter((purchase) =>
    isWithinRange(purchaseActivityDate(purchase), start, end),
  );
  const previousPurchases = activePurchases.filter((purchase) =>
    isWithinRange(purchaseActivityDate(purchase), previousStart, previousEnd),
  );

  const periodSalesTotal = sumSaleTotals(periodSales);
  const previousPeriodSalesTotal = sumSaleTotals(previousSales);
  const periodPurchaseTotal = sumPurchaseTotals(periodPurchases);
  const previousPeriodPurchaseTotal = sumPurchaseTotals(previousPurchases);

  return {
    totalProducts: catalog.length,
    totalStockQuantity: getTotalUnits(catalog),
    inventoryValue: catalog.reduce(
      (total, product) => total + product.quantity * product.unitPrice,
      0,
    ),
    lowStockCount: getAttentionProducts(catalog).length,
    outOfStockCount: getOutOfStockProducts(catalog).length,
    inStockCount: getInStockProducts(catalog).length,
    openSalesCount: input.sales.filter((sale) => sale.status === "draft").length,
    openPurchaseCount: input.purchases.filter(
      (purchase) =>
        purchase.status === "ordered" || purchase.status === "partially_received",
    ).length,
    periodSalesTotal,
    periodPurchaseTotal,
    previousPeriodSalesTotal,
    previousPeriodPurchaseTotal,
    salesChangePercent: percentChange(periodSalesTotal, previousPeriodSalesTotal),
    purchaseChangePercent: percentChange(
      periodPurchaseTotal,
      previousPeriodPurchaseTotal,
    ),
    itemsChangePercent: 0,
  };
}

export function deriveDailyPerformance(input: {
  sales: Sale[];
  purchases: Purchase[];
  period: ReportPeriod;
  now?: Date;
}): DailyPerformancePoint[] {
  const { start, end } = getPeriodBounds(input.period, input.now);
  const salesByDay = new Map<string, number>();
  const purchasesByDay = new Map<string, number>();

  for (const sale of input.sales) {
    if (!ACTIVE_SALE_STATUSES.includes(sale.status)) {
      continue;
    }
    if (!isWithinRange(sale.date, start, end)) {
      continue;
    }
    const key = toDayKey(sale.date);
    salesByDay.set(key, (salesByDay.get(key) ?? 0) + sale.totalAmount);
  }

  for (const purchase of input.purchases) {
    if (!ACTIVE_PURCHASE_STATUSES.includes(purchase.status)) {
      continue;
    }
    const date = purchaseActivityDate(purchase);
    if (!isWithinRange(date, start, end)) {
      continue;
    }
    const key = toDayKey(date);
    purchasesByDay.set(key, (purchasesByDay.get(key) ?? 0) + purchase.totalAmount);
  }

  return eachDay(start, end).map((day) => {
    const key = day.toISOString().slice(0, 10);
    return {
      date: key,
      label: formatChartTick(day.toISOString()),
      sales: salesByDay.get(key) ?? 0,
      purchases: purchasesByDay.get(key) ?? 0,
    };
  });
}

export function deriveStockStatus(products: Product[]): StockStatusSlice[] {
  const catalog = getActiveProducts(products);
  const inStock = getInStockProducts(catalog).length;
  const lowStock = getLowStockProducts(catalog).length;
  const outOfStock = getOutOfStockProducts(catalog).length;
  const total = catalog.length || 1;

  return [
    {
      key: "inStock",
      label: "In Stock",
      count: inStock,
      percent: (inStock / total) * 100,
      color: "#16A36A",
    },
    {
      key: "lowStock",
      label: "Low Stock",
      count: lowStock,
      percent: (lowStock / total) * 100,
      color: "#E9A23B",
    },
    {
      key: "outOfStock",
      label: "Out of Stock",
      count: outOfStock,
      percent: (outOfStock / total) * 100,
      color: "#DC5555",
    },
  ];
}
