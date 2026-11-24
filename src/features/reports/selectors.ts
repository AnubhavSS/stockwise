import { deriveStockStatus } from "@/features/dashboard/selectors";
import {
  inventoryValueAtCost,
  isCompletedSale,
  isCountedPurchase,
  productUnitCost,
  saleCostOfGoods,
  saleItemCount,
} from "@/features/reports/calculations";
import {
  getAnalyticsBounds,
  rangeUsesMonthlyBuckets,
  type AnalyticsRange,
} from "@/features/reports/range";
import type {
  CategoryValueRow,
  MovementKind,
  PaymentSlice,
  SupplierReportRow,
  TimeSeriesPoint,
  TopProductRow,
} from "@/features/reports/types";
import { orderedQuantity, receivedQuantity } from "@/features/purchase/calculations";
import { countedPurchases, supplierName } from "@/features/purchase/selectors";
import { getCatalogProducts } from "@/features/stock/selectors";
import { getStockStatus } from "@/features/stock/status";
import {
  formatChartTick,
  getActiveProducts,
  getInStockProducts,
  getLowStockProducts,
  getOutOfStockProducts,
  getTotalUnits,
  isWithinRange,
  percentChange,
} from "@/lib/calculations";
import type { Activity } from "@/types/common";
import type { Product, ProductCategory, StockMovement, StockStatus } from "@/types/inventory";
import type { Purchase } from "@/types/purchase";
import type { PaymentStatus, Sale, SaleStatus } from "@/types/sales";
import type { Customer } from "@/types/customer";
import type { Supplier } from "@/types/supplier";

export function completedSalesInRange(
  sales: Sale[],
  range: AnalyticsRange,
  previous = false,
): Sale[] {
  const bounds = getAnalyticsBounds(range);
  const start = previous ? bounds.previousStart : bounds.start;
  const end = previous ? bounds.previousEnd : bounds.end;
  return sales.filter(
    (sale) => isCompletedSale(sale) && isWithinRange(sale.date, start, end),
  );
}

export function countedPurchasesInRange(
  purchases: Purchase[],
  range: AnalyticsRange,
  previous = false,
): Purchase[] {
  const bounds = getAnalyticsBounds(range);
  const start = previous ? bounds.previousStart : bounds.start;
  const end = previous ? bounds.previousEnd : bounds.end;
  return purchases.filter(
    (purchase) =>
      isCountedPurchase(purchase) && isWithinRange(purchase.date, start, end),
  );
}

export function deriveOverviewKpis(input: {
  products: Product[];
  sales: Sale[];
  purchases: Purchase[];
  range: AnalyticsRange;
}) {
  const catalog = getActiveProducts(input.products);
  const currentSales = completedSalesInRange(input.sales, input.range);
  const previousSales = completedSalesInRange(input.sales, input.range, true);
  const currentPurchases = countedPurchasesInRange(input.purchases, input.range);
  const previousPurchases = countedPurchasesInRange(input.purchases, input.range, true);

  const revenue = currentSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const previousRevenue = previousSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const purchaseValue = currentPurchases.reduce((sum, purchase) => sum + purchase.totalAmount, 0);
  const previousPurchaseValue = previousPurchases.reduce(
    (sum, purchase) => sum + purchase.totalAmount,
    0,
  );

  let cogs = 0;
  let cogsEstimated = false;
  for (const sale of currentSales) {
    const result = saleCostOfGoods(sale, catalog);
    cogs += result.cogs;
    if (result.estimated) {
      cogsEstimated = true;
    }
  }

  const inventory = inventoryValueAtCost(catalog);

  return {
    revenue,
    purchases: purchaseValue,
    grossProfit: revenue - cogs,
    inventoryValue: inventory.value,
    inventoryEstimated: inventory.estimated,
    cogsEstimated,
    revenueChange: percentChange(revenue, previousRevenue),
    purchasesChange: percentChange(purchaseValue, previousPurchaseValue),
    profitChange: percentChange(
      revenue - cogs,
      previousSales.reduce((sum, sale) => {
        return sum + sale.totalAmount - saleCostOfGoods(sale, catalog).cogs;
      }, 0),
    ),
  };
}

function bucketKey(isoDate: string, monthly: boolean): string {
  return monthly ? isoDate.slice(0, 7) : isoDate.slice(0, 10);
}

