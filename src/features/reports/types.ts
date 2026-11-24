export type ReportTab =
  | "overview"
  | "sales"
  | "purchases"
  | "stock"
  | "movements";

export type ReportKpi = {
  title: string;
  value: string;
  hint: string;
  trend?: number;
};

export type TimeSeriesPoint = {
  date: string;
  label: string;
  sales: number;
  purchases: number;
  orders: number;
};

export type TopProductRow = {
  productId: string;
  name: string;
  sku: string;
  unitsSold: number;
  revenue: number;
  share: number;
  stock: number;
};

export type SupplierReportRow = {
  supplierId: string;
  name: string;
  orderCount: number;
  totalValue: number;
  receivedCount: number;
  pendingCount: number;
  outstanding: number;
};

export type CategoryValueRow = {
  category: string;
  value: number;
  units: number;
};

export type PaymentSlice = {
  key: "paid" | "partial" | "unpaid";
  label: string;
  count: number;
  amount: number;
  percent: number;
  color: string;
};

export type MovementKind =
  | "purchase"
  | "sale"
  | "adjustment_in"
  | "adjustment_out";
