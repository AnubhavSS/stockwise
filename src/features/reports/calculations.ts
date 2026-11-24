/**
 * Report business rules.
 *
 * Revenue = completed sales only.
 * Purchase value = ordered / partially received / received (never draft or cancelled).
 * Gross profit = revenue − COGS, not revenue − purchase spend.
 * If a product has no costPrice, COGS uses 62% of selling price and is flagged estimated.
 */
import type { Product } from "@/types/inventory";
import type { Purchase } from "@/types/purchase";
import type { Sale } from "@/types/sales";

export const COUNTED_PURCHASE_STATUSES: Purchase["status"][] = [
  "ordered",
  "partially_received",
  "received",
];

export function isCountedPurchase(purchase: Purchase): boolean {
  return COUNTED_PURCHASE_STATUSES.includes(purchase.status);
}

export function isCompletedSale(sale: Sale): boolean {
  return sale.status === "completed";
}

/** Unit cost for inventory value and COGS. Missing cost is an explicit estimate. */
export function productUnitCost(product: Pick<Product, "unitPrice" | "costPrice">): {
  cost: number;
  estimated: boolean;
} {
  if (product.costPrice !== undefined && product.costPrice > 0) {
    return { cost: product.costPrice, estimated: false };
  }
  return { cost: Math.round(product.unitPrice * 0.62), estimated: true };
}

export function inventoryValueAtCost(products: Product[]): {
  value: number;
  estimated: boolean;
} {
  let estimated = false;
  const value = products.reduce((sum, product) => {
    const unit = productUnitCost(product);
    if (unit.estimated) {
      estimated = true;
    }
    return sum + product.quantity * unit.cost;
  }, 0);
  return { value, estimated };
}

export function saleCostOfGoods(
  sale: Sale,
  products: Product[],
): { cogs: number; estimated: boolean } {
  let estimated = false;
  const cogs = sale.items.reduce((sum, item) => {
    const product = products.find((entry) => entry.id === item.productId);
    if (!product) {
      estimated = true;
      return sum;
    }
    const unit = productUnitCost(product);
    if (unit.estimated) {
      estimated = true;
    }
    return sum + item.quantity * unit.cost;
  }, 0);
  return { cogs, estimated };
}

export function saleItemCount(sale: Pick<Sale, "items">): number {
  return sale.items.reduce((sum, item) => sum + item.quantity, 0);
}
