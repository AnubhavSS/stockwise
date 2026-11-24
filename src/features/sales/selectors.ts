/** Filter, search, paginate, and summarise the sales list. */
import {
  formatChartTick,
  isWithinRange,
  paginateItems,
  percentChange,
} from "@/lib/calculations";
import { getSalesPeriodBounds, type SalesPeriod } from "@/features/sales/periods";
import { isPendingPayment } from "@/features/sales/calculations";
import type { PaginatedResult } from "@/types/common";
import type { Customer } from "@/types/customer";
import type {
  PaymentMethod,
  PaymentStatus,
  Sale,
  SaleStatus,
} from "@/types/sales";

export type SalesTab = "all" | "completed" | "pending" | "cancelled";

export type SalesFilters = {
  search: string;
  tab: SalesTab;
  paymentStatus: PaymentStatus | "all";
  paymentMethod: PaymentMethod | "all";
  saleStatus: SaleStatus | "all";
  from: string;
  to: string;
};

export const DEFAULT_SALES_FILTERS: SalesFilters = {
  search: "",
  tab: "all",
  paymentStatus: "all",
  paymentMethod: "all",
  saleStatus: "all",
  from: "",
  to: "",
};

export type SalesSummary = {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  pendingPayments: number;
  salesChangePercent: number;
  ordersChangePercent: number;
};

export function getCompletedSales(sales: Sale[]): Sale[] {
  return sales.filter((sale) => sale.status === "completed");
}

export function customerName(
  customers: Customer[],
  customerId: string,
): string {
  return customers.find((customer) => customer.id === customerId)?.name ?? "Customer";
}

export function filterSales(
  sales: Sale[],
  customers: Customer[],
  filters: SalesFilters,
): Sale[] {
  const query = filters.search.trim().toLowerCase();

  return sales.filter((sale) => {
    if (filters.tab === "completed" && sale.status !== "completed") {
      return false;
    }
    if (filters.tab === "cancelled" && sale.status !== "cancelled") {
      return false;
    }
    if (filters.tab === "pending" && !isPendingPayment(sale)) {
      return false;
    }
    if (filters.paymentStatus !== "all" && sale.paymentStatus !== filters.paymentStatus) {
      return false;
    }
    if (filters.paymentMethod !== "all" && sale.paymentMethod !== filters.paymentMethod) {
      return false;
    }
    if (filters.saleStatus !== "all" && sale.status !== filters.saleStatus) {
      return false;
    }
    if (filters.from) {
      const fromTime = new Date(`${filters.from}T00:00:00.000Z`).getTime();
      if (new Date(sale.date).getTime() < fromTime) {
        return false;
      }
    }
    if (filters.to) {
      const toTime = new Date(`${filters.to}T23:59:59.999Z`).getTime();
      if (new Date(sale.date).getTime() > toTime) {
        return false;
      }
    }
    if (query) {
      const name = customerName(customers, sale.customerId).toLowerCase();
      const haystack = `${sale.invoiceNumber} ${name} ${sale.id}`.toLowerCase();
      if (!haystack.includes(query)) {
        return false;
      }
    }
    return true;
  });
}

export function hasActiveSalesFilters(filters: SalesFilters): boolean {
  return (
    filters.search.trim().length > 0 ||
    filters.tab !== "all" ||
    filters.paymentStatus !== "all" ||
    filters.paymentMethod !== "all" ||
    filters.saleStatus !== "all" ||
    Boolean(filters.from) ||
    Boolean(filters.to)
  );
}

export function deriveSalesSummary(
  sales: Sale[],
  period: SalesPeriod,
): SalesSummary {
  const { start, end, previousStart, previousEnd } = getSalesPeriodBounds(period);
  const completed = getCompletedSales(sales);
  const current = completed.filter((sale) => isWithinRange(sale.date, start, end));
  const previous = completed.filter((sale) =>
    isWithinRange(sale.date, previousStart, previousEnd),
  );
  const totalSales = current.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const previousSales = previous.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalOrders = current.length;
  const pendingPayments = completed
    .filter((sale) => sale.paymentStatus !== "paid")
    .reduce((sum, sale) => sum + sale.remainingBalance, 0);

  return {
    totalSales,
    totalOrders,
    averageOrderValue: totalOrders === 0 ? 0 : Math.round(totalSales / totalOrders),
    pendingPayments,
    salesChangePercent: percentChange(totalSales, previousSales),
    ordersChangePercent: percentChange(totalOrders, previous.length),
  };
}

export function deriveSalesSeries(sales: Sale[], period: SalesPeriod) {
  const { start, end } = getSalesPeriodBounds(period);
  const byDay = new Map<string, number>();

  for (const sale of getCompletedSales(sales)) {
    if (!isWithinRange(sale.date, start, end)) {
      continue;
    }
    const key = sale.date.slice(0, 10);
    byDay.set(key, (byDay.get(key) ?? 0) + sale.totalAmount);
  }

  const days: Array<{ date: string; label: string; sales: number }> = [];
  const cursor = new Date(start);
  cursor.setUTCHours(0, 0, 0, 0);
  const last = new Date(end);
  last.setUTCHours(23, 59, 59, 999);

  while (cursor.getTime() <= last.getTime()) {
    const key = cursor.toISOString().slice(0, 10);
    days.push({
      date: key,
      label: formatChartTick(cursor.toISOString()),
      sales: byDay.get(key) ?? 0,
    });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return days;
}

export function tabCounts(sales: Sale[]) {
  return {
    all: sales.length,
    completed: sales.filter((sale) => sale.status === "completed").length,
    pending: sales.filter((sale) => isPendingPayment(sale)).length,
    cancelled: sales.filter((sale) => sale.status === "cancelled").length,
  };
}

export { paginateItems };
export type { PaginatedResult };