function bucketLabel(key: string, monthly: boolean): string {
  if (monthly) {
    const date = new Date(`${key}-01T00:00:00.000Z`);
    return new Intl.DateTimeFormat("en-GB", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(date);
  }
  return formatChartTick(`${key}T00:00:00.000Z`);
}

function enumerateBuckets(start: Date, end: Date, monthly: boolean): string[] {
  const keys: string[] = [];
  if (monthly) {
    const cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
    const last = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1));
    while (cursor.getTime() <= last.getTime()) {
      keys.push(cursor.toISOString().slice(0, 7));
      cursor.setUTCMonth(cursor.getUTCMonth() + 1);
    }
    return keys;
  }

  const cursor = new Date(start);
  cursor.setUTCHours(0, 0, 0, 0);
  const last = new Date(end);
  last.setUTCHours(23, 59, 59, 999);
  while (cursor.getTime() <= last.getTime()) {
    keys.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return keys;
}

export function derivePerformanceSeries(input: {
  sales: Sale[];
  purchases: Purchase[];
  range: AnalyticsRange;
}): TimeSeriesPoint[] {
  const monthly = rangeUsesMonthlyBuckets(input.range);
  const { start, end } = getAnalyticsBounds(input.range);
  const salesMap = new Map<string, { amount: number; orders: number }>();
  const purchaseMap = new Map<string, number>();

  for (const sale of completedSalesInRange(input.sales, input.range)) {
    const key = bucketKey(sale.date, monthly);
    const current = salesMap.get(key) ?? { amount: 0, orders: 0 };
    current.amount += sale.totalAmount;
    current.orders += 1;
    salesMap.set(key, current);
  }

  for (const purchase of countedPurchasesInRange(input.purchases, input.range)) {
    const key = bucketKey(purchase.date, monthly);
    purchaseMap.set(key, (purchaseMap.get(key) ?? 0) + purchase.totalAmount);
  }

  return enumerateBuckets(start, end, monthly).map((key) => ({
    date: key,
    label: bucketLabel(key, monthly),
    sales: salesMap.get(key)?.amount ?? 0,
    orders: salesMap.get(key)?.orders ?? 0,
    purchases: purchaseMap.get(key) ?? 0,
  }));
}

export function deriveTopProducts(input: {
  sales: Sale[];
  products: Product[];
  range: AnalyticsRange;
  limit?: number;
}): TopProductRow[] {
  const catalog = getActiveProducts(input.products);
  const totals = new Map<string, { units: number; revenue: number }>();

  for (const sale of completedSalesInRange(input.sales, input.range)) {
    for (const item of sale.items) {
      const current = totals.get(item.productId) ?? { units: 0, revenue: 0 };
      current.units += item.quantity;
      current.revenue += item.lineTotal;
      totals.set(item.productId, current);
    }
  }

  const revenueTotal = [...totals.values()].reduce((sum, item) => sum + item.revenue, 0) || 1;
  return [...totals.entries()]
    .map(([productId, stats]) => {
      const product = catalog.find((entry) => entry.id === productId);
      return {
        productId,
        name: product?.name ?? "Product",
        sku: product?.sku ?? "—",
        unitsSold: stats.units,
        revenue: stats.revenue,
        share: (stats.revenue / revenueTotal) * 100,
        stock: product?.quantity ?? 0,
      };
    })
    .sort((left, right) => right.unitsSold - left.unitsSold || right.revenue - left.revenue)
    .slice(0, input.limit ?? 8);
}

export function deriveSalesReport(input: {
  sales: Sale[];
  products: Product[];
  range: AnalyticsRange;
}) {
  const completed = completedSalesInRange(input.sales, input.range);
  const previous = completedSalesInRange(input.sales, input.range, true);
  const { start, end } = getAnalyticsBounds(input.range);
  const inRange = input.sales.filter((sale) => isWithinRange(sale.date, start, end));
  const revenue = completed.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const previousRevenue = previous.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const itemsSold = completed.reduce((sum, sale) => sum + saleItemCount(sale), 0);
  const pendingPayments = completed
    .filter((sale) => sale.paymentStatus !== "paid")
    .reduce((sum, sale) => sum + sale.remainingBalance, 0);

  const paymentSlices: PaymentSlice[] = (
    [
      { key: "paid", label: "Paid", color: "#16A36A" },
      { key: "partial", label: "Partial", color: "#E9A23B" },
      { key: "unpaid", label: "Unpaid", color: "#DC5555" },
    ] as const
  ).map((slice) => {
    const matching = inRange.filter(
      (sale) => sale.status !== "cancelled" && sale.paymentStatus === slice.key,
    );
    return {
      ...slice,
      count: matching.length,
      amount: matching.reduce((sum, sale) => sum + sale.totalAmount, 0),
      percent: 0,
    };
  });
  const paymentTotal = paymentSlices.reduce((sum, slice) => sum + slice.count, 0) || 1;
  for (const slice of paymentSlices) {
    slice.percent = (slice.count / paymentTotal) * 100;
  }

  return {
    revenue,
    orders: completed.length,
    averageOrderValue: completed.length === 0 ? 0 : revenue / completed.length,
    itemsSold,
    pendingPayments,
    revenueChange: percentChange(revenue, previousRevenue),
    ordersChange: percentChange(completed.length, previous.length),
    paymentSlices,
  };
}

