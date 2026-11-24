/**
 * Shared UI and dashboard shapes: date ranges, pagination, KPI stats,
 * chart points, and the activity feed shown on Dashboard / Reports.
 */
export type CurrencyCode = "INR";

export type StatusTone = "neutral" | "info" | "success" | "warning" | "danger";

export type DateRange = {
  from: string;
  to: string;
};

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type SelectOption = {
  label: string;
  value: string;
};

export type DashboardStats = {
  totalProducts: number;
  totalStockQuantity: number;
  inventoryValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  inStockCount: number;
  openSalesCount: number;
  openPurchaseCount: number;
  periodSalesTotal: number;
  periodPurchaseTotal: number;
  previousPeriodSalesTotal: number;
  previousPeriodPurchaseTotal: number;
  salesChangePercent: number;
  purchaseChangePercent: number;
  itemsChangePercent: number;
};

export type DailyPerformancePoint = {
  date: string;
  label: string;
  sales: number;
  purchases: number;
};

export type StockStatusSlice = {
  key: "inStock" | "lowStock" | "outOfStock";
  label: string;
  count: number;
  percent: number;
  color: string;
};

export type ActivityType =
  | "sale_created"
  | "sale_paid"
  | "purchase_created"
  | "purchase_received"
  | "stock_adjusted";

export type Activity = {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  referenceId?: string;
  amount?: number;
  quantityChange?: number;
  createdAt: string;
};
