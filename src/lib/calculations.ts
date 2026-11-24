/**
 * Shared formatting and inventory math used by Dashboard, Stock, Sales,
 * Purchase, and Reports.
 *
 * Currency uses the Indian grouping style (₹1,25,000). Dates are formatted
 * in UTC so server HTML and the browser show the same strings.
 */
import { APP_NOW_ISO } from "@/lib/constants";
import type { PaginatedResult } from "@/types/common";
import type { Product } from "@/types/inventory";
import type { Purchase } from "@/types/purchase";
import type { Sale } from "@/types/sales";

/** Groups digits as 12,34,567 (Indian lakhs/crores) instead of 1,234,567. */
function formatIndianNumber(value: number): string {
  const sign = value < 0 ? "-" : "";
  const digits = Math.round(Math.abs(value)).toString();

  if (digits.length <= 3) {
    return `${sign}${digits}`;
  }

  const lastThree = digits.slice(-3);
  let rest = digits.slice(0, -3);
  const groups: string[] = [];

  while (rest.length > 2) {
    groups.unshift(rest.slice(-2));
    rest = rest.slice(0, -2);
  }

  if (rest) {
    groups.unshift(rest);
  }

  return `${sign}${groups.join(",")},${lastThree}`;
}

/** Rupee display for tables, KPIs, and chart tooltips. */
export function formatCurrency(amount: number): string {
  return `₹${formatIndianNumber(amount)}`;
}

export function formatNumber(value: number): string {
  return formatIndianNumber(value);
}

export function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(isoDate));
}

export function formatDateTime(isoDate: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(new Date(isoDate));
}

export function formatChartTick(isoDate: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(isoDate));
}

export function formatPercent(value: number): string {
  const rounded = Math.abs(value).toFixed(1);
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${rounded}%`;
}

/** Human relative time against the demo clock, e.g. "18 minutes ago". */
export function formatRelativeTime(
  isoDate: string,
  now = new Date(APP_NOW_ISO),
): string {
  const absMinutes = Math.round(
    Math.abs(new Date(isoDate).getTime() - now.getTime()) / 60000,
  );

  if (absMinutes < 60) {
    return absMinutes <= 1 ? "1 minute ago" : `${absMinutes} minutes ago`;
  }

  const hours = Math.round(absMinutes / 60);
  if (hours < 24) {
    return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  }

  const days = Math.round(hours / 24);
  return days === 1 ? "1 day ago" : `${days} days ago`;
}

export function calculateLineTotal(quantity: number, unitPrice: number): number {
  return quantity * unitPrice;
}

/** Retail value of on-hand stock (qty × selling price), not cost. */
export function calculateStockValue(
  product: Pick<Product, "quantity" | "unitPrice">,
): number {
  return calculateLineTotal(product.quantity, product.unitPrice);
}

export function calculateInventoryValue(products: Product[]): number {
  return products.reduce(
    (total, product) => total + calculateStockValue(product),
    0,
  );
}

export function getActiveProducts(products: Product[]): Product[] {
  return products.filter((product) => product.isActive !== false);
}

export function getTotalUnits(products: Product[]): number {
  return products.reduce((sum, product) => sum + product.quantity, 0);
}

/** Low stock plus out of stock — items that need replenishment. */
export function getAttentionProducts(products: Product[]): Product[] {
  return products.filter(
    (product) => product.quantity <= product.minimumStockLevel,
  );
}

export function getLowStockProducts(products: Product[]): Product[] {
  return products.filter(
    (product) => product.quantity > 0 && product.quantity <= product.minimumStockLevel,
  );
}

export function getOutOfStockProducts(products: Product[]): Product[] {
  return products.filter((product) => product.quantity === 0);
}

export function getInStockProducts(products: Product[]): Product[] {
  return products.filter(
    (product) => product.quantity > product.minimumStockLevel,
  );
}

/**
 * Period-over-period change. If the previous period was zero, treat any
 * positive current value as +100% rather than dividing by zero.
 */
export function percentChange(current: number, previous: number): number {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }

  return ((current - previous) / previous) * 100;
}

export function isWithinRange(isoDate: string, start: Date, end: Date): boolean {
  const time = new Date(isoDate).getTime();
  return time >= start.getTime() && time <= end.getTime();
}

export function paginateItems<T>(
  items: T[],
  page: number,
  pageSize: number,
): PaginatedResult<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    total,
    page: safePage,
    pageSize,
  };
}

export function sumSaleTotals(sales: Sale[]): number {
  return sales.reduce((total, sale) => total + sale.totalAmount, 0);
}

export function sumPurchaseTotals(purchases: Purchase[]): number {
  return purchases.reduce((total, purchase) => total + purchase.totalAmount, 0);
}

/** Date used on the dashboard chart: received date if present, else order date. */
export function purchaseActivityDate(purchase: Purchase): string {
  return purchase.receivedDate ?? purchase.date ?? purchase.expectedDate;
}