export function derivePurchaseReport(input: {
  purchases: Purchase[];
  range: AnalyticsRange;
}) {
  const current = countedPurchasesInRange(input.purchases, input.range);
  const previous = countedPurchasesInRange(input.purchases, input.range, true);
  const value = current.reduce((sum, purchase) => sum + purchase.totalAmount, 0);
  const previousValue = previous.reduce((sum, purchase) => sum + purchase.totalAmount, 0);
  const receivedValue = current
    .filter((purchase) => purchase.status === "received")
    .reduce((sum, purchase) => sum + purchase.totalAmount, 0);

  return {
    totalValue: value,
    orderCount: current.length,
    receivedCount: current.filter((purchase) => purchase.status === "received").length,
    pendingCount: current.filter(
      (purchase) =>
        purchase.status === "ordered" || purchase.status === "partially_received",
    ).length,
    pendingPayments: current
      .filter((purchase) => purchase.paymentStatus !== "paid")
      .reduce((sum, purchase) => sum + purchase.remainingBalance, 0),
    receivedValue,
    valueChange: percentChange(value, previousValue),
    ordersChange: percentChange(current.length, previous.length),
  };
}

export function deriveSupplierRows(
  purchases: Purchase[],
  suppliers: Supplier[],
  range: AnalyticsRange,
): SupplierReportRow[] {
  const current = countedPurchasesInRange(purchases, range);
  const bySupplier = new Map<string, SupplierReportRow>();

  for (const purchase of current) {
    const existing = bySupplier.get(purchase.supplierId) ?? {
      supplierId: purchase.supplierId,
      name: supplierName(suppliers, purchase.supplierId),
      orderCount: 0,
      totalValue: 0,
      receivedCount: 0,
      pendingCount: 0,
      outstanding: 0,
    };
    existing.orderCount += 1;
    existing.totalValue += purchase.totalAmount;
    existing.outstanding += purchase.remainingBalance;
    if (purchase.status === "received") {
      existing.receivedCount += 1;
    }
    if (purchase.status === "ordered" || purchase.status === "partially_received") {
      existing.pendingCount += 1;
    }
    bySupplier.set(purchase.supplierId, existing);
  }

  return [...bySupplier.values()].sort((left, right) => right.totalValue - left.totalValue);
}

export function deriveStockReport(products: Product[]) {
  const catalog = getCatalogProducts(products);
  const inventory = inventoryValueAtCost(catalog);
  const slices = deriveStockStatus(catalog);
  const byCategory = new Map<string, CategoryValueRow>();

  for (const product of catalog) {
    const current = byCategory.get(product.category) ?? {
      category: product.category,
      value: 0,
      units: 0,
    };
    current.value += product.quantity * productUnitCost(product).cost;
    current.units += product.quantity;
    byCategory.set(product.category, current);
  }

  return {
    totalProducts: catalog.length,
    totalUnits: getTotalUnits(catalog),
    inStock: getInStockProducts(catalog).length,
    lowStock: getLowStockProducts(catalog).length,
    outOfStock: getOutOfStockProducts(catalog).length,
    inventoryValue: inventory.value,
    inventoryEstimated: inventory.estimated,
    slices,
    categoryValues: [...byCategory.values()].sort((left, right) => right.value - left.value),
  };
}

export function movementKind(movement: StockMovement): MovementKind {
  if (movement.type === "purchase") {
    return "purchase";
  }
  if (movement.type === "sale") {
    return "sale";
  }
  return movement.quantityChange >= 0 ? "adjustment_in" : "adjustment_out";
}

export const movementKindLabel: Record<MovementKind, string> = {
  purchase: "Purchase",
  sale: "Sale",
  adjustment_in: "Adjustment In",
  adjustment_out: "Adjustment Out",
};

export function deriveMovementSummary(
  movements: StockMovement[],
  range: AnalyticsRange,
) {
  const { start, end } = getAnalyticsBounds(range);
  const inRange = movements.filter((movement) =>
    isWithinRange(movement.createdAt, start, end),
  );
  const stockIn = inRange
    .filter((movement) => movement.quantityChange > 0)
    .reduce((sum, movement) => sum + movement.quantityChange, 0);
  const stockOut = inRange
    .filter((movement) => movement.quantityChange < 0)
    .reduce((sum, movement) => sum + Math.abs(movement.quantityChange), 0);

  return {
    stockIn,
    stockOut,
    purchaseReceipts: inRange
      .filter((movement) => movement.type === "purchase")
      .reduce((sum, movement) => sum + Math.abs(movement.quantityChange), 0),
    salesDeductions: inRange
      .filter((movement) => movement.type === "sale")
      .reduce((sum, movement) => sum + Math.abs(movement.quantityChange), 0),
    adjustments: inRange
      .filter((movement) => movement.type === "adjustment")
      .reduce((sum, movement) => sum + Math.abs(movement.quantityChange), 0),
  };
}

