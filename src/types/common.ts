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
  openSalesCount: number;
  openPurchaseCount: number;
  monthlySalesTotal: number;
  monthlyPurchaseTotal: number;
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
  createdAt: string;
};
