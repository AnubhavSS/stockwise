/** Filter, search, paginate, and summarise purchase orders. */
import {
  formatChartTick,
  isWithinRange,
  paginateItems,
  percentChange,
} from "@/lib/calculations";
import {
  getPurchasePeriodBounds,
  type PurchasePeriod,
} from "@/features/purchase/periods";
import type { Purchase, PurchaseStatus } from "@/types/purchase";
import type { PaymentStatus } from "@/types/sales";
import type { Supplier } from "@/types/supplier";

export type PurchaseTab =
  | "all"
  | "ordered"
  | "partially_received"
  | "received"
  | "cancelled";

export type PurchaseFilters = {
  search: string;
  tab: PurchaseTab;
  supplierId: string | "all";
  status: PurchaseStatus | "all";
  paymentStatus: PaymentStatus | "all";
  from: string;
  to: string;
};

export const DEFAULT_PURCHASE_FILTERS: PurchaseFilters = {
  search: "",
  tab: "all",
  supplierId: "all",
  status: "all",
  paymentStatus: "all",
  from: "",
  to: "",
};

export type PurchaseSummary = {
  totalPurchases: number;
  orderCount: number;
  pendingOrders: number;
  pendingPayments: number;
  purchasesChangePercent: number;
  ordersChangePercent: number;
};

export function countedPurchases(purchases: Purchase[]): Purchase[] {
  return purchases.filter(
    (purchase) => purchase.status !== "draft" && purchase.status !== "cancelled",
  );
}

export function supplierName(suppliers: Supplier[], supplierId: string): string {
  return suppliers.find((supplier) => supplier.id === supplierId)?.name ?? "Supplier";
}

export function filterPurchases(
  purchases: Purchase[],
  suppliers: Supplier[],
  filters: PurchaseFilters,
): Purchase[] {
  const query = filters.search.trim().toLowerCase();

  return purchases.filter((purchase) => {
    if (filters.tab !== "all" && purchase.status !== filters.tab) {
      return false;
    }
    if (filters.status !== "all" && purchase.status !== filters.status) {
      return false;
    }
    if (filters.paymentStatus !== "all" && purchase.paymentStatus !== filters.paymentStatus) {
      return false;
    }
    if (filters.supplierId !== "all" && purchase.supplierId !== filters.supplierId) {
      return false;
    }
    if (filters.from) {
      const fromTime = new Date(`${filters.from}T00:00:00.000Z`).getTime();
      if (new Date(purchase.date).getTime() < fromTime) {
        return false;
      }
    }
    if (filters.to) {
      const toTime = new Date(`${filters.to}T23:59:59.999Z`).getTime();
      if (new Date(purchase.date).getTime() > toTime) {
        return false;
      }
    }
    if (query) {
      const name = supplierName(suppliers, purchase.supplierId).toLowerCase();
      const haystack = `${purchase.purchaseOrderNumber} ${name} ${purchase.id}`.toLowerCase();
      if (!haystack.includes(query)) {
        return false;
      }
    }
    return true;
  });
}

export function hasActivePurchaseFilters(filters: PurchaseFilters): boolean {
  return (
    filters.search.trim().length > 0 ||
    filters.tab !== "all" ||
    filters.supplierId !== "all" ||
    filters.status !== "all" ||
    filters.paymentStatus !== "all" ||
    Boolean(filters.from) ||
    Boolean(filters.to)
  );
}

export function derivePurchaseSummary(
  purchases: Purchase[],
  period: PurchasePeriod,
): PurchaseSummary {
  const { start, end, previousStart, previousEnd } = getPurchasePeriodBounds(period);
  const countable = countedPurchases(purchases);
  const current = countable.filter((purchase) =>
    isWithinRange(purchase.date, start, end),
  );
  const previous = countable.filter((purchase) =>
    isWithinRange(purchase.date, previousStart, previousEnd),
  );
  const totalPurchases = current.reduce((sum, purchase) => sum + purchase.totalAmount, 0);
  const previousTotal = previous.reduce((sum, purchase) => sum + purchase.totalAmount, 0);

  return {
    totalPurchases,
    orderCount: current.length,
    pendingOrders: purchases.filter(
      (purchase) =>
        purchase.status === "ordered" || purchase.status === "partially_received",
    ).length,
    pendingPayments: countable
      .filter((purchase) => purchase.paymentStatus !== "paid")
      .reduce((sum, purchase) => sum + purchase.remainingBalance, 0),
    purchasesChangePercent: percentChange(totalPurchases, previousTotal),
    ordersChangePercent: percentChange(current.length, previous.length),
  };
}

export function derivePurchaseSeries(purchases: Purchase[], period: PurchasePeriod) {
  const { start, end } = getPurchasePeriodBounds(period);
  const byDay = new Map<string, number>();

  for (const purchase of countedPurchases(purchases)) {
    if (!isWithinRange(purchase.date, start, end)) {
      continue;
    }
    const key = purchase.date.slice(0, 10);
    byDay.set(key, (byDay.get(key) ?? 0) + purchase.totalAmount);
  }

  const days: Array<{ date: string; label: string; purchases: number }> = [];
  const cursor = new Date(start);
  cursor.setUTCHours(0, 0, 0, 0);
  const last = new Date(end);
  last.setUTCHours(23, 59, 59, 999);

  while (cursor.getTime() <= last.getTime()) {
    const key = cursor.toISOString().slice(0, 10);
    days.push({
      date: key,
      label: formatChartTick(cursor.toISOString()),
      purchases: byDay.get(key) ?? 0,
    });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return days;
}

export function tabCounts(purchases: Purchase[]) {
  return {
    all: purchases.length,
    ordered: purchases.filter((purchase) => purchase.status === "ordered").length,
    partially_received: purchases.filter(
      (purchase) => purchase.status === "partially_received",
    ).length,
    received: purchases.filter((purchase) => purchase.status === "received").length,
    cancelled: purchases.filter((purchase) => purchase.status === "cancelled").length,
  };
}

export { paginateItems };
