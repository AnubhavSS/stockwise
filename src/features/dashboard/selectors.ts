import {
  calculateInventoryValue,
  getLowStockProducts,
  sumPurchaseTotals,
  sumSaleTotals,
} from "@/lib/calculations";
import type { DashboardStats } from "@/types/common";
import type { Product } from "@/types/inventory";
import type { Purchase } from "@/types/purchase";
import type { Sale } from "@/types/sales";

function isInCurrentMonth(isoDate: string): boolean {
  const date = new Date(isoDate);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  );
}

export function deriveDashboardStats(input: {
  products: Product[];
  sales: Sale[];
  purchases: Purchase[];
}): DashboardStats {
  const monthlySales = input.sales.filter((sale) => isInCurrentMonth(sale.date));
  const monthlyPurchases = input.purchases.filter((purchase) =>
    isInCurrentMonth(purchase.expectedDate),
  );

  return {
    totalProducts: input.products.length,
    totalStockQuantity: input.products.reduce(
      (sum, product) => sum + product.quantity,
      0,
    ),
    inventoryValue: calculateInventoryValue(input.products),
    lowStockCount: getLowStockProducts(input.products).length,
    openSalesCount: input.sales.filter(
      (sale) => sale.status === "draft" || sale.status === "confirmed",
    ).length,
    openPurchaseCount: input.purchases.filter(
      (purchase) =>
        purchase.status === "ordered" || purchase.status === "partially_received",
    ).length,
    monthlySalesTotal: sumSaleTotals(monthlySales),
    monthlyPurchaseTotal: sumPurchaseTotals(monthlyPurchases),
  };
}