export function filterReportSales(
  sales: Sale[],
  customers: Customer[],
  range: AnalyticsRange,
  filters: {
    search: string;
    paymentStatus: PaymentStatus | "all";
    saleStatus: SaleStatus | "all";
  },
): Sale[] {
  const { start, end } = getAnalyticsBounds(range);
  const query = filters.search.trim().toLowerCase();
  return sales.filter((sale) => {
    if (!isWithinRange(sale.date, start, end)) {
      return false;
    }
    if (filters.paymentStatus !== "all" && sale.paymentStatus !== filters.paymentStatus) {
      return false;
    }
    if (filters.saleStatus !== "all" && sale.status !== filters.saleStatus) {
      return false;
    }
    if (query) {
      const name =
        customers.find((customer) => customer.id === sale.customerId)?.name ?? "";
      if (!`${sale.invoiceNumber} ${name}`.toLowerCase().includes(query)) {
        return false;
      }
    }
    return true;
  });
}

export function filterReportPurchases(
  purchases: Purchase[],
  suppliers: Supplier[],
  range: AnalyticsRange,
  filters: { search: string; status: Purchase["status"] | "all"; paymentStatus: PaymentStatus | "all" },
): Purchase[] {
  const { start, end } = getAnalyticsBounds(range);
  const query = filters.search.trim().toLowerCase();
  return purchases.filter((purchase) => {
    if (!isWithinRange(purchase.date, start, end)) {
      return false;
    }
    if (filters.status !== "all" && purchase.status !== filters.status) {
      return false;
    }
    if (filters.paymentStatus !== "all" && purchase.paymentStatus !== filters.paymentStatus) {
      return false;
    }
    if (query) {
      const name = supplierName(suppliers, purchase.supplierId);
      if (!`${purchase.purchaseOrderNumber} ${name}`.toLowerCase().includes(query)) {
        return false;
      }
    }
    return true;
  });
}

export function filterReportStock(
  products: Product[],
  filters: {
    search: string;
    category: ProductCategory | "all";
    status: StockStatus | "all";
    attentionOnly: boolean;
  },
): Product[] {
  const query = filters.search.trim().toLowerCase();
  return getCatalogProducts(products).filter((product) => {
    if (query && !`${product.name} ${product.sku}`.toLowerCase().includes(query)) {
      return false;
    }
    if (filters.category !== "all" && product.category !== filters.category) {
      return false;
    }
    const status = getStockStatus(product);
    if (filters.status !== "all" && status !== filters.status) {
      return false;
    }
    if (filters.attentionOnly && status === "in_stock") {
      return false;
    }
    return true;
  });
}

export function filterReportMovements(
  movements: StockMovement[],
  products: Product[],
  range: AnalyticsRange,
  filters: {
    search: string;
    kind: MovementKind | "all";
    productId: string | "all";
    reference: string;
  },
): StockMovement[] {
  const { start, end } = getAnalyticsBounds(range);
  const query = filters.search.trim().toLowerCase();
  const seen = new Set<string>();

  return movements.filter((movement) => {
    if (seen.has(movement.id)) {
      return false;
    }
    seen.add(movement.id);
    if (!isWithinRange(movement.createdAt, start, end)) {
      return false;
    }
    if (filters.kind !== "all" && movementKind(movement) !== filters.kind) {
      return false;
    }
    if (filters.productId !== "all" && movement.productId !== filters.productId) {
      return false;
    }
    if (
      filters.reference.trim() &&
      !movement.referenceId.toLowerCase().includes(filters.reference.trim().toLowerCase())
    ) {
      return false;
    }
    if (query) {
      const product = products.find((entry) => entry.id === movement.productId);
      const haystack = `${product?.name ?? ""} ${product?.sku ?? ""} ${movement.referenceId} ${movement.remarks}`.toLowerCase();
      if (!haystack.includes(query)) {
        return false;
      }
    }
    return true;
  });
}

export function activitiesInRange(activities: Activity[], range: AnalyticsRange): Activity[] {
  const { start, end } = getAnalyticsBounds(range);
  return activities
    .filter((activity) => isWithinRange(activity.createdAt, start, end))
    .slice(0, 8);
}

export { countedPurchases, orderedQuantity, receivedQuantity };
